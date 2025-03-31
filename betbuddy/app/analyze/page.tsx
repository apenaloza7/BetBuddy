"use client";

import { useState } from 'react';
import Link from 'next/link';
import { UploadForm } from '@/components/upload-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type AnalysisResult = {
  status: string;
  claudeAnalysis: any;
  perplexityAnalysis: string;
  citations?: string[];
};

type BetAnalysis = {
  total_odds: string;
  wager_amount: string | number;
  potential_payout: string | number;
  legs: {
    leg_id: number;
    event: string;
    bet_type: string;
    selection: string;
    odds: string;
    analysis: {
      current_form?: string;
      h2h_history?: string;
      injuries?: string;
      home_advantage?: string;
      key_stats?: string;
      primary_factors?: string;
      key_risks?: string;
      [key: string]: string | undefined;
    };
  }[];
  parlay_analysis: {
    total_legs: number;
    risk_assessment: string;
    comprehensive_analysis: string;
  };
  sportsbook: string;
  cash_out_offer?: string | number;
  citations?: string[];
};

const getRiskColor = (risk: string) => {
  const lowerRisk = risk.toLowerCase();
  if (lowerRisk.includes('high')) return 'text-red-500';
  if (lowerRisk.includes('medium')) return 'text-amber-500';
  if (lowerRisk.includes('low')) return 'text-green-500';
  return 'text-blue-500';
};

// Function to extract and sanitize JSON from potential code blocks
const sanitizeJsonInput = (input: string): string => {
  console.log("Input to sanitize:", input.substring(0, 100) + "...");
  
  // First try to extract JSON from markdown code blocks
  const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
  const match = input.match(jsonBlockRegex);
  
  if (match && match[1]) {
    console.log("Found JSON code block, extracting content");
    return match[1].trim();
  }
  
  // If no code blocks found, try to extract just the JSON object
  // This looks for anything that starts with { and ends with }
  const jsonObjectRegex = /(\{[\s\S]*\})/;
  const objectMatch = input.match(jsonObjectRegex);
  
  if (objectMatch && objectMatch[1]) {
    console.log("Found JSON object, extracting content");
    return objectMatch[1].trim();
  }
  
  // If nothing else worked, just return the original input after trimming
  return input.trim();
};

// Helper function to render markdown-like content
const renderMarkdown = (text: any) => {
  if (!text) return null;
  
  // Only apply markdown formatting if text is a string
  if (typeof text === 'string') {
    // Handle bold text with **text**
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle newlines with <br/>
    formattedText = formattedText.replace(/\\n/g, '<br/>');
    
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  }
  
  // If it's not a string (e.g., an object), return it as is
  return <div>{JSON.stringify(text)}</div>;
};

// Helper function to recursively render nested analysis objects
const renderAnalysisField = (key: string, value: any) => {
  // Skip if no value
  if (!value) return null;
  
  // Format the key for display
  const formattedKey = key.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // If value is an object, recursively render its fields
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <div key={key} className="mb-4">
        <h5 className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-2">{formattedKey}</h5>
        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          {Object.entries(value).map(([subKey, subValue]) => 
            renderAnalysisField(subKey, subValue)
          )}
        </div>
      </div>
    );
  }
  
  // For string values, render normally
  return (
    <div key={key} className="mb-3">
      <h5 className="font-medium text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{formattedKey}</h5>
      <div className="text-sm">{renderMarkdown(value)}</div>
    </div>
  );
};

const BetAnalysisDisplay = ({ 
  analysisJson, 
  citations 
}: { 
  analysisJson: string,
  citations?: string[]
}) => {
  let analysis: BetAnalysis;
  
  try {
    // The perplexityAnalysis is a string that contains a JSON object
    console.log("Raw perplexityAnalysis:", analysisJson);
    
    // Sanitize the input to handle code blocks or other formatting
    const sanitizedJson = sanitizeJsonInput(analysisJson);
    console.log("Sanitized JSON:", sanitizedJson);
    
    try {
      // First, try to parse it as JSON
      analysis = JSON.parse(sanitizedJson);
      console.log("Parsed analysis:", analysis);
      
      // Add citations if they were provided separately
      if (citations && citations.length > 0 && !analysis.citations) {
        analysis.citations = citations;
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
      
      // If it's not valid JSON, show the error with raw text
      throw new Error("Invalid JSON format in analysis data");
    }
    
    // Validate the data structure
    if (!analysis || !analysis.legs || !Array.isArray(analysis.legs) || !analysis.parlay_analysis) {
      throw new Error("Analysis data doesn't match the expected structure");
    }
  } catch (e) {
    console.error("Error processing analysis data:", e);
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
          <h3 className="text-red-600 dark:text-red-400 font-medium">Error processing analysis data</h3>
          <p className="text-sm mt-1">{e instanceof Error ? e.message : "Unknown error"}</p>
        </div>
        <div className="bg-muted p-4 rounded-md">
          <h4 className="font-medium mb-2">Raw Response:</h4>
          <pre className="text-xs overflow-auto max-h-[400px] p-2 bg-muted/50 rounded">
            {analysisJson}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-sm">Sportsbook</span>
            <span className="text-lg font-bold">{analysis.sportsbook || "Not specified"}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-sm">Wager</span>
            <span className="text-lg font-bold">
              {typeof analysis.wager_amount !== 'undefined' && analysis.wager_amount !== null && analysis.wager_amount !== '' ? `$${analysis.wager_amount}` : "Not specified"}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-sm">Potential Payout</span>
            <span className={`text-lg font-bold ${typeof analysis.potential_payout !== 'undefined' && analysis.potential_payout !== null && analysis.potential_payout !== '' ? 'text-green-500' : ''}`}>
              {typeof analysis.potential_payout !== 'undefined' && analysis.potential_payout !== null && analysis.potential_payout !== '' ? `$${analysis.potential_payout}` : "Not specified"}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-sm">Total Odds</span>
            <span className="text-lg font-bold">{analysis.total_odds || "Not specified"}</span>
          </div>
        </div>
      </div>

      {/* Overall parlay analysis */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-xl font-bold">Parlay Overview</h3>
        </div>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">Risk Assessment:</span>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.parlay_analysis?.risk_assessment || "")}`}>
              {analysis.parlay_analysis?.risk_assessment || "Not specified"}
            </span>
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">Total Legs:</span>
            <span>{analysis.parlay_analysis?.total_legs || "Not specified"}</span>
          </div>
          <div className="flex items-center mb-2">
            <span className="font-medium mr-2">Cash Out Offer:</span>
            <span>
              {typeof analysis.cash_out_offer !== 'undefined' && analysis.cash_out_offer !== null && analysis.cash_out_offer !== '' ? `$${analysis.cash_out_offer}` : "Not specified"}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <h4 className="font-medium mb-2">Comprehensive Analysis</h4>
          <p className="text-gray-600 dark:text-gray-300">
            {analysis.parlay_analysis?.comprehensive_analysis || "No comprehensive analysis available"}
          </p>
        </div>
      </Card>

      {/* Individual legs */}
      <h3 className="text-xl font-bold mt-8 mb-4">Bet Details</h3>
      <div className="space-y-4">
        {(analysis.legs || []).map((leg) => (
          <details key={leg.leg_id || `leg-${Math.random()}`} className="group border rounded-lg overflow-hidden">
            <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between">
              <div className="flex-1 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="font-medium">{leg.event || "Unknown Event"}</div>
                <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full">
                    {leg.bet_type || "Unknown Bet Type"}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm rounded-full">
                    {leg.odds || "Odds N/A"}
                  </span>
                </div>
              </div>
            </summary>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="font-medium mb-1">Selection</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-md inline-block w-fit">
                    {leg.selection || "Not Specified"}
                  </span>
                </div>
                
                {/* Single analysis field with markdown support */}
                {leg.analysis && (
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Analysis</h4>
                    <div className="text-gray-600 dark:text-gray-300">
                      {typeof leg.analysis === 'string' 
                        ? renderMarkdown(leg.analysis)
                        : Object.entries(leg.analysis).map(([key, value]) => {
                            // Skip if key is numeric or has no value
                            if (!isNaN(Number(key)) || !value) return null;
                            
                            return renderAnalysisField(key, value);
                          })
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
      
      {/* Citations/Sources section */}
      {analysis.citations && analysis.citations.length > 0 && (
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Sources & References</h3>
            <div className="space-y-2">
              {analysis.citations.map((citation, index) => (
                <div key={index} className="text-sm">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs mr-2">
                    {index + 1}
                  </span>
                  <a 
                    href={citation} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {citation}
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (analysis: AnalysisResult) => {
    console.log("Analysis complete:", analysis);
    setResult(analysis);
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Upload Your Parlay Slip</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6">
        {!result ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">How it works</h2>
              <p className="text-muted-foreground">
                Upload a clear photo of your parlay slip. Our AI will analyze each leg of your bet and provide insights and confidence ratings.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
                {error}
              </div>
            )}

            <UploadForm
              onUploadStart={() => {
                setIsLoading(true);
                setError(null);
              }}
              onUploadComplete={handleAnalysisComplete}
              onUploadError={(error) => {
                setIsLoading(false);
                setError(error);
              }}
            />

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Tips for best results:</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Make sure the entire slip is visible in the photo</li>
                <li>Ensure good lighting to avoid shadows</li>
                <li>Avoid blurry images - take a clear, focused photo</li>
                <li>Include all relevant information (teams, odds, bet type)</li>
              </ul>
            </div>
          </>
        ) : (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <Button 
                variant="outline" 
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
              >
                Analyze Another Slip
              </Button>
            </div>
            
            <BetAnalysisDisplay 
              analysisJson={result.perplexityAnalysis}
              citations={result.citations} 
            />
          </Card>
        )}
      </div>
    </div>
  );
} 