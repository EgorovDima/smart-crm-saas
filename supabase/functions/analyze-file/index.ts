
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileType, fileContent, analysisType, question } = await req.json();
    console.log(`Analyzing file: ${fileName}, type: ${fileType}, analysis: ${analysisType}, content length: ${fileContent?.length || 'not provided'}`);

    // Check if we have file content to analyze
    if (!fileContent) {
      throw new Error('No file content provided for analysis');
    }

    // Truncate file content if it's too large
    let processedContent = fileContent;
    if (fileContent.length > 12000) {
      processedContent = fileContent.substring(0, 12000) + 
        "\n\n[Content truncated due to size limitations. This is the first 12,000 characters.]";
    }

    // Configure the prompt based on whether this is a general analysis or a specific question
    let prompt;
    
    if (analysisType === 'chat' && question) {
      prompt = `
      I have a ${fileType} file named "${fileName}" with the following content:

      ${processedContent}

      The user asks: "${question}"
      
      Based on this actual data, provide a detailed, data-driven response.
      Format your response in markdown.
      `;
    } else {
      prompt = `
      I have a ${fileType} file named "${fileName}" with the following content:

      ${processedContent}

      Please analyze this customs and logistics data and provide:
      1. General overview of the imports/exports shown in the data
      2. Key insights about quantities, values, and countries
      3. Identify top goods by value or weight (if present in the data)
      4. Identify top companies for each good (if present in the data)
      5. Identify trends and patterns in the data
      6. Recommendations for duty optimization if applicable
      
      Base your analysis ONLY on the actual data in the file content. If some information is not available in the data, state that clearly.
      Format your response in markdown with appropriate headings and bullet points.
      `;
    }

    // Call Deepseek API for analysis
    const deepseekApiKey = "sk-7d93695119444ec69fde7000c93bcff9";
    
    if (!deepseekApiKey) {
      throw new Error('Deepseek API key is not set');
    }

    console.log('Sending request to Deepseek API');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are a customs and logistics data analyst expert. Analyze the provided data accurately and thoroughly. Only make conclusions based on the actual data provided.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error details:', data);
      throw new Error(`Deepseek API analysis failed: ${data.error?.message || JSON.stringify(data) || 'Unknown error'}`);
    }

    const analysisResult = data.choices[0].message.content;
    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({ success: true, analysis: analysisResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-file function:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
