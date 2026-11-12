import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudHail,
  Droplets,
  Wind,
  Gauge,
  Thermometer,
  Layers,
  Activity,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  Scale
} from 'lucide-react';
import { WeatherData, CropConfig } from '../types';
import {
  formatTemp,
  formatPrecip,
  formatWind,
  getWeatherCodeInfo,
  getVPDStatus,
  getDeltaTStatus,
} from '../utils/weatherUtils';

interface TelemetryCardsProps {
  weather: WeatherData;
  crop: CropConfig;
  stageIndex: number;
  isImperial: boolean;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({
  weather,
  crop,
  stageIndex,
  isImperial,
}) => {
  const current = weather.current;
  const agronomic = weather.agronomic;
  const weatherCodeInfo = getWeatherCodeInfo(current.weather_code);

  const currentKc = crop.stages[stageIndex]?.kc || 1.0;
  const todayEt0 = weather.daily?.et0_fao_evapotranspiration?.[0] || 4.2;
  const cropWaterConsumption = todayEt0 * currentKc; // ETc = ET0 * Kc

  const vpdStatus = getVPDStatus(agronomic.vpd);
  const deltaTStatus = getDeltaTStatus(agronomic.deltaT);

  // Icon mapping
  const renderWeatherIcon = () => {
    const props = { className: `w-12 h-12 ${weatherCodeInfo.color}` };
    switch (weatherCodeInfo.iconName) {
      case 'Sun': return <Sun {...props} />;
      case 'CloudSun': return <CloudSun {...props} />;
      case 'CloudFog': return <CloudFog {...props} />;
      case 'CloudDrizzle': return <CloudDrizzle {...props} />;
      case 'CloudRain': return <CloudRain {...props} />;
      case 'CloudSnow': return <CloudSnow {...props} />;
      case 'CloudLightning': return <CloudLightning {...props} />;
      case 'CloudHail': return <CloudHail {...props} />;
      default: return <Cloud {...props} />;
    }
  };

  const sprayColorBg = {
    optimal: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    poor: 'border-rose-200 bg-rose-50 text-rose-800',
  }[agronomic.currentSpray.status];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Core Atmospheric Condition Card */}
      <div className="bg-[#FAF7EE] rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-[#DDD5C0] shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Compass className="w-3.5 h-3.5 text-[#245E43]" />
              <span>ATMOSPHERIC OBSERVATION</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
                {formatTemp(current.temperature_2m, isImperial)}
              </span>
              <span className="text-xs text-slate-500 font-medium font-mono tabular-nums">
                Feels {formatTemp(current.apparent_temperature, isImperial)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-800">{weatherCodeInfo.label}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                H: {formatTemp(weather.daily?.temperature_2m_max?.[0] ?? current.temperature_2m, isImperial)} / L: {formatTemp(weather.daily?.temperature_2m_min?.[0] ?? current.temperature_2m, isImperial)}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-2xl bg-white border border-[#E8E2D2] shadow-2xs">
            {renderWeatherIcon()}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#E8E2D2] text-center font-mono tabular-nums">
          <div className="bg-white rounded-lg p-2 border border-[#E8E2D2] shadow-2xs">
            <p className="text-[10px] uppercase font-mono text-slate-500">Humidity</p>
            <p className="text-sm font-bold text-blue-700 mt-0.5">{current.relative_humidity_2m}%</p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-[#E8E2D2] shadow-2xs">
            <p className="text-[10px] uppercase font-mono text-slate-500">Dew Point</p>
            <p className="text-sm font-bold text-teal-800 mt-0.5">
              {formatTemp(weather.hourly?.dew_point_2m?.[0] ?? (current.temperature_2m - 4), isImperial)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-[#E8E2D2] shadow-2xs">
            <p className="text-[10px] uppercase font-mono text-slate-500">Pressure</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{Math.round(current.surface_pressure || current.pressure_msl)} hPa</p>
          </div>
        </div>
      </div>

      {/* 2. Soil Moisture & Root Zone Telemetry */}
      <div className="bg-[#FAF7EE] rounded-2xl p-4 flex flex-col justify-between border border-[#DDD5C0] shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Layers className="w-3.5 h-3.5 text-[#C27803]" />
              <span>SOIL MOISTURE</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F3EB] text-[#245E43] border border-[#C5DEC9]">
              Active Root Zone
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {/* Seedbed 0-1cm */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
                <span className="text-slate-600 text-[11px] font-sans">Seedbed (0-1 cm)</span>
                <span className="font-bold text-slate-800">{agronomic.soil.seedbedPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/60">
                <div
                  className="h-full bg-[#C27803] rounded-full"
                  style={{ width: `${Math.min(100, agronomic.soil.seedbedPct * 2)}%` }}
                />
              </div>
            </div>

            {/* Root Zone 3-9cm */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
                <span className="text-[11px] font-medium text-[#245E43] font-sans">Root Depth (3-9 cm)</span>
                <span className="font-bold text-[#245E43]">{agronomic.soil.rootZonePct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/60">
                <div
                  className="h-full bg-[#245E43] rounded-full"
                  style={{ width: `${Math.min(100, agronomic.soil.rootZonePct * 2)}%` }}
                />
              </div>
            </div>

            {/* Deep Subsoil 9-27cm */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono tabular-nums">
                <span className="text-slate-600 text-[11px] font-sans">Subsoil (9-27 cm)</span>
                <span className="font-bold text-slate-800">{agronomic.soil.deepPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300/60">
                <div
                  className="h-full bg-teal-700 rounded-full"
                  style={{ width: `${Math.min(100, agronomic.soil.deepPct * 2)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#E8E2D2] flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
          <span>Soil (0cm): <strong className="text-slate-800">{formatTemp(agronomic.soil.temp0cm, isImperial)}</strong></span>
          <span>(6cm): <strong className="text-slate-800">{formatTemp(agronomic.soil.temp6cm, isImperial)}</strong></span>
        </div>
      </div>

      {/* 3. Crop ETc & Evapotranspiration Balance */}
      <div className="bg-[#FAF7EE] rounded-2xl p-4 flex flex-col justify-between border border-[#DDD5C0] shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Droplets className="w-3.5 h-3.5 text-[#245E43]" />
              <span>WATER LOSS</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E8F3EB] text-teal-800 border border-[#C5DEC9]">
              Kc {currentKc}
            </span>
          </div>

          <div className="mt-3">
            <p className="text-[10px] uppercase font-mono text-slate-500">Crop Water Loss (ETc)</p>
            <div className="flex items-baseline gap-1.5 mt-0.5 font-mono tabular-nums">
              <span className="text-2xl font-black text-teal-800">
                {formatPrecip(cropWaterConsumption, isImperial)}
              </span>
              <span className="text-xs text-slate-500 font-sans">/ day</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
              Reference ET₀ is {formatPrecip(todayEt0, isImperial)}
            </p>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-white border border-[#E8E2D2] text-xs shadow-2xs font-mono tabular-nums">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-sans">Rain Today:</span>
              <span className="font-bold text-slate-900">{formatPrecip(current.precipitation, isImperial)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-700 mt-1">
              <span className="font-sans">Net Deficit:</span>
              <span className="font-bold text-rose-700">
                -{formatPrecip(Math.max(0, cropWaterConsumption - current.precipitation), isImperial)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#E8E2D2] text-[11px] text-slate-500 flex items-center justify-between">
          <span>Crop: {crop.name.split('(')[0]}</span>
          <span className="text-[#245E43] font-semibold font-mono">FAO-56 Model</span>
        </div>
      </div>

      {/* 4. Vapor Pressure Deficit (VPD) */}
      <div className="bg-[#FAF7EE] rounded-2xl p-4 flex flex-col justify-between border border-[#DDD5C0] shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Activity className="w-3.5 h-3.5 text-[#245E43]" />
              <span>VAPOR PRESSURE DEFICIT</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E8E2D2] text-slate-700">
              VPD
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2 font-mono tabular-nums">
              <span className="text-3xl font-black text-slate-900">
                {agronomic.vpd}
              </span>
              <span className="text-xs text-slate-500">kPa</span>
            </div>

            <div className={`mt-2 p-2.5 rounded-xl border text-xs shadow-2xs ${vpdStatus.bg}`}>
              <p className={`font-semibold text-xs ${vpdStatus.color}`}>
                {vpdStatus.label}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {vpdStatus.desc}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#E8E2D2] flex items-center justify-between text-[11px] text-slate-500">
          <span>Ideal: 0.8 - 1.25 kPa</span>
          <span className="text-slate-700 font-mono">Porometry</span>
        </div>
      </div>

      {/* 5. Spray Window & Delta-T Index */}
      <div className="bg-[#FAF7EE] rounded-2xl p-4 flex flex-col justify-between border border-[#DDD5C0] shadow-xs">
        <div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono">
              <Wind className="w-3.5 h-3.5 text-[#245E43]" />
              <span>SPRAYING CONDITIONS</span>
            </div>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border font-semibold ${sprayColorBg}`}>
              {agronomic.currentSpray.status}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono tabular-nums">
              <span className="text-slate-500 font-sans">Wind / Gusts:</span>
              <span className="font-semibold text-slate-800">
                {formatWind(current.wind_speed_10m, isImperial)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono tabular-nums">
              <span className="text-slate-500 font-sans">Delta-T:</span>
              <span className="font-semibold text-[#C27803]">
                {agronomic.deltaT}°C
              </span>
            </div>

            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-[#E8E2D2] leading-snug shadow-2xs">
              {agronomic.currentSpray.reason}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#E8E2D2] text-[11px] text-slate-500 flex items-center justify-between">
          <span>Delta-T Status:</span>
          <span className={`font-semibold ${deltaTStatus.color}`}>{deltaTStatus.sprayFriendly ? 'Acceptable' : 'Caution'}</span>
        </div>
      </div>
    </div>
  );
};
