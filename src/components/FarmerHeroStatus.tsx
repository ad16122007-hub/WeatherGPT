import React, { useState } from 'react';
import {
  Mic,
  Bell,
  MapPin,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sprout
} from 'lucide-react';
import { WeatherData, CropConfig, GeocodeLocation } from '../types';
import { formatTemp, formatWind, formatPrecip } from '../utils/weatherUtils';

interface FarmerHeroStatusProps {
  location: GeocodeLocation;
  crop: CropConfig;
  stageIndex: number;
  weather: WeatherData;
  language: 'hi' | 'en';
  isImperial: boolean;
  onOpenVoiceChat: () => void;
  onOpenAlerts: () => void;
  onOpenAudit: () => void;
}

export const FarmerHeroStatus: React.FC<FarmerHeroStatusProps> = ({
  location,
  crop,
  stageIndex,
  weather,
  language,
  isImperial,
  onOpenVoiceChat,
  onOpenAlerts,
  onOpenAudit,
}) => {
  const isHindi = language === 'hi';
  const current = weather.current;
  const agronomic = weather.agronomic;
  const rainProb = weather.hourly?.precipitation_probability?.[0] ?? 0;
  const windKmh = current.wind_speed_10m;
  const tempC = current.temperature_2m;

  // Evaluate Spray Status label in Hindi / English
  const getSpraySummary = () => {
    if (agronomic.currentSpray.status === 'optimal') {
      return {
        label: isHindi ? 'छिड़काव के लिए सही' : 'Optimal for Spraying',
        color: 'text-emerald-400',
        dot: 'bg-emerald-400',
      };
    }
    if (agronomic.currentSpray.status === 'warning') {
      return {
        label: isHindi ? 'सावधानी से छिड़काव करें' : 'Spray with Caution',
        color: 'text-amber-400',
        dot: 'bg-amber-400',
      };
    }
    return {
      label: isHindi ? 'अभी छिड़काव न करें' : 'Unfavorable for Spray',
      color: 'text-rose-400',
      dot: 'bg-rose-400',
    };
  };

  // Evaluate Irrigation advice in Hindi / English
  const getIrrigationSummary = () => {
    const moisture = agronomic.soil.rootZonePct;
    if (moisture < 22) {
      return {
        status: isHindi ? 'तुरंत आवश्यक' : 'Immediate Need',
        desc: isHindi ? 'खेत में नमी कम है, पानी लगाएं' : 'Low moisture, irrigate soon',
        color: 'text-rose-400',
      };
    }
    if (moisture <= 32) {
      return {
        status: isHindi ? 'उपयुक्त' : 'Suitable',
        desc: isHindi ? 'सिंचाई कर सकते हैं' : 'Can irrigate as per cycle',
        color: 'text-emerald-400',
      };
    }
    return {
      status: isHindi ? 'पर्याप्त नमी' : 'Sufficient Moisture',
      desc: isHindi ? 'अभी पानी लगाने की आवश्यकता नहीं' : 'Adequate soil water reserve',
      color: 'text-cyan-400',
    };
  };

  // Evaluate Rain summary label in Hindi / English
  const getRainSummary = () => {
    if (rainProb < 20) {
      return isHindi ? 'बारिश की चिंता नहीं' : 'No rain concern';
    }
    if (rainProb < 50) {
      return isHindi ? 'हल्की फुहार संभव' : 'Light shower possible';
    }
    return isHindi ? 'बारिश की संभावना, सतर्क रहें' : 'Rain expected, stay alert';
  };

  // Temperature description
  const getTempSummary = () => {
    if (tempC < 14) return isHindi ? 'ठंडा मौसम' : 'Cool Weather';
    if (tempC <= 32) return isHindi ? 'सामान्य मौसम' : 'Moderate Weather';
    return isHindi ? 'गर्म मौसम (लू का ध्यान रखें)' : 'Hot Weather';
  };

  const spraySummary = getSpraySummary();
  const irrigationSummary = getIrrigationSummary();
  const rainSummary = getRainSummary();
  const tempSummary = getTempSummary();

  const cityName = location.name.split(',')[0].split('(')[0].trim();

  return (
    <div className="w-full max-w-full overflow-hidden mb-5">
      {/* 1. Hero Banner matching video */}
      <div className="w-full text-left pt-2 pb-5 px-1 sm:px-2">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium mb-3 shadow-sm">
          <Sprout className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {isHindi ? 'Built for farmers · किसान भाइयों के लिए' : 'Built for Farmers · Powered by Agri-AI'}
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight leading-snug sm:leading-tight">
          {isHindi ? (
            <>
              अपनी भाषा में मौसम पूछें।
              <span className="block text-stone-300 font-normal text-lg sm:text-2xl mt-0.5">
                Ask in your language, get simple answers.
              </span>
            </>
          ) : (
            <>
              Precision Weather & Farm AI
              <span className="block text-stone-300 font-normal text-lg sm:text-2xl mt-0.5">
                Simple answers in your language.
              </span>
            </>
          )}
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mt-4 w-full sm:w-auto">
          {/* Big Yellow/Amber Voice CTA Button */}
          <button
            onClick={onOpenVoiceChat}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-extrabold text-sm sm:text-base shadow-lg shadow-amber-950/40 border border-amber-300/50 transition-all active:scale-[0.98]"
          >
            <Mic className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            <span>
              {isHindi ? 'बोलकर मौसम पूछें · Ask WeatherGPT' : 'Ask with Voice · Talk to WeatherGPT'}
            </span>
          </button>

          {/* Secondary Alerts CTA Button */}
          <button
            onClick={onOpenAlerts}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200 text-xs sm:text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>
              {isHindi ? 'मौसम चेतावनी सेट करें · Set alerts' : 'View Weather Alerts & Warnings'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Today's Farm Status Card matching video */}
      <div className="farm-card rounded-2xl p-4 sm:p-5 border-emerald-800/40 w-full max-w-full overflow-hidden shadow-xl">
        {/* Status Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-100">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>
              {cityName} {isHindi ? 'के खेत का आज का हाल:' : 'Farm Live Status:'}
            </span>
          </div>

          <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-semibold flex items-center gap-1 shrink-0">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span>{isHindi ? 'लाइव आईएमडी डेटा' : 'Live IMD Telemetry'}</span>
          </span>
        </div>

        {/* 4 Cards 2x2 Grid (Strictly responsive, zero overflow) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 w-full">
          {/* 1. तापमान */}
          <div className="bg-stone-950/70 rounded-xl p-3 sm:p-3.5 border border-stone-800/70 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
              <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{isHindi ? 'तापमान' : 'Temperature'}</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-stone-100 font-mono">
                {formatTemp(tempC, isImperial)}
              </span>
              <p className="text-[11px] sm:text-xs text-stone-300 mt-1 truncate">
                {tempSummary}
              </p>
            </div>
          </div>

          {/* 2. बारिश संभावना */}
          <div className="bg-stone-950/70 rounded-xl p-3 sm:p-3.5 border border-stone-800/70 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
              <CloudRain className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{isHindi ? 'बारिश संभावना' : 'Rain Probability'}</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                {rainProb}%
              </span>
              <p className="text-[11px] sm:text-xs text-stone-300 mt-1 truncate">
                {rainSummary}
              </p>
            </div>
          </div>

          {/* 3. हवा की गति */}
          <div className="bg-stone-950/70 rounded-xl p-3 sm:p-3.5 border border-stone-800/70 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
              <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{isHindi ? 'हवा की गति' : 'Wind Speed'}</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-stone-100 font-mono">
                {formatWind(windKmh, isImperial)}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${spraySummary.dot} shrink-0`} />
                <p className={`text-[11px] sm:text-xs font-semibold ${spraySummary.color} truncate`}>
                  {spraySummary.label}
                </p>
              </div>
            </div>
          </div>

          {/* 4. सिंचाई सलाह */}
          <div className="bg-stone-950/70 rounded-xl p-3 sm:p-3.5 border border-stone-800/70 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{isHindi ? 'सिंचाई सलाह' : 'Irrigation Advice'}</span>
            </div>
            <div className="mt-2">
              <span className={`text-xl sm:text-2xl font-black font-mono ${irrigationSummary.color} truncate block`}>
                {irrigationSummary.status}
              </span>
              <p className="text-[11px] sm:text-xs text-stone-300 mt-1 truncate">
                {irrigationSummary.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Banner on Status Card: Active Crop Info */}
        <div className="mt-3 pt-2.5 border-t border-stone-800/70 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5 truncate">
            <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              {isHindi ? 'फसल:' : 'Crop:'}{' '}
              <strong className="text-stone-200">
                {isHindi && crop.nameHi ? crop.nameHi : crop.name.split('/')[0]}
              </strong>{' '}
              ({crop.stages[stageIndex]?.nameHi || crop.stages[stageIndex]?.name})
            </span>
          </div>

          <button
            onClick={onOpenAudit}
            className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 shrink-0 ml-2"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{isHindi ? 'पूरी रिपोर्ट' : 'Full Audit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
