import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarkdownViewer from '@/components/MarkdownViewer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your AI assistant. How can I help you today?\n\nYou can ask me anything about:\n- Project ideas and guidance\n- Technology recommendations\n- Learning resources\n- Technical questions',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to n8n webhook
      const response = await fetch('https://notwishy.app.n8n.cloud/webhook/f83841e7-4771-44a7-b3f9-819ea663d8f5/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: sessionId,
          chatInput: userMessage.content,
          message: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.output || data.response || data.message || 'I received your message!',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or check your connection.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Chat Assistant
            </h1>
          </div>
          <p className="text-lg text-gray-300">
            Get instant help with your questions and project ideas
          </p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-2xl border-2 border-purple-800 h-[calc(100vh-300px)] min-h-[600px] flex flex-col">
          <CardHeader className="border-b bg-gradient-to-r from-purple-900/30 to-pink-900/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  Chat Assistant
                </CardTitle>
                <CardDescription>
                  Ask me anything - I'm here to help!
                </CardDescription>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Session: {sessionId.slice(-8)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-100'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <MarkdownViewer content={message.content} />
                        </div>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user'
                            ? 'text-purple-200'
                            : 'text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg p-4 bg-gray-800">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                        <p className="text-gray-300">
                          AI is thinking...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-900/50 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message here... (Press Enter to send)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Press Enter to send • Supports markdown formatting
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="border-purple-800">
            <CardHeader>
              <CardTitle className="text-sm">💬 Natural Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Chat naturally with our AI assistant that understands context
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-800">
            <CardHeader>
              <CardTitle className="text-sm">📝 Markdown Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Responses are beautifully formatted with code, lists, and more
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-800">
            <CardHeader>
              <CardTitle className="text-sm">🔒 Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Your conversations are secure with session-based tracking
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
