
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

interface Task {
  title: string;
  description: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
}

interface Client {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  notes?: string;
}

interface Carrier {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  serviceType?: string;
  notes?: string;
}

interface Invoice {
  clientName: string;
  items: { description: string; quantity: number; price: number }[];
  totalAmount: number;
  date: string;
  dueDate: string;
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
        systemPrompt = `You are a task management AI assistant for logistics professionals. 
        You can create actual tasks in the system.
        
        When a user asks you to create a task, you should:
        1. Extract the task details from the user message
        2. Format the response as a JSON object within your response text like this:
        
        \`\`\`json
        {
          "action": "createTask",
          "task": {
            "title": "Task title",
            "description": "Task description",
            "dueDate": "YYYY-MM-DD",
            "priority": "high|medium|low",
            "status": "todo"
          }
        }
        \`\`\`
        
        The frontend will parse this JSON and create the task in the system.
        
        Always respond in Ukrainian unless the user writes in another language.`;
        break;
        
      case AssistantFunction.CLIENT_MANAGEMENT:
        systemPrompt = `You are a client management AI assistant for logistics professionals.
        You can create actual client records in the system.
        
        When a user asks you to create a client, you should:
        1. Extract the client details from the user message
        2. Format the response as a JSON object within your response text like this:
        
        \`\`\`json
        {
          "action": "createClient",
          "client": {
            "name": "Client name",
            "email": "client@example.com",
            "phone": "+380123456789",
            "country": "Ukraine",
            "address": "Client address",
            "notes": "Additional notes"
          }
        }
        \`\`\`
        
        The frontend will parse this JSON and create the client in the system.
        
        Always respond in Ukrainian unless the user writes in another language.`;
        break;
        
      case AssistantFunction.CARRIER_MANAGEMENT:
        systemPrompt = `You are a carrier management AI assistant for logistics professionals.
        You can create actual carrier records in the system.
        
        When a user asks you to create a carrier, you should:
        1. Extract the carrier details from the user message
        2. Format the response as a JSON object within your response text like this:
        
        \`\`\`json
        {
          "action": "createCarrier",
          "carrier": {
            "name": "Carrier name",
            "contactPerson": "Contact person name",
            "email": "contact@carrier.com",
            "phone": "+380123456789",
            "serviceType": "Road|Air|Sea|Rail",
            "notes": "Additional notes"
          }
        }
        \`\`\`
        
        The frontend will parse this JSON and create the carrier in the system.
        
        Always respond in Ukrainian unless the user writes in another language.`;
        break;
        
      case AssistantFunction.INVOICE_CREATION:
        systemPrompt = `You are an invoice creation AI assistant for logistics professionals.
        You can create actual invoice drafts in the system.
        
        When a user asks you to create an invoice, you should:
        1. Extract the invoice details from the user message
        2. Format the response as a JSON object within your response text like this:
        
        \`\`\`json
        {
          "action": "createInvoice",
          "invoice": {
            "clientName": "Client name",
            "items": [
              {
                "description": "Item description",
                "quantity": 1,
                "price": 100
              }
            ],
            "totalAmount": 100,
            "date": "YYYY-MM-DD",
            "dueDate": "YYYY-MM-DD"
          }
        }
        \`\`\`
        
        The frontend will parse this JSON and create the invoice in the system.
        
        Always respond in Ukrainian unless the user writes in another language.`;
        break;
        
      case AssistantFunction.DATA_PROCESSING:
        systemPrompt = 'You are a data analysis AI assistant specializing in import/export statistics. Analyze the provided file data and extract meaningful insights, trends, and anomalies. Always respond in Ukrainian unless the user writes in another language.';
        break;
        
      default:
        systemPrompt = 'You are an AI assistant for logistics. Help the user with their request. If they ask you to create tasks, clients, carriers, or invoices, tell them to switch to the appropriate assistant function for that purpose. Always respond in Ukrainian unless the user writes in another language.';
    }
    
    // Default user prompt - will be overridden if file content is present
    userPrompt = message;
    
    if (fileContent && fileType) {
      // If file is provided, add context about the file
      systemPrompt += ' Analyze the provided file and answer questions about it.';
      
      // For large files, truncate to fit within token limits
      let processedContent = fileContent;
      
      // Simple truncation if content is very large (over 100,000 characters)
      if (fileContent.length > 10000) {
        processedContent = fileContent.substring(0, 10000) + 
          "\n\n[File content truncated due to size limitations. This is the first 10,000 characters.]";
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

    console.log('Sending request to Deepseek API');
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
    console.log('Received response from Deepseek API');

    // Look for JSON commands in the response to determine if we need to create something
    // Pattern matching for JSON in markdown code blocks
    const jsonMatch = aiResponse.match(/```json\s*({[\s\S]*?})\s*```/);
    let actionData = null;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        actionData = JSON.parse(jsonMatch[1]);
        console.log('Found action in AI response:', actionData.action);
      } catch (e) {
        console.error('Error parsing JSON from AI response:', e);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse,
      functionType,
      actionData
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
