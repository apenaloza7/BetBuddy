/**
 * Parses the Claude API response text into a simplified format
 */
export function parseClaudeResponse(responseText: string) {
  try {
    // Initialize basic result structure
    const result = {
      overallGrade: 'B',  // Default grade
      overallConfidence: 50, // Default confidence
      summary: responseText // Store the entire response
    };

    // Try to extract overall confidence if available
    const confidenceMatch = responseText.match(/probability:\s*(?:approximately\s*)?(\d+)(?:\/10|\s*%)/i);
    if (confidenceMatch) {
      result.overallConfidence = parseInt(confidenceMatch[1], 10);
      if (confidenceMatch[0].includes('/10')) {
        result.overallConfidence *= 10; // Convert from 0-10 scale to percentage
      }
    }

    // Set overall grade based on confidence
    if (result.overallConfidence >= 80) result.overallGrade = 'A';
    else if (result.overallConfidence >= 70) result.overallGrade = 'B';
    else if (result.overallConfidence >= 60) result.overallGrade = 'C';
    else if (result.overallConfidence >= 50) result.overallGrade = 'D';
    else result.overallGrade = 'F';

    return result;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return {
      overallGrade: 'N/A',
      overallConfidence: 0,
      summary: 'Error parsing analysis. Please try again.'
    };
  }
} 