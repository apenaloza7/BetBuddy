import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { parseClaudeResponse } from '@/lib/claude-parser';

// In-memory storage for analysis results (for development only)
// In a production app, you would use a database
export const analysisResults = new Map();

// Initialize Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
  },
};

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data to get the image
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image || !(image instanceof Blob)) {
      return NextResponse.json(
        { error: 'No image provided or invalid image format' },
        { status: 400 }
      );
    }

    console.log('Sending image to Claude API for analysis...');
    
    // Convert the image to base64
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    // Determine the media type and ensure it's one of the supported formats
    let mediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg";
    
    if (image.type === "image/png") {
      mediaType = "image/png";
    } else if (image.type === "image/webp") {
      mediaType = "image/webp";
    }
    
    // Send the image to Claude for analysis
    const claudeResponse = await anthropic.messages.create({
      model: "claude-3-7-sonnet-latest",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert betting analyst. Your job is to analyze bet slips from your customers. Return a summary of the bet slip in a JSON object.
              Before you do any kind of analysis on the bet slip, check the image and MAKE SURE it is a bet slip. 
              If you cannot 100% determine if it is a valid bet slip, do not do the analysis, stop what 
              you're doing and return "INVALID BET SLIP". Do not describe under any circumstances what 
              is in the image they submitted. If you find that the user did not submit a bet slip, simply and ONLY return "INVALID BET SLIP".
              The final part of the JSON Object should be formatted as follows in the following example:
              "type": "Parlay",
              "description": "3 Pick Parlay",
              "parlayOdds": +516,
              "stakeAmount": "Not specified",
              "platform": "DraftKings"`
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image
              }
            }
          ]
        }
      ]
    });

    // Get Claude's response
    const claudeAnalysis = claudeResponse.content[0].text;
    console.log('Raw Claude response:', claudeAnalysis);

    // Check if Claude identified this as an invalid bet slip
    if (claudeAnalysis === "INVALID BET SLIP") {
      return NextResponse.json({
        status: 'error',
        error: 'Invalid bet slip. Please submit a valid betting slip image.'
      }, { status: 400 });
    }

    // Clean up Claude's response by removing markdown code block formatting if present
    const cleanedResponse = claudeAnalysis
      .replace(/```json\n?/g, '')  // Remove opening ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim();                     // Remove any extra whitespace

    // Additional cleaning to handle plus signs in odds values
    const fixedResponse = cleanedResponse
      .replace(/("odds"\s*:\s*)\+(\d+)/g, '$1"+$2"')       // Convert "odds": +102 to "odds": "+102"
      .replace(/("parlayOdds"\s*:\s*)\+(\d+)/g, '$1"+$2"') // Convert "parlay_odds": +102 to "parlay_odds": "+102"
      .replace(/("type"\s*:\s*"[^"]*"\s*,\s*"odds"\s*:\s*)\+(\d+)/g, '$1"+$2"'); // Also handle nested odds in parlay objects

    console.log('Cleaned response:', fixedResponse);
      
    // Parse the cleaned Claude JSON response
    let betSlipData;
    try {
      betSlipData = JSON.parse(fixedResponse);
    } catch (error) {
      console.error('Error parsing Claude analysis as JSON:', error);
      console.error('Cleaned response:', fixedResponse);
      return NextResponse.json({
        status: 'error',
        error: 'Invalid bet slip data format'
      }, { status: 400 });
    }

    // Call Perplexity Sonar API
    console.log('Calling Perplexity API for analysis...');
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "sonar-deep-research",
        messages: [
          {
            role: "user",
            content: `You are an expert betting analyst with extensive experience in sports analytics. 
            Your job is to analyze bet slips from customers and provide a detailed analysis given the following JSON data.
            Utilize the web to find the most relevant information and most importantly current and up to date sites that pertains to the legs of the bet slip.

                      Provide a comprehensive analysis of each parlay leg including:

                      1. Individual Game/Match Analysis:
                        - Current form and momentum of teams/players
                        - Head-to-head historical performance (last 5-10 matchups)
                        - Injury reports and player availability
                        - Weather conditions (if applicable)
                        - Home/away performance statistics
                        - Recent schedule difficulty and fatigue factors

                      2. Statistical Breakdown:
                        - Relevant team/player statistics for the specific bet type
                        - League-wide trends that may impact the outcome
                        - Historical performance in similar situations
                        - Key matchup advantages/disadvantages

                      3. External Factors:
                        - Travel impact
                        - Rest days between games
                        - Stadium/venue considerations
                        - Referee assignments (if significant)
                        - Public betting trends and line movements

                      For each leg, provide:
                      - Primary factors supporting the bet
                      - Key risk factors to consider

                      Conclude with a final assessment of the entire parlay and any recommendations for risk management.

                      Return the analysis in a JSON object similar to the structure of the following bet slip (NOT ALL DATA IS NEEDED, ONLY USE WHAT YOU HAVE):

                      <EXAMPLE>

                      REMEMBER THIS IS AN EXAMPLE AND NOT A REAL BET SLIP. THIS IS ONLY FOR YOU TO UNDERSTAND THE STRUCTURE OF THE JSON OBJECT. DO NOT USE THIS EXAMPLE IN YOUR RESPONSE UNDER ANY CIRCUMSTANCES.
                      If you feel that there is something else you could add to the analysis, add it to the "analysis(for the leg) / comprehensive_analysis(for the entire bet slip)" field.

                      {
                        "total_odds": "+1200",
                        "wager_amount": 50,
                        "potential_payout": 650,
                        "legs": [
                          {
                            "leg_id": 1,
                            "event": "Los Angeles Lakers vs. Golden State Warriors",
                            "bet_type": "Spread",
                            "selection": "Lakers -3.5",
                            "odds": "-110",
                            "result": "Pending",
                            "analysis": "(This is the analysis for the leg, not the entire bet slip, do not include the entire bet slip in your response.)"
                          },
                          {
                            "leg_id": 2,
                            "event": "Kansas City Chiefs vs. Buffalo Bills",
                            "bet_type": "Moneyline",
                            "selection": "Chiefs ML",
                            "odds": "+150",
                            "result": "Win",
                            "analysis": "(This is the analysis for the leg, not the entire bet slip, do not include the entire bet slip in your response.)"
                          },
                          {
                            "leg_id": 3,
                            "event": "Boston Red Sox vs. New York Yankees",
                            "bet_type": "Total",
                            "selection": "Over 8.5",
                            "odds": "-105",
                            "result": "Loss",
                            "analysis": "(This is the analysis for the leg, not the entire bet slip, do not include the entire bet slip in your response.)"
                          }
                        ],
                        "parlay_analysis": {
                          "total_legs": 3,
                          "pending_legs": 1,
                          "won_legs": 1,
                          "lost_legs": 1,
                          "risk_assessment": "High Risk - 3+ leg parlay with mixed odds",
                          "comprehensive_analysis": "This is where you would include your comprehensive analysis of the entire bet slip. Include your overall opinion on the bet slip. Refrain from giving any reccomendations/advice on what the user should do, just provide the analysis."
                        },
                        "sportsbook": "FanDuel",
                        "cash_out_offer": 75.00
                      }

                      </EXAMPLE>

                      ONCE YOU HAVE DONE YOUR ANALYSIS, RETURN THE JSON OBJECT STRICTLY IN THE FORMAT YOU JUST SAW IN THE EXAMPLE.Do not return it in any other format.

                      Here's the bet slip data: ${JSON.stringify(betSlipData, null, 2)}`

          }
        ]
      })
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Failed to get analysis from Perplexity: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    
    // Log the full response to understand the structure
    console.log('Perplexity API response:', JSON.stringify(perplexityData, null, 2));

    if (!perplexityData?.choices?.[0]?.message?.content) {
      console.error('Invalid or missing content in Perplexity API response:', perplexityData);
      throw new Error('Could not extract analysis from Perplexity response');
    }

    const analysisText = perplexityData.choices[0].message.content;
    console.log('Successfully received Perplexity analysis');

    // Return both the Claude and Perplexity analysis in the expected format
    const responseData = {
      status: 'complete',
      claudeAnalysis: betSlipData,
      perplexityAnalysis: analysisText,
      citations: perplexityData.citations || []
    };
    
    console.log('Sending response to client:', JSON.stringify(responseData));
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error processing image:', error);
    
    // Create a structured error response
    const errorResponse = { 
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to process image'
    };
    
    console.log('Sending error response:', errorResponse);
    
    return NextResponse.json(
      errorResponse,
      { status: 500 }
    );
  }
} 