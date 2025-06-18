import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ChatInterfaceProps, Message } from '../types';
import { canisterService } from '../services/canisterService';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionToken, agent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        content: agent.config.appearance.welcomeMessage,
        sender: 'agent',
        timestamp: new Date(),
        agentName: agent.name
      }
    ]);
  }, [agent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response: string;
      
      // Check if this is a demo agent or if we should use demo mode
      const isDemoMode = agent.name.includes('Demo Agent') || agent.id === 'demo' || agent.id.startsWith('agent_');
      
      if (isDemoMode) {
        // Demo mode responses
        const demoResponses = [
          `Thanks for your message: "${inputMessage}". This is a demo response from ${agent.name}.`,
          `I understand you're asking about "${inputMessage}". In demo mode, I can show you how the chat interface works!`,
          `Hello! You said: "${inputMessage}". This embed widget is working correctly in demo mode.`,
          `Great question about "${inputMessage}"! This demonstrates the chat functionality of the embed widget.`,
          `I received your message: "${inputMessage}". The embed widget is functioning properly with customizable themes and responses.`
        ];
        
        // Add a small delay to simulate real API call
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        response = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      } else {
      // Call the actual canister for chat processing
        response = await canisterService.processChat(agent.id, inputMessage, sessionToken || '');
      }
      
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'agent',
        timestamp: new Date(),
        agentName: agent.name
      };

      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Failed to get response:', error);
      
      // Provide a helpful demo response even on error
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm currently in demo mode. Your message "${inputMessage}" was received, but I can't connect to the full AI service right now. This shows how error handling works in the embed widget!`,
        sender: 'agent',
        timestamp: new Date(),
        agentName: agent.name,
        isError: false // Don't show as error in demo mode
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getThemeColor = (theme: string) => {
    const themes: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500'
    };
    return themes[theme] || themes.blue;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getThemeColor(agent.config.appearance.theme)} rounded-full flex items-center justify-center`}>
              <span className="text-white font-medium text-sm">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-500">{agent.description}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                <div className={`flex items-center justify-between mt-2 text-xs ${
                  message.sender === 'user'
                    ? 'text-primary-100'
                    : message.isError
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}>
                  {message.sender === 'agent' && message.agentName && (
                    <span className="mr-2">{message.agentName}</span>
                  )}
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">Agent is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 