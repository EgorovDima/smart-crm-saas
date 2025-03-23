
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, Bot, User, Loader2, RefreshCw, PlusCircle, 
  Upload, X, FileText, Calendar, Mail, BarChart, 
  Globe, FileSpreadsheet, Newspaper, User as UserIcon, 
  TrendingUp, Save, Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  functionType?: string;
}

interface FileInfo {
  name: string;
  content: string;
  type: string;
}

interface ConversationInfo {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

// Assistant function types
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

// Function display information
const functionInfo = {
  [AssistantFunction.GENERAL_CHAT]: {
    name: 'Загальний чат',
    icon: <Bot className="h-4 w-4" />,
    description: 'Загальна допомога з логістикою та іншими питаннями'
  },
  [AssistantFunction.TASK_MANAGEMENT]: {
    name: 'Управління завданнями',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Створення та організація завдань з вашого вводу'
  },
  [AssistantFunction.EMAIL_ANALYSIS]: {
    name: 'Аналіз електронної пошти',
    icon: <Mail className="h-4 w-4" />,
    description: 'Читання та підсумовування повідомлень Gmail, визначення пріоритетів'
  },
  [AssistantFunction.DATA_PROCESSING]: {
    name: 'Обробка даних',
    icon: <BarChart className="h-4 w-4" />,
    description: 'Аналіз статистики імпорту/експорту з файлів Excel/CSV'
  },
  [AssistantFunction.WEB_RESEARCH]: {
    name: 'Веб-дослідження',
    icon: <Globe className="h-4 w-4" />,
    description: 'Пошук контактних даних компаній, згаданих у даних'
  },
  [AssistantFunction.DOCUMENT_GENERATION]: {
    name: 'Створення документів',
    icon: <FileSpreadsheet className="h-4 w-4" />,
    description: 'Створення рахунків та документів транспортних витрат'
  },
  [AssistantFunction.NEWS_AGGREGATION]: {
    name: 'Агрегація новин',
    icon: <Newspaper className="h-4 w-4" />,
    description: 'Щоденні оновлені новини про українських імпортерів/експортерів'
  },
  [AssistantFunction.PERSONAL_INFO]: {
    name: 'Персоналізована інформація',
    icon: <UserIcon className="h-4 w-4" />,
    description: 'Щоденний/тижневий/місячний/річний гороскоп для Рака'
  },
  [AssistantFunction.DECISION_SUPPORT]: {
    name: 'Підтримка прийняття рішень',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Аналіз тенденцій, пропозиція можливостей, виявлення ризиків'
  }
};

// Get function icon component by type
const getFunctionIcon = (functionType: string) => {
  return functionInfo[functionType as AssistantFunction]?.icon || <Bot className="h-4 w-4" />;
};

const AIChat = () => {
  // State for conversations and current conversation
  const [conversations, setConversations] = useState<ConversationInfo[]>(() => {
    const savedConversations = localStorage.getItem('ai-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        // Convert string timestamps back to Date objects
        return parsed.map((conv: any) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      } catch (e) {
        console.error('Error parsing saved conversations:', e);
        return [];
      }
    }
    return [];
  });
  
  const [currentConversationId, setCurrentConversationId] = useState<string>(() => {
    // Try to get the last active conversation from localStorage
    const savedCurrentId = localStorage.getItem('ai-current-conversation-id');
    if (savedCurrentId && conversations.some(c => c.id === savedCurrentId)) {
      return savedCurrentId;
    }
    return '';
  });
  
  const [showConversationsList, setShowConversationsList] = useState(false);
  const [activeFunctionType, setActiveFunctionType] = useState<AssistantFunction>(AssistantFunction.GENERAL_CHAT);

  // Get current messages based on active conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const [messages, setMessages] = useState<Message[]>(currentConversation?.messages || [
    {
      id: '1',
      content: "Привіт! Я ваш AI асистент для логістики. Я можу допомогти вам з аналізом даних, управлінням задачами, обробкою електронної пошти та багато іншого. Як я можу допомогти вам сьогодні?",
      sender: 'ai',
      timestamp: new Date(),
      functionType: AssistantFunction.GENERAL_CHAT,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Effect to save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Effect to save current conversation ID to localStorage
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('ai-current-conversation-id', currentConversationId);
    }
  }, [currentConversationId]);

  // Effect to update messages when changing conversation
  useEffect(() => {
    if (currentConversationId) {
      const conversation = conversations.find(c => c.id === currentConversationId);
      if (conversation) {
        setMessages(conversation.messages);
        // Set the active function type to the one of the last AI message in the conversation
        const lastAiMessage = [...conversation.messages].reverse().find(m => m.sender === 'ai');
        if (lastAiMessage?.functionType) {
          setActiveFunctionType(lastAiMessage.functionType as AssistantFunction);
        }
      }
    } else if (conversations.length === 0) {
      // If no conversations, set default welcome message
      setMessages([
        {
          id: '1',
          content: "Привіт! Я ваш AI асистент для логістики. Я можу допомогти вам з аналізом даних, управлінням задачами, обробкою електронної пошти та багато іншого. Як я можу допомогти вам сьогодні?",
          sender: 'ai',
          timestamp: new Date(),
          functionType: AssistantFunction.GENERAL_CHAT,
        },
      ]);
    }
  }, [currentConversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save the current conversation
  const saveConversation = (newMessages: Message[]) => {
    if (currentConversationId) {
      // Update existing conversation
      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { 
              ...conv, 
              messages: newMessages,
              lastMessage: newMessages[newMessages.length - 1].content,
              timestamp: new Date()
            } 
          : conv
      ));
    } else {
      // Create new conversation
      const newConversationId = Date.now().toString();
      const title = `Розмова ${conversations.length + 1}`;
      
      const newConversation: ConversationInfo = {
        id: newConversationId,
        title,
        lastMessage: newMessages[newMessages.length - 1].content,
        timestamp: new Date(),
        messages: newMessages
      };
      
      setConversations(prev => [...prev, newConversation]);
      setCurrentConversationId(newConversationId);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    const maxSizeInMB = 500;
    const acceptedTypes = ['text/plain', 'text/csv', 'application/json', 'application/vnd.ms-excel', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Непідтримуваний тип файлу",
        description: "Будь ласка, завантажте текстовий файл, CSV, Excel, JSON або документ Word.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast({
        title: "Файл занадто великий",
        description: `Максимальний розмір файлу: ${maxSizeInMB}MB.`,
        variant: "destructive"
      });
      return;
    }

    // Read file content
    try {
      setIsLoading(true);
      const content = await readFileContent(file);
      
      setUploadedFile({
        name: file.name,
        content,
        type: file.type
      });
      
      toast({
        title: "Файл завантажено",
        description: `"${file.name}" готовий до аналізу.`
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Помилка при читанні файлу",
        description: "Не вдалося прочитати вміст файлу.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("File reading error"));
      };
      
      reader.readAsText(file);
    });
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  const handleChangeFunctionType = (value: string) => {
    setActiveFunctionType(value as AssistantFunction);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      functionType: activeFunctionType
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.slice(-10); // Last 10 messages for context
      
      // Get response from Deepseek API via edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input,
          fileContent: uploadedFile?.content || null,
          fileType: uploadedFile?.type || null,
          functionType: activeFunctionType,
          conversationHistory
        },
      });
      
      if (error) throw error;
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
        functionType: data.functionType || activeFunctionType
      };
      
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      
      // Save the conversation
      saveConversation(updatedMessages);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося отримати відповідь від AI. Спробуйте ще раз пізніше.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    // Create a new conversation
    setUploadedFile(null);
    setActiveFunctionType(AssistantFunction.GENERAL_CHAT);
    setCurrentConversationId('');
    setMessages([
      {
        id: '1',
        content: "Привіт! Я ваш AI асистент для логістики. Я можу допомогти вам з аналізом даних, управлінням задачами, обробкою електронної пошти та багато іншого. Як я можу допомогти вам сьогодні?",
        sender: 'ai',
        timestamp: new Date(),
        functionType: AssistantFunction.GENERAL_CHAT,
      },
    ]);
    
    toast({
      title: "Нова розмова розпочата",
      description: "Розпочато нову розмову з AI асистентом.",
    });
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setShowConversationsList(false);
  };

  const handleDeleteConversation = (conversationId: string) => {
    const isActive = conversationId === currentConversationId;
    
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    if (isActive) {
      // If we deleted the active conversation, set to empty which will start a new one
      setCurrentConversationId('');
    }
  };

  const handleExportConversation = () => {
    if (!messages.length) return;
    
    const conversation = conversations.find(c => c.id === currentConversationId);
    const title = conversation?.title || 'AI-Chat-Export';
    
    // Create a text version of the conversation
    const textContent = messages.map(message => {
      const sender = message.sender === 'user' ? 'Користувач' : 'AI Асистент';
      const time = message.timestamp.toLocaleString();
      return `${sender} (${time}):\n${message.content}\n\n`;
    }).join('');
    
    // Create a blob and download
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Асистент</h1>
          <p className="text-lg text-muted-foreground">
            Ваш розумний помічник для управління логістичними операціями
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowConversationsList(!showConversationsList)}
            variant="outline"
            title="Історія розмов"
          >
            {currentConversation?.title || "Історія розмов"}
          </Button>
          
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Завантажити файл
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </Button>
          
          <Button onClick={startNewChat} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Нова розмова
          </Button>
        </div>
      </div>
      
      {showConversationsList && (
        <Card className="mb-4">
          <CardHeader className="py-2">
            <CardTitle className="text-lg">Історія розмов</CardTitle>
          </CardHeader>
          <CardContent className="py-2 max-h-64 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Немає збережених розмов</p>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-muted ${
                      conv.id === currentConversationId ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectConversation(conv.id)}
                  >
                    <div className="flex-1 truncate">
                      <p className="font-medium">{conv.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-2">
                        {conv.timestamp.toLocaleDateString()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/50 px-6 py-3 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-lg font-medium">
            <Bot className="mr-2 h-5 w-5 text-blue-600" />
            DeepSeek AI Assistant
          </CardTitle>
          
          <div className="flex space-x-2">
            <Select 
              value={activeFunctionType}
              onValueChange={handleChangeFunctionType}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Виберіть функцію" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(functionInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center">
                      <span className="mr-2">{info.icon}</span>
                      {info.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="h-4 w-4" viewBox="0 0 16 16">
                    <circle cx="2" cy="8" r="2" />
                    <circle cx="8" cy="8" r="2" />
                    <circle cx="14" cy="8" r="2" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportConversation}>
                  <Download className="mr-2 h-4 w-4" />
                  Експортувати розмову
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={startNewChat}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Нова розмова
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        {uploadedFile && (
          <div className="bg-blue-50 p-3 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center text-sm">
              <FileText className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium">Завантажений файл: </span>
              <span className="ml-2 text-gray-700">{uploadedFile.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeUploadedFile}
              title="Видалити файл"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <CardContent className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
                    message.sender === 'user' ? 'bg-blue-600 ml-2' : 'bg-gray-100 mr-2'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      message.functionType ? 
                        getFunctionIcon(message.functionType) : 
                        <Bot className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.sender === 'ai' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{message.content}</p>
                    )}
                    <div
                      className={`mt-1 text-xs ${
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                      {message.functionType && message.sender === 'ai' && (
                        <span className="ml-2">
                          {functionInfo[message.functionType as AssistantFunction]?.name || ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gray-100 mr-2">
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-gray-100 text-gray-900">
                    <p>Думаю...</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишіть повідомлення..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIChat;
