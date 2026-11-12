import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Mic,
  Send,
  RefreshCw,
  Volume2,
  Square,
  Sparkles,
  Bot,
  MessageSquare,
  Radio,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { WeatherData, GeocodeLocation } from '../types';
import { getTranslations } from '../i18n/translations';

interface AskModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: GeocodeLocation;
  currentWeather: WeatherData | null;
  language: string;
  onSelectLanguage?: (lang: string) => void;
  startInVoiceMode?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
}

export const AskModal: React.FC<AskModalProps> = ({
  isOpen,
  onClose,
  location,
  currentWeather,
  language,
  startInVoiceMode = false,
}) => {
  const t = getTranslations(language);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: t.askModal.welcomeMsg,
      source: `${t.askModal.sourcePrefix}${location.name.split(',')[0]}`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(startInVoiceMode);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const hasStartedRef = useRef<boolean>(false);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: t.askModal.welcomeMsg,
        source: `${t.askModal.sourcePrefix}${location.name.split(',')[0]}`,
      },
    ]);
  }, [language, location.name]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Safely stop listening and abort instance
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Bullet-proof start listening function
  const startListening = useCallback(async () => {
    setVoiceError('');
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceError(
        language === 'en'
          ? 'Speech recognition is not supported in this browser. Please type or tap quick questions below.'
          : 'इस ब्राउज़र में वॉइस पहचान की सुविधा उपलब्ध नहीं है। कृपया नीचे दिए सवाल चुनें या टाइप करें।'
      );
      setIsListening(false);
      return;
    }

    // Abort previous instance if any
    stopListening();

    try {
      // Check microphone permission via mediaDevices if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Release track immediately so speech recognition has exclusive device access
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          console.warn('Microphone permission check warning:', permErr);
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            setVoiceError(
              language === 'en'
                ? 'Microphone permission blocked. Please enable microphone permission in browser settings.'
                : 'माइक की अनुमति बंद है। कृपया ब्राउज़र सेटिंग्स में जाकर माइक (Microphone) की अनुमति On करें।'
            );
            setIsListening(false);
            return;
          }
        }
      }

      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = t.speechLocale || 'hi-IN';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };

      rec.onresult = (e: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interimTranscript += e.results[i][0].transcript;
          }
        }
        const text = finalTranscript || interimTranscript;
        if (text) {
          setLiveTranscript(text);
          setInputText(text);
        }
        if (finalTranscript) {
          setIsListening(false);
          setIsVoiceActive(false);
          handleSend(finalTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
        setIsListening(false);
        const errType = e.error;
        if (errType === 'not-allowed' || errType === 'permission-denied') {
          setVoiceError(
            language === 'en'
              ? 'Microphone access denied. Please click the lock icon in the address bar and allow Microphone.'
              : 'माइक की अनुमति नहीं मिली। कृपया ब्राउज़र के एड्रेस बार में माइक को Allow करें।'
          );
        } else if (errType === 'no-speech') {
          setVoiceError(
            language === 'en'
              ? 'No speech detected. Tap the mic and speak clearly.'
              : 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर साफ़ आवाज़ में बोलें।'
          );
        } else if (errType === 'network') {
          setVoiceError(
            language === 'en'
              ? 'Voice network issue. Please tap again or choose a question below.'
              : 'वॉइस नेटवर्क में रुकावट आई। कृपया दोबारा माइक दबाएं या सवाल चुनें।'
          );
        } else if (errType !== 'aborted') {
          setVoiceError(
            language === 'en'
              ? 'Could not recognize speech. Please tap mic again to retry.'
              : 'आवाज़ पहचानने में समस्या आई। कृपया माइक दबाकर पुनः बोलें।'
          );
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
      setLiveTranscript('');
    } catch (err: any) {
      console.warn('Mic start failed:', err);
      setIsListening(false);
      setVoiceError(
        language === 'en'
          ? 'Could not activate microphone. Tap the mic button to grant permission.'
          : 'माइक सक्रिय नहीं हो सका। कृपया माइक बटन पर दोबारा टैप करें।'
      );
    }
  }, [t.speechLocale, language, stopListening]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Launch voice listening when modal opens in voice mode
  useEffect(() => {
    if (isOpen) {
      if (startInVoiceMode) {
        setIsVoiceActive(true);
        // Attempt immediate start; if user activation policy blocks, UI shows ready-to-tap state
        const timer = setTimeout(() => {
          startListening();
        }, 100);
        return () => clearTimeout(timer);
      } else {
        setIsVoiceActive(false);
      }
    } else {
      stopListening();
      setVoiceError('');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen, startInVoiceMode, startListening, stopListening]);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const text = customText || inputText || liveTranscript;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLiveTranscript('');
    setIsLoading(true);
    setIsVoiceActive(false);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          language,
          farmContext: {
            locationName: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            temperature: currentWeather?.current?.temperature_2m ?? 30,
            humidity: currentWeather?.current?.relative_humidity_2m ?? 50,
            windSpeed: currentWeather?.current?.wind_speed_10m ?? 7,
            soilMoisture: currentWeather?.agronomic?.soil?.rootZonePct ?? 28,
            et0: currentWeather?.daily?.et0_fao_evapotranspiration?.[0] ?? 4.2,
            language,
          },
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply || (language === 'en' ? 'Could not retrieve advice.' : 'उत्तर प्राप्त नहीं हो सका।');
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        source: `${t.askModal.sourcePrefix}${location.name.split(',')[0]}`,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak the answer back if was asked via voice
      handleToggleSpeak(replyText);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#_`]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = t.speechLocale;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7EE] rounded-3xl w-full max-w-2xl h-[92vh] max-h-[720px] p-4 sm:p-6 shadow-2xl border border-[#DDD5C0] text-slate-900 relative flex flex-col justify-between overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D2]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="font-bold text-sm sm:text-base text-slate-900 block font-serif">
                {t.askModal.title} · {location.name.split(',')[0]}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {t.askModal.subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Toggle Pill */}
            <div className="flex items-center bg-[#EFEAD8] p-1 rounded-full border border-[#DDD5C0]/80">
              <button
                type="button"
                onClick={() => {
                  setIsVoiceActive(true);
                  startListening();
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  isVoiceActive
                    ? 'bg-[#C27803] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Voice' : 'बोलकर'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsVoiceActive(false);
                  stopListening();
                }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  !isVoiceActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Chat' : 'चैट'}</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EFEAD8] text-slate-500 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= DIRECT VOICE SCREEN VIEW ================= */}
        {isVoiceActive ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Pulsing Visualizer Halo */}
            <div className="relative my-2">
              {isListening && (
                <>
                  <div className="absolute -inset-6 rounded-full bg-amber-400/25 animate-ping duration-1000" />
                  <div className="absolute -inset-10 rounded-full bg-amber-400/15 animate-pulse" />
                </>
              )}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-xl cursor-pointer active:scale-95 transition-all ${
                  isListening
                    ? 'bg-gradient-to-tr from-[#E5A83B] to-[#F59E0B] text-slate-950 shadow-amber-500/40 ring-4 ring-amber-300'
                    : 'bg-slate-900 text-white shadow-slate-900/30'
                }`}
              >
                <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
              </button>
            </div>

            {/* Audio Wave Equalizer Animation */}
            {isListening && (
              <div className="flex items-center gap-1.5 justify-center h-8">
                <span className="w-1.5 h-4 bg-[#C27803] rounded-full animate-bounce [animation-delay:-0.35s]" />
                <span className="w-1.5 h-7 bg-[#E5A83B] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-9 bg-amber-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-6 bg-[#E5A83B] rounded-full animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-4 bg-[#C27803] rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            )}

            {/* Status Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                {isListening
                  ? (language === 'en' ? '🎙️ Listening... Please speak' : '🎙️ बोलिए, हम सुन रहे हैं...')
                  : (language === 'en' ? 'Tap mic to start speaking' : 'माइक पर टैप करके सवाल पूछें')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isListening
                  ? (language === 'en' ? 'Speak clearly in your language' : 'अपनी भाषा में साफ़ बोलें, फिर रुकें')
                  : (language === 'en' ? 'Click the button above or tap any question below' : 'ऊपर बटन दबाएं या नीचे दिए किसी भी सवाल पर टैप करें')}
              </p>
            </div>

            {/* Error / Permission Alert Banner if any */}
            {voiceError && (
              <div className="w-full max-w-md bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs flex items-center justify-between gap-2.5 text-amber-900 shadow-xs">
                <div className="flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-medium">{voiceError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => startListening()}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-[11px] shrink-0 transition cursor-pointer"
                >
                  {language === 'en' ? 'Try Again' : 'पुनः प्रयास'}
                </button>
              </div>
            )}

            {/* Real-time Spoken Transcript Box */}
            <div className="w-full max-w-md bg-white border border-[#DDD5C0] rounded-2xl p-4 text-center min-h-[75px] shadow-xs flex flex-col items-center justify-center">
              {liveTranscript || inputText ? (
                <p className="text-sm sm:text-base font-semibold text-slate-900 italic">
                  "{liveTranscript || inputText}"
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  {isListening
                    ? (language === 'en' ? 'Speak now, your words will appear here...' : 'बोलना शुरू करें, आपके शब्द यहाँ दिखेंगे...')
                    : (language === 'en' ? 'Click microphone above to speak' : 'ऊपर दिए माइक पर टैप करके बोलना शुरू करें')}
                </p>
              )}
            </div>

            {/* Spoken Quick Prompt Chips */}
            <div className="w-full max-w-md">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                {language === 'en' ? 'Or tap any common question:' : 'या इन सवालों में से चुनें:'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSend(t.hero.chipRainPrompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7EE] text-slate-800 border border-[#DDD5C0] font-medium transition cursor-pointer shadow-2xs"
                >
                  {t.askModal.chipRain}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.hero.chipSprayPrompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7EE] text-slate-800 border border-[#DDD5C0] font-medium transition cursor-pointer shadow-2xs"
                >
                  {t.askModal.chipSpray}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.hero.chipWaterPrompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7EE] text-slate-800 border border-[#DDD5C0] font-medium transition cursor-pointer shadow-2xs"
                >
                  {t.askModal.chipWater}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.askModal.chipTemp)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7EE] text-slate-800 border border-[#DDD5C0] font-medium transition cursor-pointer shadow-2xs"
                >
                  {t.askModal.chipTemp}
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3 pt-2">
              {(liveTranscript || inputText) && (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  className="px-5 py-2.5 rounded-full bg-[#102A43] hover:bg-[#0c2033] text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Send Question' : 'भेजें और उत्तर पाएं'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setIsVoiceActive(false);
                }}
                className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-[#DDD5C0] text-xs font-semibold transition cursor-pointer"
              >
                {language === 'en' ? 'Type text instead' : 'कीबोर्ड से लिखें'}
              </button>
            </div>
          </div>
        ) : (
          /* ================= CHAT LOG & TEXT VIEW ================= */
          <>
            {/* Message Log */}
            <div
              ref={messagesEndRef}
              className="flex-1 overflow-y-auto py-3 space-y-3 pr-1"
            >
              {messages.map((m) => (
                <div key={m.id} className="space-y-1">
                  {m.role === 'user' ? (
                    <div className="flex justify-end">
                      <div className="bg-[#102A43] text-white text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] leading-relaxed font-medium shadow-sm">
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white text-slate-900 text-xs sm:text-sm p-4 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-xs leading-relaxed space-y-2">
                      <p className="whitespace-pre-line">{m.text}</p>
                      {m.source && (
                        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span>{m.source}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSpeak(m.text)}
                            className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-bold cursor-pointer"
                          >
                            {isSpeaking ? (
                              <>
                                <Square className="w-3 h-3" />
                                <span>{t.askModal.stopListening}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>{t.hero.askVoiceBtn.split('·')[0]}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200/80 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C27803]" />
                  <span>{t.nav.searching}</span>
                </div>
              )}
            </div>

            {/* Quick Question Chips inside modal */}
            <div className="pb-2 pt-1 border-t border-[#E8E2D2]/60">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleSend(t.hero.chipWaterPrompt)}
                  className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#EFEAD8] hover:bg-[#E5DEC7] text-slate-800 border border-[#DDD5C0] font-medium transition active:scale-95 cursor-pointer"
                >
                  {t.askModal.chipWater}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.hero.chipSprayPrompt)}
                  className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#EFEAD8] hover:bg-[#E5DEC7] text-slate-800 border border-[#DDD5C0] font-medium transition active:scale-95 cursor-pointer"
                >
                  {t.askModal.chipSpray}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.hero.chipRainPrompt)}
                  className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#EFEAD8] hover:bg-[#E5DEC7] text-slate-800 border border-[#DDD5C0] font-medium transition active:scale-95 cursor-pointer"
                >
                  {t.askModal.chipRain}
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(t.askModal.chipTemp)}
                  className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-[#EFEAD8] hover:bg-[#E5DEC7] text-slate-800 border border-[#DDD5C0] font-medium transition active:scale-95 cursor-pointer"
                >
                  {t.askModal.chipTemp}
                </button>
              </div>
            </div>

            {/* Modal Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="pt-2 border-t border-[#E8E2D2] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? t.askModal.listening : t.askModal.placeholder}
                className="flex-1 bg-white border border-[#DDD5C0] focus:border-[#C27803] rounded-full px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => {
                  setIsVoiceActive(true);
                  startListening();
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-bounce'
                    : 'bg-[#A65B17] hover:bg-[#8F4E12] text-white shadow-sm'
                }`}
                title={t.askModal.tapToSpeak}
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition disabled:opacity-40 shrink-0 cursor-pointer"
                title={t.hero.sendBtn}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
