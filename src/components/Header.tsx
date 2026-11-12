import React, { useState, useEffect, useRef } from 'react';
import {
  CloudRain,
  Languages,
  MapPin,
  Navigation,
  ChevronDown,
  Check,
  RefreshCw,
  Search,
  Globe,
  Bell,
  Bot,
  Home,
  X
} from 'lucide-react';
import { GeocodeLocation } from '../types';
import { AGRICULTURAL_PRESET_REGIONS } from '../constants/regions';
import { getTranslations } from '../i18n/translations';

interface HeaderProps {
  activeTab: 'home' | 'ask' | 'alerts';
  onSelectTab: (tab: 'home' | 'ask' | 'alerts') => void;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  currentLocation: GeocodeLocation;
  onSelectLocation: (loc: GeocodeLocation) => void;
  onDetectLocation: () => void;
  isDetectingLocation?: boolean;
}

const LANGUAGES = [
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'bho', label: 'भोजपुरी (Bhojpuri)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'en', label: 'English' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  currentLanguage,
  onSelectLanguage,
  currentLocation,
  onSelectLocation,
  onDetectLocation,
  isDetectingLocation = false,
}) => {
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const t = getTranslations(currentLanguage);

  // Search geocode query with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error('Failed to geocode:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage);
  const currentLangLabel = currentLangObj?.label.split(' ')[0] || 'हिन्दी';

  const shortCityName = currentLocation.name.split(',')[0].trim();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7EE]/95 backdrop-blur-md border-b border-[#E8E2D2] w-full max-w-full">
      {/* ================= DESKTOP & TABLET BAR (sm: and up) ================= */}
      <div className="hidden sm:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 items-center justify-between gap-4">
        {/* Left: WeatherGPT Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E5A83B] to-[#F59E0B] flex items-center justify-center text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
            <CloudRain className="w-5 h-5 fill-slate-900 stroke-slate-900" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
            Weather<span className="text-[#C27803]">GPT</span>
          </span>
        </div>

        {/* Right: Location, Language & Direct Voice Action (Top Bar Contract Zone 2 & 3) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Location Selector Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationDropdown((prev) => !prev);
                setShowLangDropdown(false);
              }}
              title={t.nav.detectLocation}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-[#DDD5C0] text-slate-800 text-xs sm:text-sm font-medium transition shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#C27803] shrink-0" />
                <span className="truncate max-w-[140px] font-semibold">{shortCityName}</span>
                {currentLocation.isLiveGps && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                    GPS
                  </span>
                )}
              </div>
              {isDetectingLocation ? (
                <RefreshCw className="w-3 h-3 text-[#C27803] animate-spin shrink-0" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              )}
            </button>
          </div>

          {/* Language Selector Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangDropdown((prev) => !prev);
                setShowLocationDropdown(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 border border-[#DDD5C0] text-slate-800 text-xs sm:text-sm font-semibold transition shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>{currentLangLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Primary Action Button: Direct Voice Ask */}
          <button
            onClick={() => onSelectTab('ask')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <div className="w-2 h-2 rounded-full bg-[#E5A83B]" />
            <span>{t.nav.ask}</span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE EXPANDED BAR (< sm / phones) ================= */}
      <div className="sm:hidden px-3 py-2.5 flex items-center justify-between gap-1.5">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#E5A83B] to-[#F59E0B] flex items-center justify-center text-slate-950 shadow-xs">
            <CloudRain className="w-4 h-4 fill-slate-900 stroke-slate-900" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 font-serif">
            Weather<span className="text-[#C27803]">GPT</span>
          </span>
        </div>

        {/* Right Quick Controls (Location & Language) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Location Pill */}
          <button
            onClick={() => {
              setShowLocationDropdown((prev) => !prev);
              setShowLangDropdown(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DDD5C0] text-slate-800 text-xs font-semibold shadow-2xs active:bg-[#FAF7EE] max-w-[140px]"
          >
            <MapPin className="w-3 h-3 text-[#C27803] shrink-0" />
            <span className="truncate">{shortCityName}</span>
            {currentLocation.isLiveGps && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                GPS
              </span>
            )}
            {isDetectingLocation ? (
              <RefreshCw className="w-2.5 h-2.5 text-[#C27803] animate-spin shrink-0" />
            ) : (
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            )}
          </button>

          {/* Language Pill */}
          <button
            onClick={() => {
              setShowLangDropdown((prev) => !prev);
              setShowLocationDropdown(false);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#DDD5C0] text-slate-800 text-xs font-semibold shadow-2xs active:bg-[#FAF7EE]"
          >
            <Globe className="w-3 h-3 text-slate-600 shrink-0" />
            <span>{currentLangLabel}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* ================= LOCATION SELECTION MODAL/DROPDOWN ================= */}
      {showLocationDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            onClick={() => setShowLocationDropdown(false)}
          />

          {/* Popup Container */}
          <div className="fixed inset-x-3 top-24 max-w-sm mx-auto sm:inset-auto sm:absolute sm:right-6 sm:top-14 sm:w-80 bg-white rounded-3xl shadow-2xl z-50 p-4 border border-[#DDD5C0] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E2D2]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C27803]" />
                <span className="font-bold text-sm text-slate-900">{t.nav.detectLocation}</span>
              </div>
              <button
                onClick={() => setShowLocationDropdown(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-full bg-[#FAF7EE] border border-[#DDD5C0] rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#C27803] font-medium"
                autoFocus
              />
              {isSearching && (
                <RefreshCw className="w-3.5 h-3.5 text-[#C27803] animate-spin absolute right-3 top-2.5" />
              )}
            </div>

            {/* GPS Auto-detect Button */}
            <button
              onClick={() => {
                onDetectLocation();
                setShowLocationDropdown(false);
              }}
              disabled={isDetectingLocation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mb-3 rounded-xl bg-[#E8F3EB] hover:bg-[#DCEDE0] active:scale-98 text-[#1E5438] text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-[#1E5438]" />
              <span>
                {isDetectingLocation ? t.nav.detecting : t.nav.detectLocation}
              </span>
            </button>

            {/* Search Results if any */}
            {searchResults.length > 0 && (
              <div className="mb-2 max-h-40 overflow-y-auto divide-y divide-[#EFEAD8] border-t border-b border-[#E8E2D2]">
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      onSelectLocation(res);
                      setShowLocationDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left py-2 px-2 hover:bg-[#FAF7EE] rounded-lg text-xs text-slate-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="font-medium truncate">{res.name}{res.admin1 ? `, ${res.admin1}` : ''}</span>
                    <span className="text-[10px] text-slate-400">{res.country}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Major Agricultural Regions Preset List */}
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400 pb-1.5 font-bold tracking-wider">
                {t.nav.popularMandis}
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {AGRICULTURAL_PRESET_REGIONS.map((region) => {
                  const isSelected =
                    currentLocation.latitude === region.latitude &&
                    currentLocation.longitude === region.longitude;
                  return (
                    <button
                      key={region.id}
                      onClick={() => {
                        onSelectLocation(region);
                        setShowLocationDropdown(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-2.5 rounded-xl flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF7EE] text-[#C27803] font-bold border border-[#E8E2D2]'
                          : 'text-slate-700 hover:bg-[#FAF7EE]'
                      }`}
                    >
                      <span className="truncate">{region.name}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#C27803] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= LANGUAGE SELECTION MODAL/DROPDOWN ================= */}
      {showLangDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            onClick={() => setShowLangDropdown(false)}
          />

          {/* Popup Container */}
          <div className="fixed inset-x-3 top-24 max-w-xs mx-auto sm:inset-auto sm:absolute sm:right-6 sm:top-14 sm:w-60 bg-white rounded-3xl shadow-2xl z-50 p-3 border border-[#DDD5C0] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {t.nav.selectLanguage}
              </span>
              <button
                onClick={() => setShowLangDropdown(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-0.5">
              {LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 text-[#C27803] font-bold border border-amber-200/60'
                        : 'text-slate-700 hover:bg-[#FAF7EE]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#C27803] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </header>
  );
};
