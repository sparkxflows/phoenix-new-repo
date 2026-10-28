import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  User, 
  Calendar, 
  Phone, 
  ExternalLink,
  ChevronDown,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { STUDIO_INFO } from '../data/studioData';
import { PhoenixLogo } from './PhoenixLogo';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestBooking?: boolean;
}

interface StudioChatbotProps {
  onOpenBooking: (artistId?: string, serviceId?: string) => void;
}

const QUICK_PROMPTS = [
  { label: '⭐ Client Reviews & Views', query: 'What do clients say about Phoenix Tattooz and what is your studio philosophy?' },
  { label: '💰 Tattoo Pricing & Estimates', query: 'What are your tattoo prices and how do you calculate estimates?' },
  { label: '🩹 Aftercare & Healing Guide', query: 'What are the recommended aftercare steps for a fresh tattoo?' },
  { label: '📅 Book a Free Consultation', query: 'How can I book a free tattoo consultation or appointment?' },
  { label: '💎 Body Piercing Services', query: 'What piercing services do you offer and what jewelry is used?' },
  { label: '👨‍🎨 Meet Our Master Artists', query: 'Tell me about master artist Rohit Sharma and the studio artists.' },
  { label: '🎓 Tattoo Academy Training', query: 'Tell me about the professional tattoo artist academy courses.' },
];

export const StudioChatbot: React.FC<StudioChatbotProps> = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello! Welcome to **Phoenix Tattooz Studio & Academy** in Hisar 👋\n\nI am your AI studio concierge. You are free to ask any question about your next tattoo, piercing, pricing, or academy consultation today!`,
      timestamp: 'Just now',
      suggestBooking: true,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-studio-ai', handleOpenChat);
    return () => window.removeEventListener('open-studio-ai', handleOpenChat);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build lightweight message history for context
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || "I'm here to help with tattoo designs, pricing, and bookings. Please try asking again!";

      // Check if response mentions booking
      const lowerReply = replyText.toLowerCase();
      const shouldSuggestBooking = lowerReply.includes('book') || lowerReply.includes('consult') || lowerReply.includes('appointment');

      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestBooking: shouldSuggestBooking,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setHasUnread(true);
    } catch (err: any) {
      console.warn('Chat request failed, providing local studio reply:', err);
      const fallbackMsg: ChatMessage = {
        id: `model-fallback-${Date.now()}`,
        role: 'model',
        text: `We are here to help! For immediate queries or custom quotes, call Master Rohit at **${STUDIO_INFO.displayPhone}** or visit us at **2nd Floor, Red Square Market, Hisar**. You can also click below to book an appointment directly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestBooking: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Chat cleared! What questions do you have about tattoos, piercing, or academy training at Phoenix Tattooz?`,
        timestamp: 'Just now',
        suggestBooking: false,
      },
    ]);
  };

  const renderFormattedText = (rawText: string) => {
    // Process markdown-style bold and bullet lines cleanly
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Check for bullet point
          const isBullet = trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
          const lineContent = isBullet ? trimmed.replace(/^[•\-\*]\s+/, '') : trimmed;

          // Parse **bold** parts
          const parts = lineContent.split(/(\*\*.*?\*\*)/g);

          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-semibold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="text-zinc-300 italic">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return <span key={pIdx}>{part}</span>;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-[#FFD60A] text-sm leading-none mt-0.5">•</span>
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-zinc-200">
              {formattedLine}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="studio-chat-launcher fixed bottom-24 right-3 md:bottom-6 md:right-6 z-40 select-none">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group relative flex items-center gap-2.5 px-2.5 py-2.5 md:px-4 md:py-3 rounded-full bg-gradient-to-r from-[#1A1A1A] to-[#121212] border border-[#FFD60A]/40 text-white shadow-[0_4px_24px_rgba(255,214,10,0.25)] hover:border-[#FFD60A] hover:shadow-[0_6px_32px_rgba(255,214,10,0.4)] active:scale-95 transition-all duration-300 cursor-pointer ${
            isOpen ? 'ring-2 ring-[#FFD60A]' : ''
          }`}
          aria-label="Toggle Phoenix Studio AI Chatbot"
        >
          {/* Glowing Aura */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FFD60A]/20 to-amber-500/20 blur-sm group-hover:blur-md transition-all -z-10" />

          {/* Logo / Chat Icon */}
          <div className="relative w-8 h-8 rounded-full bg-black/80 border border-[#FFD60A]/50 flex items-center justify-center overflow-hidden flex-shrink-0">
            <PhoenixLogo size={24} className="w-6 h-6" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
          </div>

          {/* Full label on desktop; compact icon-only launcher on mobile/tablet. */}
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1">
              Ask Studio AI
              <Sparkles className="w-3 h-3 text-[#FFD60A]" />
            </span>
            <span className="text-[10px] text-[#FFD60A]/90 font-medium tracking-tight">
              Free to ask any question
            </span>
          </div>

          {/* Unread Indicator Dot */}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FFD60A] text-black font-extrabold text-[9px] rounded-full flex items-center justify-center animate-bounce shadow-md">
              !
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Dialog / Popover */}
      {isOpen && (
        <div className="fixed inset-x-3 bottom-24 top-20 sm:top-auto sm:bottom-24 sm:right-6 sm:left-auto sm:w-[420px] sm:h-[600px] z-50 flex flex-col bg-[#0F0F0F]/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Chat Header */}
          <div className="p-3.5 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-[#181818] border border-[#FFD60A]/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <PhoenixLogo size={28} className="w-7 h-7" />
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wider uppercase">
                    Phoenix Assistant
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#FFD60A]/20 text-[#FFD60A] border border-[#FFD60A]/30 rounded">
                    Free AI
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Free to ask any question • Online
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat window"
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Studio Info Banner */}
          <div className="px-3 py-1.5 bg-[#FFD60A]/10 border-b border-[#FFD60A]/20 flex items-center justify-between text-[11px] text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#FFD60A]" />
              <span>Open 10 AM – 9 PM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#FFD60A]" />
              <span>Red Square Market, Hisar</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-7 h-7 rounded-full bg-black border border-[#FFD60A]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PhoenixLogo size={20} className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.role === 'user'
                      ? 'bg-[#FFD60A] text-black font-medium rounded-br-none shadow-md'
                      : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800/90 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <>
                      {renderFormattedText(msg.text)}

                      {/* Interactive In-Message Quick Actions */}
                      {msg.suggestBooking && (
                        <div className="mt-3 pt-2.5 border-t border-zinc-800 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              onOpenBooking();
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFD60A] text-black text-[11px] font-bold hover:bg-yellow-400 active:scale-95 transition-all shadow-sm cursor-pointer"
                          >
                            <Calendar className="w-3 h-3 text-black" />
                            Book Appointment
                          </button>

                          <a
                            href={`https://wa.me/${STUDIO_INFO.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20Phoenix%20Tattooz,%20I%20would%20like%20to%20consult%20about%20a%20tattoo.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium hover:bg-emerald-500/30 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            WhatsApp Studio
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  <span
                    className={`block text-[9px] mt-1 ${
                      msg.role === 'user' ? 'text-black/60 text-right' : 'text-zinc-500 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-zinc-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Animation */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-black border border-[#FFD60A]/40 flex items-center justify-center flex-shrink-0">
                  <PhoenixLogo size={20} className="w-5 h-5" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-none p-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#FFD60A] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-zinc-400 ml-1">Phoenix AI is responding...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="px-3 py-2 bg-black/60 border-t border-zinc-800/80">
            <p className="text-[10px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#FFD60A]" /> Suggested Topics:
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.query)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about tattoo pricing, aftercare, designs..."
                disabled={isLoading}
                className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFD60A] focus:ring-1 focus:ring-[#FFD60A] transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-[#FFD60A] hover:bg-yellow-400 text-black flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 active:scale-95"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                Free to ask any question
              </span>
              <span>Hisar Studio • +91 99929 69919</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
