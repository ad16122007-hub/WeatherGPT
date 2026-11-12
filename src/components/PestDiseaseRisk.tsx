import React from 'react';
import {
  Bug,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Droplets,
  Thermometer,
  Eye,
  Info
} from 'lucide-react';
import { WeatherData, CropConfig } from '../types';
import { formatTemp } from '../utils/weatherUtils';

interface PestDiseaseRiskProps {
  weather: WeatherData;
  crop: CropConfig;
  stageIndex: number;
  isImperial: boolean;
}

export const PestDiseaseRisk: React.FC<PestDiseaseRiskProps> = ({
  weather,
  crop,
  stageIndex,
  isImperial,
}) => {
  const currentTemp = weather.current.temperature_2m;
  const currentRH = weather.current.relative_humidity_2m;
  const vpd = weather.agronomic.vpd;

  // Derive Microclimate Disease Threat Indices
  // 1. Fungal / Leaf Wetness Threat (High RH + Moderate Temp 15-25°C)
  const isFungalSweetSpot = currentTemp >= 15 && currentTemp <= 26 && currentRH >= 70;
  const fungalRisk = isFungalSweetSpot
    ? { level: 'High', color: 'text-rose-700', bg: 'bg-white border-rose-300', badge: 'bg-rose-50 text-rose-800 border-rose-200' }
    : currentRH >= 60
    ? { level: 'Moderate', color: 'text-amber-800', bg: 'bg-white border-amber-300', badge: 'bg-amber-50 text-amber-800 border-amber-200' }
    : { level: 'Low', color: 'text-emerald-800', bg: 'bg-white border-emerald-300', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

  // 2. Insect Vector Reproduction Rate (Temperatures > 20°C accelerate lifecycles)
  const insectRisk = currentTemp >= 25 && currentTemp <= 34
    ? { level: 'High', color: 'text-rose-700', bg: 'bg-white border-rose-300', badge: 'bg-rose-50 text-rose-800 border-rose-200' }
    : currentTemp >= 18
    ? { level: 'Moderate', color: 'text-amber-800', bg: 'bg-white border-amber-300', badge: 'bg-amber-50 text-amber-800 border-amber-200' }
    : { level: 'Low', color: 'text-emerald-800', bg: 'bg-white border-emerald-300', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

  // 3. Bacterial Blight / Soft Rot (High rain/humidity + high temps)
  const bacterialRisk = currentRH >= 80 && currentTemp >= 24
    ? { level: 'High', color: 'text-rose-700', bg: 'bg-white border-rose-300', badge: 'bg-rose-50 text-rose-800 border-rose-200' }
    : { level: 'Low', color: 'text-emerald-800', bg: 'bg-white border-emerald-300', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };

  return (
    <div className="bg-[#FAF7EE] rounded-2xl p-4 sm:p-5 border border-[#DDD5C0] w-full max-w-full overflow-hidden shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D2]">
        <div>
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-[#C27803]" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Pest & Microclimate Pathogen Risk Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Epidemiological forecasting correlating ambient temperature, leaf wetness duration, and relative humidity.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 px-3 py-1 rounded-lg bg-white border border-[#E8E2D2] self-start sm:self-auto shadow-2xs">
          Host Crop: <strong className="text-[#245E43]">{crop.name.split('(')[0]}</strong>
        </span>
      </div>

      {/* Disease Risk Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        {/* Fungal Pathogens */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between shadow-2xs ${fungalRisk.bg}`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-900">Fungal Foliar Blight & Rust</span>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${fungalRisk.badge}`}>
                {fungalRisk.level} Risk
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Target pathogens: <em>Late Blight, Powdery Mildew, Botrytis cinerea, Septoria</em>.
            </p>
            <div className="mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
              Trigger: Sustained relative humidity ({currentRH}%) & ambient canopy temperature ({formatTemp(currentTemp, isImperial)}).
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-[#245E43] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Apply preventative translaminar copper/strobilurin</span>
          </div>
        </div>

        {/* Insect Vectors */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between shadow-2xs ${insectRisk.bg}`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-900">Insect Vector Multiplier</span>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${insectRisk.badge}`}>
                {insectRisk.level} Activity
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Target pests: <em>{crop.primaryPests.slice(0, 3).join(', ')}</em>.
            </p>
            <div className="mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
              Trigger: Rapid degree-day accumulation accelerates oviposition and larval instar molting.
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-[#C27803] font-medium flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span>Deploy pheromone delta traps; scout lower leaf surfaces</span>
          </div>
        </div>

        {/* Bacterial & Root Pathogens */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between shadow-2xs ${bacterialRisk.bg}`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-900">Bacterial & Vascular Wilt</span>
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${bacterialRisk.badge}`}>
                {bacterialRisk.level} Threat
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Target pathogens: <em>Ralstonia, Xanthomonas, Erwinia soft rot</em>.
            </p>
            <div className="mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
              Trigger: Soil saturation and warm root temperatures favor anaerobic bacterial multiplication.
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Ensure field drainage; avoid working wet foliage</span>
          </div>
        </div>
      </div>

      {/* Crop-Specific Primary Pests Reference List */}
      <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D2] flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
        <div className="flex items-center gap-2">
          <Bug className="w-3.5 h-3.5 text-[#C27803]" />
          <span className="text-slate-800 font-medium">
            Primary Watchlist for <strong>{crop.name.split('(')[0]}</strong>:
          </span>
          <span className="text-slate-600">
            {crop.primaryPests.join(' · ')}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          IPM (Integrated Pest Management) Guidance
        </span>
      </div>
    </div>
  );
};
