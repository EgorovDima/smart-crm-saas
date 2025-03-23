
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types of assistant functions
enum AssistantFunction {
  GENERAL_CHAT = 'general_chat',
  TASK_MANAGEMENT = 'task_management',
  EMAIL_ANALYSIS = 'email_analysis',
  DATA_PROCESSING = 'data_processing',
  WEB_RESEARCH = 'web_research',
  DOCUMENT_GENERATION = 'document_generation',
  NEWS_AGGREGATION = 'news_aggregation',
  PERSONAL_INFO = 'personal_info',
  DECISION_SUPPORT = 'decision_support',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      fileContent, 
      fileType, 
      functionType = AssistantFunction.GENERAL_CHAT,
      conversationHistory = []
    } = await req.json();
    
    console.log(`Processing ${functionType} request with file: ${fileType ? 'Yes' : 'No'}`);

    // Configure system prompt based on the function type
    let systemPrompt = '';
    let userPrompt = '';
    
    // Format conversation history for the AI context
    const formattedHistory = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // Configure the appropriate system prompt based on function type
    switch (functionType) {
      case AssistantFunction.TASK_MANAGEMENT:
        systemPrompt = 'You are a task management AI assistant. Help the user create, organize, and prioritize tasks from their input. Suggest task due dates and categories when appropriate. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      case AssistantFunction.EMAIL_ANALYSIS:
        systemPrompt = 'You are an email analysis AI assistant. Summarize email content, identify priorities, action items, and important contacts. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      case AssistantFunction.DATA_PROCESSING:
        systemPrompt = 'You are a data analysis AI assistant specializing in import/export statistics. Analyze the provided file data and extract meaningful insights, trends, and anomalies. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      case AssistantFunction.WEB_RESEARCH:
        systemPrompt = 'You are a web research AI assistant. Based on the provided information, suggest companies or individuals the user should contact. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      case AssistantFunction.DOCUMENT_GENERATION:
        systemPrompt = 'You are a document generation AI assistant. Help create standardized invoices and transportation expense documents based on the information provided. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      case AssistantFunction.NEWS_AGGREGATION:
        systemPrompt = 'You are a news aggregation AI assistant. Provide daily updated news about Ukrainian importers/exporters that would be relevant to logistics professionals. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      case AssistantFunction.PERSONAL_INFO:
        systemPrompt = 'You are a personal information AI assistant. Provide horoscope information for Cancer (male, DOB: 26.06.1983) from orakul.com. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      case AssistantFunction.DECISION_SUPPORT:
        systemPrompt = 'You are a decision support AI assistant. Analyze trends, suggest opportunities, and identify risks in the logistics and import/export sector. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      default:
        systemPrompt = 'You are an AI assistant for logistics. Provide helpful, concise responses in Ukrainian (or the language the user is writing in).';
    }
    
    // Default user prompt - will be overridden if file content is present
    userPrompt = message;
    
    if (fileContent && fileType) {
      // If file is provided, add context about the file
      systemPrompt += ' Analyze the provided file and answer questions about it.';
      
      // For large files, truncate to fit within token limits
      let processedContent = fileContent;
      
      // Simple truncation if content is very large (over 100,000 characters)
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

    // Construct messages array with system prompt, conversation history, and current user message
    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory
    ];
    
    // Only add the current message if it's not empty (it might be empty if we're just loading history)
    if (userPrompt.trim()) {
      messages.push({ role: 'user', content: userPrompt });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API error details:', data);
      throw new Error(`Deepseek API failed: ${data.error?.message || JSON.stringify(data) || 'Unknown error'}`);
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse,
      functionType 
    }), {
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
