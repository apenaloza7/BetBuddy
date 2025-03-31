"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface UploadFormProps {
  onUploadStart: () => void;
  onUploadComplete: (analysis: any) => void;
  onUploadError: (error: string) => void;
}

export function UploadForm({ onUploadStart, onUploadComplete, onUploadError }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      onUploadError('Please select an image to upload');
      return;
    }

    try {
      setIsUploading(true);
      onUploadStart();

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length')
      });
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText.substring(0, 500) + '...');
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
        console.log('Response structure:', {
          isObject: typeof responseData === 'object',
          hasStatus: 'status' in responseData,
          statusValue: responseData.status,
          hasPerplexityAnalysis: 'perplexityAnalysis' in responseData,
          perplexityAnalysisType: typeof responseData.perplexityAnalysis
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP Error: ${response.status}`);
      }
      
      // Less strict validation
      if (responseData && typeof responseData === 'object') {
        if (responseData.status === 'error') {
          throw new Error(responseData.error || 'Analysis failed');
        } else if (responseData.perplexityAnalysis && responseData.status === 'complete') {
          console.log('Validation passed, calling onUploadComplete');
          onUploadComplete(responseData);
        } else {
          console.error('Failed validation:', {
            hasPerplexityAnalysis: Boolean(responseData.perplexityAnalysis),
            statusValue: responseData.status
          });
          throw new Error('API response missing required data');
        }
      } else {
        console.error('Invalid response type:', typeof responseData, responseData);
        throw new Error('Invalid response from analysis API');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      onUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!preview ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
              <line x1="16" x2="22" y1="5" y2="5"></line>
              <line x1="19" x2="19" y1="2" y2="8"></line>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
            <div>
              <p className="font-medium">Drag & drop your parlay slip image here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WEBP</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border">
          <div className="aspect-video relative">
            <Image 
              src={preview} 
              alt="Parlay slip preview" 
              fill 
              className="object-contain"
            />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="absolute top-2 right-2"
            onClick={handleReset}
          >
            Change Image
          </Button>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        {preview && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
            disabled={isUploading}
          >
            Reset
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={!file || isUploading}
          className="min-w-[120px]"
        >
          {isUploading ? 'Analyzing...' : 'Analyze Slip'}
        </Button>
      </div>
    </form>
  );
} 