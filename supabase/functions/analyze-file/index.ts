
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
    const { fileName, fileType, analysisType } = await req.json();
    console.log(`Analyzing file: ${fileName}, type: ${fileType}, analysis: ${analysisType}`);

    // For a real implementation, you would:
    // 1. Fetch the file from Supabase storage
    // 2. Parse it based on fileType (CSV, XLSX)
    // 3. Process the data

    // Here we're using a basic analysis with a model
    const prompt = `
    Analyze this customs data file named "${fileName}" (${fileType} format).
    
    Please provide:
    1. General overview of the imports/exports
    2. Top 20 goods by weight
    3. Top 20 companies for each of these goods
    4. Key insights and trends
    5. Recommendations for duty optimization
    
    Format your response in markdown.
    `;

    // Call an AI model for analysis
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a customs and logistics data analyst expert. Provide detailed analysis of import/export data.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`AI analysis failed: ${data.error?.message || 'Unknown error'}`);
    }

    const analysisResult = data.choices[0].message.content;

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
