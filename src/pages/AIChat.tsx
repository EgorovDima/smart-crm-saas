
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, Loader2, RefreshCw, PlusCircle, Upload, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface FileInfo {
  name: string;
  content: string;
  type: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Привіт! Я ваш AI асистент для логістики. Я можу допомогти вам з аналізом даних, управлінням задачами, обробкою електронної пошти та багато іншого. Як я можу допомогти вам сьогодні?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type and size
    const maxSizeInMB = 5;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get response from Deepseek API via edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input,
          fileContent: uploadedFile?.content || null,
          fileType: uploadedFile?.type || null
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
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Clear the file after it's been used (optional based on your use case)
      // setUploadedFile(null);
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
    if (messages.length > 1) {
      const confirmNew = window.confirm("Ви впевнені, що хочете розпочати нову розмову? Поточна розмова буде втрачена.");
      if (!confirmNew) return;
    }
    
    setMessages([
      {
        id: '1',
        content: "Привіт! Я ваш AI асистент для логістики. Я можу допомогти вам з аналізом даних, управлінням задачами, обробкою електронної пошти та багато іншого. Як я можу допомогти вам сьогодні?",
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
    
    setUploadedFile(null);
    
    toast({
      title: "Нова розмова розпочата",
      description: "Всі попередні повідомлення було очищено.",
    });
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
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/50 px-6">
          <CardTitle className="flex items-center text-lg font-medium">
            <Bot className="mr-2 h-5 w-5 text-blue-600" />
            DeepSeek AI Assistant
          </CardTitle>
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
