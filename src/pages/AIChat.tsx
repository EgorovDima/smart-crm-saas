
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, Loader2, RefreshCw, ChevronDown, PlusCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate AI response after delay
    setTimeout(() => {
      generateAIResponse(input);
    }, 1500);
  };

  const generateAIResponse = (userInput: string) => {
    // This is a simulated AI response. In a real implementation, we would call the DeepSeek API here
    let aiResponse = '';
    
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('задач') || lowerInput.includes('task')) {
      aiResponse = "Я можу допомогти вам створити завдання. Яке завдання ви хочете додати до вашого списку?";
    } else if (lowerInput.includes('пошт') || lowerInput.includes('email') || lowerInput.includes('gmail')) {
      aiResponse = "Я можу проаналізувати вашу електронну пошту. Бажаєте, щоб я зробив огляд ваших непрочитаних повідомлень?";
    } else if (lowerInput.includes('файл') || lowerInput.includes('excel') || lowerInput.includes('csv')) {
      aiResponse = "Я можу проаналізувати ваші файли даних. Будь ласка, завантажте Excel або CSV файл, і я проведу аналіз імпортної статистики.";
    } else if (lowerInput.includes('контакт') || lowerInput.includes('client') || lowerInput.includes('клієнт')) {
      aiResponse = "Я можу допомогти вам знайти контактні дані компаній. Яку компанію ви шукаєте?";
    } else if (lowerInput.includes('новин') || lowerInput.includes('news')) {
      aiResponse = "Ось останні новини про українських імпортерів та експортерів:\n\n1. ТОВ 'Укрзерноекспорт' збільшив поставки кукурудзи в ЄС на 15%\n2. Нова логістична компанія відкрила офіс у Одесі\n3. Уряд спростив процедури для імпортерів медичного обладнання\n4. Експорт IT-послуг зріс на 23% у порівнянні з минулим роком\n5. Українські виробники меду отримали нові сертифікати для експорту в Японію";
    } else if (lowerInput.includes('гороскоп') || lowerInput.includes('horoscope')) {
      aiResponse = "Гороскоп для Рака на сьогодні:\nСьогодні сприятливий день для бізнес-переговорів та укладання нових контрактів. Ваша інтуїція допоможе прийняти правильне рішення в складній ситуації. Ввечері приділіть час відпочинку та близьким людям.";
    } else if (lowerInput.includes('привіт') || lowerInput.includes('hello') || lowerInput.includes('hi')) {
      aiResponse = "Привіт! Чим я можу вам допомогти сьогодні? Можу допомогти з аналізом даних, створенням задач, пошуком контактів або іншими потребами для вашого логістичного бізнесу.";
    } else {
      aiResponse = "Я розумію ваш запит. Як штучний інтелект для логістики, я можу:\n\n- Аналізувати дані з Excel/CSV файлів\n- Допомагати з управлінням задачами\n- Обробляти електронну пошту\n- Шукати контакти компаній\n- Надавати аналітику та звіти\n- Генерувати документи\n\nБудь ласка, уточніть, з чим саме вам потрібна допомога.";
    }
    
    const aiMessage: Message = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
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
        <Button onClick={startNewChat} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Нова розмова
        </Button>
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/50 px-6">
          <CardTitle className="flex items-center text-lg font-medium">
            <Bot className="mr-2 h-5 w-5 text-blue-600" />
            DeepSeek AI Assistant
          </CardTitle>
        </CardHeader>
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
                    <p className="whitespace-pre-line">{message.content}</p>
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
                    <p>Thinking...</p>
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
