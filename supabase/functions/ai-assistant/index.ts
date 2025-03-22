
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
    const { message, fileContent, fileType } = await req.json();
    console.log(`Processing chat request with file: ${fileType ? 'Yes' : 'No'}`);

    // Configure prompt based on whether there's a file or not
    let systemPrompt = 'You are an AI assistant for logistics. Provide helpful, concise responses in Ukrainian (or the language the user is writing in).';
    let userPrompt = message;
    
    if (fileContent && fileType) {
      // If file is provided, add context about the file
      systemPrompt = 'You are an AI assistant for logistics specializing in data analysis. Analyze the provided file and answer questions about it.';
      
      // For large files, we might need to truncate or summarize the content
      // to fit within the token limits of the AI model
      let processedContent = fileContent;
      
      // Simple truncation if content is very large (over 100,000 characters)
      // This is a basic approach - more sophisticated approaches could be implemented
      if (fileContent.length > 100000) {
        processedContent = fileContent.substring(0, 100000) + 
          "\n\n[File content truncated due to size limitations. This is the first 100,000 characters.]";
      }
      
      userPrompt = `The user uploaded a ${fileType} file with the following content:\n\n${processedContent}\n\nThe user asks: ${message}\n\nProvide a thorough analysis based on the file content.`;
    }

    // Call Deepseek API
    const deepseekApiKey = "sk-7d93695119444ec69fde7000c93bcff9";
    
    if (!deepseekApiKey) {
      throw new Error('Deepseek API key is not set');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error details:', data);
      throw new Error(`Deepseek API failed: ${data.error?.message || JSON.stringify(data) || 'Unknown error'}`);
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ success: true, response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
