import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  RefreshCw,
  Sprout,
  ShieldAlert,
  Droplets,
  Wind,
  Tractor,
  Copy,
  Check,
  Mic,
  MicOff
} from 'lucide-react';
import { ChatMessage, FarmContext, CropConfig } from '../types';

interface WeatherGPTChatProps {
  farmContext: FarmContext;
  crop: CropConfig;
  language: 'hi' | 'en';
}

export const WeatherGPTChat: React.FC<WeatherGPTChatProps> = ({ farmContext, crop, language }) => {
  const isHindi = language === 'hi';

  const defaultWelcome = isHindi
    ? `नमस्कार किसान भाई! मैं हूँ **WeatherGPT**, आपका कृषि मौसम व फसल सलाहकार।

मैं **${farmContext.locationName.split('(')[0]}** के खेत में आपकी **${crop.nameHi || crop.name.split('/')[0]}** की **${farmContext.cropStage}** अवस्था की निगरानी कर रहा हूँ।
- वर्तमान तापमान: **${farmContext.temperature}°C** | हवा में नमी: **${farmContext.humidity}%**
- जमीन में नमी (जड़ स्तर): **${farmContext.soilMoisture}%** | दैनिक वाष्पोत्सर्जन (ET₀): **${farmContext.et0} mm**
- आज का छिड़काव मौसम: **${farmContext.sprayStatus === 'optimal' ? '🟢 उत्तम' : '🟡 सावधानी रखें'}** (हवा: ${farmContext.windSpeed} km/h)

आप नीचे माइक दबाकर अपनी भाषा में पूछ सकते हैं—जैसे छिड़काव कब करें, सिंचाई का सही समय, या कीट व बीमारी से बचाव।`
    : `Hello Farmer! I am **WeatherGPT**, your AI Agro-Meteorologist and Crop Consultant.

Tracking **${farmContext.locationName.split('(')[0]}** for your **${crop.name.split('/')[0]}** at the **${farmContext.cropStage}** stage.
- Current Temp: **${farmContext.temperature}°C** | Humidity: **${farmContext.humidity}%**
- Root-Zone Soil Moisture: **${farmContext.soilMoisture}%** | Reference ET₀: **${farmContext.et0} mm/day**
- Today's Spray Feasibility: **${farmContext.sprayStatus.toUpperCase()}** (Wind: ${farmContext.windSpeed} km/h)

You can ask or speak directly about spraying windows, irrigation depths, or disease management!`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: defaultWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition for Voice Input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isHindi ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isHindi]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = isHindi
    ? [
        {
          label: 'क्या आज छिड़काव करें?',
          prompt: 'क्या आज खेत में कीटनाशक या खरपतवार नाशक का छिड़काव करना सुरक्षित है? हवा और बारिश की क्या स्थिति है?',
          icon: Wind,
        },
        {
          label: 'सिंचाई का सही समय',
          prompt: `मेरी ${crop.nameHi || crop.name} की फसल में आज की नमी (${farmContext.soilMoisture}%) और वाष्पीकरण को देखते हुए क्या सिंचाई करनी चाहिए?`,
          icon: Droplets,
        },
        {
          label: 'कीट व बीमारी चेतावनी',
          prompt: `वर्तमान तापमान (${farmContext.temperature}°C) व नमी (${farmContext.humidity}%) में फफूंद या कीट का क्या प्रकोप हो सकता है?`,
          icon: ShieldAlert,
        },
        {
          label: 'ट्रैक्टर निकालने की स्थिति',
          prompt: 'क्या खेत की मिट्टी में नमी के हिसाब से आज ट्रैक्टर व कल्टीवेटर चलाना ठीक रहेगा?',
          icon: Tractor,
        },
      ]
    : [
        {
          label: 'Spray Suitability Window',
          prompt: 'Is it safe to spray systemic herbicide today given current wind, Delta-T, and rain probabilities?',
          icon: Wind,
        },
        {
          label: 'Irrigation Quota Calculation',
          prompt: `Calculate the exact irrigation depth (mm) needed for my ${crop.name.split('/')[0]} at ${farmContext.cropStage} stage based on today's ET0 (${farmContext.et0} mm) and soil moisture.`,
          icon: Droplets,
        },
        {
          label: 'Fungal & Disease Alert',
          prompt: `Given current humidity (${farmContext.humidity}%) and temperature (${farmContext.temperature}°C), what is the microclimate risk for foliar diseases or mildew?`,
          icon: ShieldAlert,
        },
        {
          label: 'Tractor Trafficability',
          prompt: 'Can heavy sprayers and tractors enter the field today without causing destructive soil compaction?',
          icon: Tractor,
        },
      ];

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(isHindi ? 'आपके ब्राउज़र में आवाज़ पहचानने की सुविधा उपलब्ध नहीं है।' : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = isHindi ? 'hi-IN' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Mic start error:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          farmContext: {
            ...farmContext,
            language: isHindi ? 'hi' : 'en',
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.reply || (isHindi ? 'कोई उत्तर प्राप्त नहीं हुआ।' : 'No response generated.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: isHindi
          ? `**मौसम AI त्रुटि:** संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।`
          : `**Agronomic Telemetry Error:** Unable to reach AI Advisor.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert(isHindi ? 'ऑडियो आवाज़ इस ब्राउज़र में उपलब्ध नहीं है।' : 'Text-to-speech audio is not supported.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/🟢|🟡|🔴/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="farm-card rounded-2xl p-3 sm:p-5 mb-5 border-emerald-900/40 flex flex-col h-[580px] sm:h-[620px] w-full max-w-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md shrink-0">
            <Mic className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-stone-100 flex items-center gap-1.5">
              <span>{isHindi ? 'WeatherGPT किसान AI' : 'WeatherGPT Agronomist'}</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-[11px] text-stone-400 truncate max-w-[200px] sm:max-w-none">
              {farmContext.locationName.split('(')[0]} · {crop.nameHi || crop.name.split('/')[0]}
            </p>
          </div>
        </div>

        {/* Voice Input Indicator */}
        <button
          onClick={handleToggleVoiceInput}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse border border-rose-300'
              : 'bg-amber-400 hover:bg-amber-300 text-stone-950 border border-amber-300/50'
          }`}
        >
          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isListening ? (isHindi ? 'सुन रहा हूँ...' : 'Listening...') : (isHindi ? 'बोलकर पूछें' : 'Voice Input')}</span>
        </button>
      </div>

      {/* Quick Prompts Chips (Horizontally scrubbable without stretching page) */}
      <div className="py-2 border-b border-stone-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full max-w-full">
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/90 hover:bg-emerald-950/60 border border-stone-700/70 hover:border-emerald-500/50 text-[11px] text-stone-300 hover:text-emerald-300 font-medium whitespace-nowrap transition-all shrink-0 disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-amber-400" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 w-full max-w-full overflow-x-hidden">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  isUser
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-stone-950 font-bold'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-900/60 text-emerald-100 border border-emerald-700/50 rounded-tr-none'
                    : 'bg-stone-950/90 text-stone-200 border border-stone-800/80 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-1.5">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="font-bold text-amber-300 text-sm pt-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                      const items = paragraph.split('\n');
                      return (
                        <ul key={pIdx} className="space-y-1 list-disc list-inside text-stone-300">
                          {items.map((it, itIdx) => (
                            <li key={itIdx}>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: it
                                    .replace(/^[-*]\s*/, '')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-stone-100 font-semibold">$1</strong>'),
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p
                        key={pIdx}
                        dangerouslySetInnerHTML={{
                          __html: paragraph.replace(
                            /\*\*(.*?)\*\*/g,
                            '<strong class="text-stone-100 font-semibold">$1</strong>'
                          ),
                        }}
                      />
                    );
                  })}
                </div>

                {!isUser && (
                  <div className="mt-2 pt-1.5 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>{msg.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-stone-300 transition-colors flex items-center gap-1"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleToggleSpeech(msg.content)}
                        className={`hover:text-amber-400 transition-colors flex items-center gap-1 ${
                          isSpeaking ? 'text-amber-400 animate-pulse' : ''
                        }`}
                        title="आवाज़ में सुनें"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isHindi ? 'सुनें' : 'Listen'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="font-mono text-amber-300 animate-pulse">
              {isHindi ? 'मौसम AI फसल डेटा का विश्लेषण कर रहा है...' : 'WeatherGPT is analyzing agro-meteorological data...'}
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Mic */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 border-t border-stone-800/80 flex items-center gap-1.5"
      >
        <button
          type="button"
          onClick={handleToggleVoiceInput}
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse border-rose-400'
              : 'bg-stone-900 hover:bg-stone-800 text-amber-400 border-stone-700'
          }`}
          title={isHindi ? 'माइक से बोलें' : 'Speak via microphone'}
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isHindi
              ? `अपनी भाषा में पूछें (जैसे: क्या आज पानी लगाना सही है?)...`
              : `Ask in your language about ${crop.name.split('/')[0]} spraying, water...`
          }
          disabled={isLoading}
          className="flex-1 bg-stone-950/90 border border-stone-700/70 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-all shadow-inner disabled:opacity-50 min-w-0"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0"
        >
          <Send className="w-4 h-4 stroke-[2.4]" />
        </button>
      </form>
    </div>
  );
};
