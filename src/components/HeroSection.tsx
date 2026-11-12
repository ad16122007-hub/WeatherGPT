import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Bell,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Send,
  RefreshCw,
  Square,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  Sun,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { WeatherData, GeocodeLocation, CropConfig } from '../types';
import { CROPS_DATABASE } from '../constants/crops';
import { getTranslations } from '../i18n/translations';

interface HeroSectionProps {
  location: GeocodeLocation;
  currentWeather: WeatherData | null;
  onOpenAskModal: (startVoice?: boolean, queryText?: string) => void;
  onOpenAlertsModal: () => void;
  language: string;
  selectedCrop?: CropConfig;
  onSelectCrop?: (crop: CropConfig) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  alert?: { title: string; desc: string };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  location,
  currentWeather,
  onOpenAskModal,
  onOpenAlertsModal,
  language,
  selectedCrop = CROPS_DATABASE[0],
  onSelectCrop,
}) => {
  const t = getTranslations(language);
  const isHindi = language !== 'en';
  const current = currentWeather?.current;
  const agronomic = currentWeather?.agronomic;

  const temp = Math.round(current?.temperature_2m ?? 30);
  const rainProb = currentWeather?.hourly?.precipitation_probability?.[0] ?? 0;
  const windSpeed = Math.round(current?.wind_speed_10m ?? 7);
  const soilMoisture = agronomic?.soil?.rootZonePct ?? 28;
  const deltaT = agronomic?.deltaT ?? 5.2;

  // Real-time Decision Logic
  const isSprayFeasible = windSpeed < 15 && rainProb < 40 && deltaT <= 8;
  const isIrrigationNeeded = soilMoisture < 25;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const welcome = t.hero.welcomeMsg
      .replace('{city}', location.name.split(',')[0])
      .replace('{rainProb}', rainProb.toString());
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: welcome,
        source: t.hero.sourceTag,
      },
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update welcome message when language or location changes
  useEffect(() => {
    const cityName = location.name.split(',')[0];
    const welcome = t.hero.welcomeMsg
      .replace('{city}', cityName)
      .replace('{rainProb}', rainProb.toString());
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: welcome,
        source: t.hero.sourceTag,
      },
    ]);
  }, [language, location.name, rainProb]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const text = customText || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsLoading(true);

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
            temperature: temp,
            humidity: current?.relative_humidity_2m ?? 50,
            windSpeed: windSpeed,
            soilMoisture: soilMoisture,
            et0: currentWeather?.daily?.et0_fao_evapotranspiration?.[0] ?? 4.2,
            sprayStatus: isSprayFeasible ? 'optimal' : 'caution',
            cropName: selectedCrop?.nameHi || selectedCrop?.name,
            language,
          },
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.reply || (isHindi ? 'उत्तर प्राप्त नहीं हो सका।' : 'Could not retrieve response.'),
        source: `${t.hero.sourceTag} · ${location.name.split(',')[0]}`,
        alert:
          rainProb > 60
            ? {
                title: t.alertsModal.heavyRain,
                desc: t.alertsModal.previewMsg.replace('{village}', location.name.split(',')[0]),
              }
            : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
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
    <section className="relative w-full overflow-hidden py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-[#091827] via-[#0E2235] to-[#152B3E] text-white">
      {/* Agronomic soil & sunrise radiance backdrops */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,_rgba(229,168,59,0.15),transparent_45%),radial-gradient(circle_at_85%_75%,_rgba(36,94,67,0.2),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Top Badgeless Context Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold tracking-wide">
            <span className="text-base">🌱</span>
            <span>{t.hero.pill}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 text-xs">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">{location.name.split(',')[0]}</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-medium">{t.hero.liveImdBadge}</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ================= LEFT COLUMN: TODAY'S FIELD DECISION HUB (7 COLS) ================= */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Main Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
                {t.hero.headingLine1} <br />
                <span className="text-[#E5A83B] font-serif">{t.hero.headingLine2}</span>
              </h1>
            </div>

            {/* Crop Selector Bar */}
            <div className="w-full bg-slate-900/60 p-2.5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide font-mono">
                  {isHindi ? 'अपनी मुख्य फसल चुनें (Choose Crop):' : 'Active Target Crop:'}
                </span>
                <span className="text-[11px] text-amber-300 font-semibold">
                  {selectedCrop.nameHi || selectedCrop.name.split('(')[0]}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {CROPS_DATABASE.slice(0, 6).map((crop) => {
                  const isSelected = selectedCrop.id === crop.id;
                  return (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => onSelectCrop && onSelectCrop(crop)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5A83B] text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {crop.nameHi ? crop.nameHi.split('(')[0].trim() : crop.name.split('/')[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================= TODAY'S 3 CRUCIAL FIELD DECISIONS TILES ================= */}
            <div className="w-full bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 rounded-3xl p-4 sm:p-6 border border-amber-500/25 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                  <span className="font-bold text-sm sm:text-base text-white">
                    {isHindi ? 'आज का कृषि फैसला (Today’s Farm Decisions)' : "Today's Field Decisions"}
                  </span>
                </div>
                <span className="text-xs text-amber-300 font-mono font-semibold">
                  {temp}°C · {rainProb}% {isHindi ? 'बारिश' : 'Rain'}
                </span>
              </div>

              {/* 3 Prominent Decision Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. स्प्रे फैसला (Spray Window) */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isSprayFeasible
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      🚜 {isHindi ? 'स्प्रे अनुकूलता' : 'Spray Suitability'}
                    </span>
                    {isSprayFeasible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {isSprayFeasible
                      ? isHindi
                        ? '✅ छिड़काव के लिए उत्तम'
                        : 'Optimal Window'
                      : isHindi
                      ? '⚠️ तेज हवा, स्प्रे रोकें'
                      : 'Caution / Drift Risk'}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-mono tabular-nums">
                    {isSprayFeasible
                      ? isHindi
                        ? 'सुबह 8:00 से 11:30 बजे तक अनुकूल (हवा 8 km/h, Delta-T 5.2)'
                        : 'Favorable before noon (Wind 8 km/h, Delta-T 5.2)'
                      : isHindi
                      ? `हवा की गति ${windSpeed} km/h - दवा उड़ने का खतरा`
                      : `Wind speed ${windSpeed} km/h exceeds drift threshold`}
                  </p>
                </div>

                {/* 2. सिंचाई फैसला (Irrigation Need) */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isIrrigationNeeded
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-100'
                      : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      💧 {isHindi ? 'सिंचाई सलाह' : 'Irrigation Advice'}
                    </span>
                    <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">
                    {isIrrigationNeeded
                      ? isHindi
                        ? '⚠️ पानी लगाने की जरूरत'
                        : 'Irrigate Soon'
                      : isHindi
                      ? '✅ पर्याप्त नमी (Optimal)'
                      : 'Adequate Moisture'}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-mono tabular-nums">
                    {isIrrigationNeeded
                      ? isHindi
                        ? `जड़ में नमी ${soilMoisture}% (शाम को हल्की सिंचाई करें)`
                        : `Root-zone moisture ${soilMoisture}% below threshold`
                      : isHindi
                      ? `जड़ में नमी ${soilMoisture}% पर्याप्त है; आज पानी न दें`
                      : `Root-zone moisture ${soilMoisture}% sufficient`}
                  </p>
                </div>

                {/* 3. बारिश व आंधी खतरा (Rain & Wind Risk) */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      🌧️ {isHindi ? 'बारिश का जोखिम' : 'Rain & Storm Risk'}
                    </span>
                    <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1 font-mono tabular-nums">
                    {rainProb < 30
                      ? isHindi
                        ? `☀️ बारिश का खतरा नहीं (${rainProb}%)`
                        : `Clear (${rainProb}%)`
                      : isHindi
                      ? `🌧️ बारिश की संभावना (${rainProb}%)`
                      : `Rain Likely (${rainProb}%)`}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {rainProb < 30
                      ? isHindi
                        ? 'खेत में जुताई व फसल कटाई का काम बेझिझक पूरा करें'
                        : 'Field operations safe from precipitation'
                      : isHindi
                      ? 'कटी हुई फसल को ढकें, दवा छिड़काव तुरंत रोकें'
                      : 'Cover harvested grain, suspend foliar sprays'}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenAskModal(true)}
                className="flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-gradient-to-r from-[#E5A83B] to-[#F59E0B] hover:from-[#D99B26] hover:to-[#E5A83B] active:scale-95 text-slate-950 font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-slate-950 text-[#E5A83B] flex items-center justify-center">
                  <Mic className="w-4 h-4 fill-[#E5A83B]" />
                </div>
                <span>{t.hero.askVoiceBtn}</span>
              </button>

              <button
                type="button"
                onClick={onOpenAlertsModal}
                className="flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/20 active:scale-95 text-white font-medium text-sm flex items-center justify-center gap-2.5 backdrop-blur-sm transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>{t.hero.setAlertsBtn}</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE VOICE ORB & CHAT (5 COLS) ================= */}
          <div className="lg:col-span-5 w-full mt-4 lg:mt-0">
            <div className="bg-[#FAF7EE] rounded-3xl p-5 sm:p-6 shadow-2xl border border-amber-500/30 text-slate-900 ring-1 ring-black/10 flex flex-col justify-between">
              {/* Box Top Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E2D2]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-sm font-bold text-slate-900 font-serif">WeatherGPT</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md font-semibold">
                    {t.hero.fastResponse}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-[#EFEAD8] px-2.5 py-0.5 rounded-md uppercase font-mono">
                  {language}
                </span>
              </div>

              {/* Big Interactive Voice Orb Banner */}
              <div
                onClick={() => onOpenAskModal(true)}
                className="my-3.5 p-4 rounded-2xl bg-gradient-to-tr from-[#102A43] via-[#0E243A] to-[#163859] text-white flex items-center justify-between gap-3 shadow-md hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono block">
                    {isHindi ? '🎙️ बोलकर पूछें (Voice Assistant)' : '🎙️ Tap to Speak'}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {isHindi ? 'माइक दबाकर अपनी भाषा में पूछें' : 'Ask anything in your language'}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {isHindi ? 'टाइप करने की जरूरत नहीं, सीधा बोलें' : 'No typing needed, just speak'}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-full bg-[#E5A83B] text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6 fill-slate-950" />
                </div>
              </div>

              {/* Quick Tap Farmer Chips */}
              <div className="pb-3 border-b border-[#E8E2D2]">
                <span className="text-[11px] font-bold text-slate-500 block mb-2 font-mono uppercase">
                  {t.hero.quickTapTitle}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSend(t.hero.chipWaterPrompt)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-[#DDD5C0] transition active:scale-95 text-left cursor-pointer font-medium shadow-2xs"
                  >
                    {t.hero.chipWater}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend(t.hero.chipSprayPrompt)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-[#DDD5C0] transition active:scale-95 text-left cursor-pointer font-medium shadow-2xs"
                  >
                    {t.hero.chipSpray}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend(t.hero.chipRainPrompt)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-[#DDD5C0] transition active:scale-95 text-left cursor-pointer font-medium shadow-2xs"
                  >
                    {t.hero.chipRain}
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesEndRef}
                className="py-3.5 space-y-3 min-h-[180px] max-h-[260px] overflow-y-auto pr-1 text-left"
              >
                {messages.map((m) => (
                  <div key={m.id} className="space-y-1.5">
                    {m.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="bg-[#102A43] text-white text-xs sm:text-[13px] px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[88%] leading-relaxed font-medium shadow-xs">
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="bg-white text-slate-900 text-xs sm:text-[13px] p-3.5 rounded-2xl rounded-tl-xs border border-[#DDD5C0] shadow-2xs leading-relaxed space-y-2">
                          <p className="whitespace-pre-line">{m.text}</p>
                          {m.source && (
                            <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                              <span>{m.source}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleSpeak(m.text)}
                                className="text-amber-700 hover:text-amber-800 flex items-center gap-1 font-bold cursor-pointer"
                              >
                                {isSpeaking ? (
                                  <>
                                    <Square className="w-2.5 h-2.5" />
                                    <span>{t.askModal.stopListening}</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-2.5 h-2.5" />
                                    <span>{isHindi ? 'सुनें' : 'Listen'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C27803]" />
                    <span>{t.nav.searching}</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="pt-2.5 border-t border-[#E8E2D2] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.hero.chatPlaceholder}
                  className="flex-1 bg-white border border-[#DDD5C0] focus:border-[#C27803] rounded-full px-4 py-2 text-xs sm:text-[13px] text-slate-900 placeholder-slate-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => onOpenAskModal(true)}
                  className="w-10 h-10 rounded-full bg-[#E5A83B] hover:bg-[#D99B26] text-slate-950 flex items-center justify-center transition shrink-0 shadow-sm cursor-pointer"
                  title={t.askModal.tapToSpeak}
                >
                  <Mic className="w-4 h-4 fill-slate-950" />
                </button>

                {inputText.trim() && (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition shrink-0 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
