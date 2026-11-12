import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Activity,
  Bot,
  Bell,
  Home,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Mic
} from 'lucide-react';

import { Header } from './components/Header';
import { MandiTicker } from './components/MandiTicker';
import { HeroSection } from './components/HeroSection';
import { FarmerActionDock } from './components/FarmerActionDock';
import { TheProblemSection } from './components/TheProblemSection';
import { WhatItDoesSection } from './components/WhatItDoesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ImpactSection } from './components/ImpactSection';
import { BottomCTASection } from './components/BottomCTASection';
import { Footer } from './components/Footer';

import { CropAdvisoryBanner } from './components/CropAdvisoryBanner';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';

// Modals
import { AskModal } from './components/AskModal';
import { AlertsModal } from './components/AlertsModal';

// Advanced Agronomic Radar Components (available via accordion toggle)
import { HourlyForecastChart } from './components/HourlyForecastChart';
import { SevenDayForecast } from './components/SevenDayForecast';
import { TelemetryCards } from './components/TelemetryCards';
import { SprayPlanner } from './components/SprayPlanner';
import { IrrigationPlanner } from './components/IrrigationPlanner';
import { PestDiseaseRisk } from './components/PestDiseaseRisk';

import { WeatherData, CropConfig, GeocodeLocation, FarmContext } from './types';
import { CROPS_DATABASE } from './constants/crops';
import { AGRICULTURAL_PRESET_REGIONS } from './constants/regions';
import { getTranslations } from './i18n/translations';

const DEFAULT_LOCATION: GeocodeLocation = AGRICULTURAL_PRESET_REGIONS[0] || {
  id: 'ujjain',
  name: 'Ujjain, Madhya Pradesh',
  admin1: 'Madhya Pradesh',
  country: 'India',
  latitude: 23.1765,
  longitude: 75.7885,
};

export default function App() {
  // Read persisted location or fallback
  const [currentLocation, setCurrentLocation] = useState<GeocodeLocation>(() => {
    try {
      const saved = localStorage.getItem('weathergpt_location');
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
    } catch {
      return DEFAULT_LOCATION;
    }
  });

  // Read persisted language or fallback to Hindi
  const [language, setLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('weathergpt_language') || 'hi';
    } catch {
      return 'hi';
    }
  });

  const t = getTranslations(language);

  const [activeTab, setActiveTab] = useState<'home' | 'ask' | 'alerts'>('home');
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [startInVoiceMode, setStartInVoiceMode] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [showAdvancedRadar, setShowAdvancedRadar] = useState<boolean>(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Default crop for advanced agronomy calculations
  const [selectedCrop, setSelectedCrop] = useState<CropConfig>(CROPS_DATABASE[0]); // Wheat / गेहूं
  const [selectedStageIndex] = useState<number>(1);

  // Persist language
  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    try {
      localStorage.setItem('weathergpt_language', lang);
    } catch (e) {
      console.warn('Could not persist language', e);
    }
  };

  // Persist location
  const handleSelectLocation = (loc: GeocodeLocation) => {
    setCurrentLocation(loc);
    try {
      localStorage.setItem('weathergpt_location', JSON.stringify(loc));
    } catch (e) {
      console.warn('Could not persist location', e);
    }
  };

  // GPS auto-detection on initial mount and user request
  const detectLocation = async (isManualClick: boolean = false) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (isManualClick) {
        setWeatherError('ब्राउज़र में लोकेशन सपोर्ट उपलब्ध नहीं है। कृपया खोज बार से अपना शहर चुनें।');
      }
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const loc = data.location || (data.results && data.results[0]);
            if (loc && loc.name) {
              const liveLoc: GeocodeLocation = {
                id: `gps-${lat.toFixed(4)}_${lon.toFixed(4)}`,
                name: loc.name,
                admin1: loc.admin1 || '',
                country: loc.country || 'India',
                latitude: lat,
                longitude: lon,
                isLiveGps: true,
              };
              handleSelectLocation(liveLoc);
              setIsDetectingLocation(false);
              return;
            }
          }
          // Fallback geocode location with clean coords
          handleSelectLocation({
            id: `gps-${lat.toFixed(4)}_${lon.toFixed(4)}`,
            name: `वर्तमान स्थान (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
            latitude: lat,
            longitude: lon,
            country: 'India',
            isLiveGps: true,
          });
        } catch (err) {
          console.error('GPS reverse geocode error:', err);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        if (isManualClick) {
          console.warn('GPS manual error:', err);
          setWeatherError('जीपीएस लोकेशन प्राप्त नहीं हो सकी। कृपया ब्राउज़र सेटिंग्स में लोकेशन अनुमति ऑन करें।');
        } else {
          console.log('Auto-detect skipped or permission pending:', err.message);
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 120000 }
    );
  };

  // Automatic location update on app load
  useEffect(() => {
    detectLocation(false);
  }, []);

  // GPS manual trigger from UI
  const handleDetectLocation = () => {
    detectLocation(true);
  };

  // Fetch weather data from backend
  const fetchWeather = async (lat: number, lon: number) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        throw new Error(`Weather service HTTP ${res.status}`);
      }
      const data: WeatherData = await res.json();
      setWeather(data);
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setWeatherError(err.message || 'मौसम डेटा लोड करने में असमर्थ');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentLocation.latitude, currentLocation.longitude);
  }, [currentLocation.latitude, currentLocation.longitude]);

  // Handle header tabs
  const handleSelectTab = (tab: 'home' | 'ask' | 'alerts') => {
    setActiveTab(tab);
    if (tab === 'ask') {
      setStartInVoiceMode(true);
      setIsAskModalOpen(true);
    } else if (tab === 'alerts') {
      setIsAlertsModalOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToRadar = (tabName?: string) => {
    setShowAdvancedRadar(true);
    setTimeout(() => {
      const el = document.getElementById('radar-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  };

  const isSprayOptimal = (weather?.current?.wind_speed_10m ?? 7) < 15 && (weather?.hourly?.precipitation_probability?.[0] ?? 0) < 40;

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#FAF7EE] text-slate-800 flex flex-col font-sans selection:bg-[#E5A83B] selection:text-slate-950">
      {/* 1. Sticky Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
        onDetectLocation={handleDetectLocation}
        isDetectingLocation={isDetectingLocation}
      />

      {/* 2. Live Regional Mandi Bhav Ticker */}
      <MandiTicker
        language={language}
        onOpenAskModal={(query) => {
          setStartInVoiceMode(false);
          setIsAskModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="w-full max-w-full overflow-x-hidden flex-1 pb-20 sm:pb-0">
        {/* Error notification banner if any */}
        {weatherError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{weatherError} - पुनः प्रयास कर रहे हैं...</span>
              </div>
              <button
                onClick={() => fetchWeather(currentLocation.latitude, currentLocation.longitude)}
                className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
              >
                पुनः लोड करें
              </button>
            </div>
          </div>
        )}

        {/* 3. Hero Command Hub with 3-tile Today's Decision & Voice Orb */}
        <HeroSection
          location={currentLocation}
          currentWeather={weather}
          selectedCrop={selectedCrop}
          onSelectCrop={setSelectedCrop}
          onOpenAskModal={(startVoice, queryText) => {
            setStartInVoiceMode(startVoice !== false);
            setIsAskModalOpen(true);
          }}
          onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
          language={language}
        />

        {/* 4. Quick Agricultural Action Dock (48px Touch Targets) */}
        <FarmerActionDock
          language={language}
          onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
          onScrollToRadar={handleScrollToRadar}
          sprayStatusOptimal={isSprayOptimal}
          rainProb={weather?.hourly?.precipitation_probability?.[0] ?? 15}
        />

        {/* 5. Live Crop Shield & Seasonal Pest Protection Banner */}
        <CropAdvisoryBanner
          crop={selectedCrop}
          temperature={Math.round(weather?.current?.temperature_2m ?? 30)}
          humidity={weather?.current?.relative_humidity_2m ?? 50}
          rainProb={weather?.hourly?.precipitation_probability?.[0] ?? 15}
          language={language}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenAskWithCrop={(promptText) => {
            setStartInVoiceMode(false);
            setIsAskModalOpen(true);
          }}
        />

        {/* 6. Advanced Agronomic Radar & 7-Day Farm Outlook */}
        <section id="radar-section" className="py-8 sm:py-10 bg-[#F4EFE2] border-t border-[#E8E2D2] w-full max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#DDD5C0] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D2]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900">
                      {language === 'en'
                        ? 'Detailed Agro-Meteorology, Soil Moisture & Radar Charts'
                        : 'विस्तृत कृषि मौसम विज्ञान, मिट्टी नमी व 7-दिवसीय पूर्वानुमान चार्ट'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {language === 'en'
                        ? '24-hour cycle, 7-day outlook, evapotranspiration (ET0), Delta-T, and spray suitability'
                        : '24-घंटे का चक्र, 7-दिवसीय दृष्टिकोण, वाष्पोत्सर्जन (ET0), डेल्टा-टी, और छिड़काव अनुकूलता'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                  >
                    <span>{language === 'en' ? 'Share' : 'शेयर करें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdvancedRadar((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shrink-0"
                  >
                    <span>
                      {showAdvancedRadar
                        ? (language === 'en' ? 'Hide Charts' : 'चार्ट छिपाएं')
                        : (language === 'en' ? 'View Radar & Charts' : 'विस्तृत चार्ट खोलें (View Radar)')}
                    </span>
                    {showAdvancedRadar ? (
                      <ChevronUp className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Radar View */}
              {showAdvancedRadar && weather && (
                <div className="pt-6 space-y-6 animate-in fade-in duration-300">
                  {/* 24-Hour Timeline */}
                  <div className="w-full max-w-full overflow-hidden">
                    <HourlyForecastChart
                      weather={weather}
                      isImperial={false}
                      language={language === 'en' ? 'en' : 'hi'}
                    />
                  </div>

                  {/* 7-Day Forecast */}
                  <div className="w-full max-w-full overflow-hidden">
                    <SevenDayForecast
                      weather={weather}
                      crop={selectedCrop}
                      stageIndex={selectedStageIndex}
                      isImperial={false}
                      language={language === 'en' ? 'en' : 'hi'}
                    />
                  </div>

                  {/* Telemetry Cards: ET0, VPD, Soil moisture */}
                  <div className="w-full max-w-full overflow-hidden">
                    <TelemetryCards
                      weather={weather}
                      crop={selectedCrop}
                      stageIndex={selectedStageIndex}
                      isImperial={false}
                    />
                  </div>

                  {/* Spray Planner & Irrigation Planner */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full max-w-full overflow-hidden">
                    <SprayPlanner weather={weather} isImperial={false} />
                    <IrrigationPlanner
                      weather={weather}
                      crop={selectedCrop}
                      stageIndex={selectedStageIndex}
                      isImperial={false}
                    />
                  </div>

                  {/* Pest Disease Risk */}
                  <div className="w-full max-w-full overflow-hidden">
                    <PestDiseaseRisk
                      weather={weather}
                      crop={selectedCrop}
                      stageIndex={selectedStageIndex}
                      isImperial={false}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 7. The Problem Section */}
        <TheProblemSection language={language} />

        {/* 8. What It Does Section */}
        <WhatItDoesSection language={language} />

        {/* 9. How It Works Section */}
        <HowItWorksSection language={language} />

        {/* 10. Impact Section */}
        <ImpactSection language={language} />

        {/* 8. Bottom CTA Section (nt) */}
        <BottomCTASection onStartAsking={() => setIsAskModalOpen(true)} language={language} />

        {/* 9. Footer (rt) */}
        <Footer language={language} />
      </main>

      {/* Floating Bottom Mobile Navigation Bar with Elevated Golden Voice Orb */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7EE]/95 backdrop-blur-md border-t border-[#E8E2D2] px-3 py-1.5 flex items-center justify-around text-xs shadow-xl">
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            activeTab === 'home' ? 'text-[#C27803] font-bold' : 'text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{t.nav.home}</span>
        </button>

        {/* Elevated Golden Microphone Orb */}
        <button
          onClick={() => {
            setStartInVoiceMode(true);
            setIsAskModalOpen(true);
          }}
          className="min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 relative cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#E5A83B] to-[#F59E0B] text-slate-950 flex items-center justify-center -mt-6 shadow-xl shadow-amber-500/40 border-2 border-white ring-2 ring-amber-400/50 group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 fill-slate-950" />
          </div>
          <span className="text-[10px] font-bold text-[#C27803]">{t.nav.ask}</span>
        </button>

        <button
          onClick={() => setIsAlertsModalOpen(true)}
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            activeTab === 'alerts' ? 'text-[#C27803] font-bold' : 'text-slate-600'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{t.nav.alerts}</span>
        </button>

        <button
          onClick={() => {
            setShowAdvancedRadar((prev) => !prev);
            setTimeout(() => {
              const el = document.getElementById('radar-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className={`min-h-[44px] min-w-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            showAdvancedRadar ? 'text-emerald-700 font-bold' : 'text-slate-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{language === 'en' ? 'Charts' : 'चार्ट्स'}</span>
        </button>
      </nav>

      {/* Pop-up Modals matching reference */}
      <AskModal
        isOpen={isAskModalOpen}
        onClose={() => {
          setIsAskModalOpen(false);
          setStartInVoiceMode(false);
          setActiveTab('home');
        }}
        location={currentLocation}
        currentWeather={weather}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        startInVoiceMode={startInVoiceMode}
      />

      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => {
          setIsAlertsModalOpen(false);
          setActiveTab('home');
        }}
        location={currentLocation}
        language={language}
      />

      {/* WhatsApp Community Bulletin Share Modal */}
      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        location={currentLocation}
        currentWeather={weather}
        crop={selectedCrop}
        language={language}
      />
    </div>
  );
}
