import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { AgriChatbot } from '../../services/chatbot';

const chatbot = new AgriChatbot();

const INITIAL_SUGGESTIONS = [
  "What's the weather today?",
  "Which crop should I grow?",
  "Should I irrigate today?",
  "Show wheat prices",
  "Help"
];

export default function ChatWidget() {
  const { user } = useAuth();
  const { profile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Namaste! 🙏 I'm LeafLife, your agricultural assistant. How can I help you today?`,
      suggestions: INITIAL_SUGGESTIONS,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const userProfile = profile || user;
      const response = await chatbot.processMessage(text, userProfile);

      setTimeout(() => {
        const botMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: typeof response === 'string' ? response : response.text,
          suggestions: typeof response === 'string' ? [] : (response.suggestions || []),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
      }, 600 + Math.random() * 800);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: "I'm sorry, I encountered an error. Please try again.",
        suggestions: ['Help'],
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/• /g, '&bull; ');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? 'bg-on-surface-variant hover:bg-on-surface rotate-0'
            : 'bg-primary hover:bg-primary-container'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open LeafLife assistant'}
      >
        <span className="material-symbols-outlined text-white text-[28px] transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>
          {isOpen ? 'close' : 'smart_toy'}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-120px)] bg-surface-container-lowest rounded-[24px] shadow-2xl flex flex-col overflow-hidden slide-up border border-outline-variant/30">
          {/* Chat Header */}
          <div className="bg-primary px-md py-sm flex items-center gap-sm shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-label-md font-label-md text-on-primary font-semibold">LeafLife Assistant</h3>
              <p className="text-label-sm text-primary-fixed-dim">
                {isTyping ? 'Typing...' : 'Online • AI Agricultural Advisor'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-primary-container/30 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">remove</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-sm py-md space-y-sm" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} chat-bubble-in`}>
                {msg.type === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-primary-fixed/30 flex items-center justify-center mr-xs shrink-0 mt-1">
                    <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.type === 'user' ? '' : ''}`}>
                  <div
                    className={`px-sm py-xs rounded-2xl text-body-md leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-primary text-on-primary rounded-br-lg'
                        : 'bg-surface-container text-on-surface rounded-bl-lg'
                    }`}
                  >
                    {formatText(msg.text)}
                  </div>
                  {/* Suggestions */}
                  {msg.type === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-xs mt-xs">
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="text-label-sm font-label-sm text-primary bg-primary-fixed/20 hover:bg-primary-fixed/40 px-sm py-xs rounded-full transition-colors whitespace-nowrap"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className={`text-[10px] text-on-surface-variant/50 mt-1 block ${msg.type === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-xs chat-bubble-in">
                <div className="w-7 h-7 rounded-full bg-primary-fixed/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                </div>
                <div className="bg-surface-container px-sm py-xs rounded-2xl rounded-bl-lg flex items-center gap-1">
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full typing-dot" />
                  <span className="w-2 h-2 bg-on-surface-variant/40 rounded-full typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="shrink-0 px-sm py-sm border-t border-outline-variant/30 bg-surface-container-lowest">
            <div className="flex items-center gap-xs bg-surface-container rounded-full px-sm py-xs">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about weather, crops, prices..."
                className="flex-1 bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-on-surface-variant/50"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
