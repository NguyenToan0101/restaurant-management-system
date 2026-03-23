import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIConsultantQueries } from '@/hooks/queries/useAIConsultantQueries';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIConsultantChatbotProps {
  restaurantId?: string;
  branchId?: string;
  timeframe: 'DAY' | 'MONTH' | 'YEAR';
  specificDate?: string;
  onClose?: () => void;
}

export const AIConsultantChatbot = ({
  restaurantId,
  branchId,
  timeframe,
  specificDate,
  onClose,
}: AIConsultantChatbotProps) => {
  const[messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { consultRestaurant, consultBranch } = useAIConsultantQueries();
  const isLoading = consultRestaurant.isPending || consultBranch.isPending;

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Hi there! 👋 I am your AI Consultant. I can help analyze your revenue trends, optimize menus, or detect business risks. What would you like to explore today?',
          timestamp: new Date(),
        },
      ]);
    }
  },[]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) =>[...prev, userMessage]);
    setInput('');

    try {
      const request = {
        question: userMessage.content,
        timeframe,
        sessionId: sessionId || undefined,
        specificDate,
      };

      const result = restaurantId
        ? await consultRestaurant.mutateAsync({ restaurantId, request })
        : await consultBranch.mutateAsync({ branchId: branchId!, request });

      if (result.result) {
        setMessages((prev) =>[...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.result.response,
          timestamp: new Date(result.result.timestamp),
        }]);
        setSessionId(result.result.sessionId);
      }
    } catch (error) {
      setMessages((prev) =>[...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while analyzing your data. Please try again.',
        timestamp: new Date(),
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessage = (content: string) => {
    const sections = content.split(/(?=\d+\.\s+[A-Z]+:)/);
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      
      return (
        <div key={index} className="mb-3 last:mb-0 space-y-1">
          {lines.map((line, lineIndex) => {
            if (line.match(/^\d+\.\s+[A-Z]+:/)) {
              return <h4 key={lineIndex} className="font-semibold text-slate-800 mt-2 mb-1">{line}</h4>;
            }
            if (line.startsWith('-')) {
              return <li key={lineIndex} className="ml-4 list-disc text-slate-700">{line.substring(1).trim()}</li>;
            }
            return <p key={lineIndex} className="text-slate-700 leading-relaxed">{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-6rem)] w-full shadow-2xl border-0 ring-1 ring-slate-200 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">AI Data Analyst</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Analyzing {timeframe === 'DAY' ? 'today' : timeframe === 'MONTH' ? 'this month' : 'this year'}'s data
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4 bg-slate-50/50" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-in fade-in slide-in-from-bottom-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center mt-1">
                  <Bot className="h-4 w-4 text-indigo-700" />
                </div>
              )}
              
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl p-4 shadow-sm',
                  message.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-100 rounded-tl-sm'
                )}
              >
                <div className={cn("text-sm", message.role === 'user' ? 'whitespace-pre-wrap' : '')}>
                  {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                </div>
                <div
                  className={cn(
                    'text-[10px] mt-2 font-medium',
                    message.role === 'user' ? 'text-violet-200 text-right' : 'text-slate-400'
                  )}
                >
                  {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center mt-1">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                <Bot className="h-4 w-4 text-indigo-700" />
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce[animation-delay:0.4s]"></span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-2">Analyzing data...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about revenue trends, menu optimization..."
            className="min-h-[52px] max-h-[120px] resize-none pr-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-violet-500 focus-visible:bg-white text-sm"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className={cn(
              "absolute right-2 bottom-2 h-9 w-9 rounded-lg transition-all",
              input.trim() ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-400">Powered by AI • Press Enter to send</span>
        </div>
      </div>
    </Card>
  );
};