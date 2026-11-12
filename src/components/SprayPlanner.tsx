import React, { useState } from 'react';
import {
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { WeatherData } from '../types';
import { formatTemp, formatWind } from '../utils/weatherUtils';

interface SprayPlannerProps {
  weather: WeatherData;
  isImperial: boolean;
}

type ChemicalType = 'herbicide' | 'fungicide' | 'insecticide' | 'foliar_fert';

export const SprayPlanner: React.FC<SprayPlannerProps> = ({ weather, isImperial }) => {
  const [selectedChem, setSelectedChem] = useState<ChemicalType>('herbicide');
  const hourlySpray = weather.agronomic?.hourlySpray || [];

  const chemProfiles = {
    herbicide: {
      title: 'Selective & Systemic Herbicides',
      desc: 'High sensitivity to spray drift onto neighboring crops. Requires at least 2-4 hours rainfastness before precipitation.',
      minWind: 4,
      maxWind: 14,
      maxDeltaT: 8,
      rainThreshold: 30,
    },
    fungicide: {
      title: 'Protectant & Translaminar Fungicides',
      desc: 'Requires thorough leaf surface droplet retention. Delta-T should be between 2°C and 8°C to prevent droplets evaporating mid-air.',
      minWind: 3,
      maxWind: 12,
      maxDeltaT: 7,
      rainThreshold: 25,
    },
    insecticide: {
      title: 'Targeted Contact & Systemic Insecticides',
      desc: 'Best sprayed during early morning or dusk to minimize honeybee/pollinator exposure and avoid midday thermal plume updrafts.',
      minWind: 4,
      maxWind: 13,
      maxDeltaT: 8,
      rainThreshold: 35,
    },
    foliar_fert: {
      title: 'Foliar Fertilizers & Micronutrients',
      desc: 'Delicate leaf stomata absorption. Avoid high temperatures (>28°C) and high Delta-T to prevent salt scorch or cuticle burn.',
      minWind: 2,
      maxWind: 15,
      maxDeltaT: 6,
      rainThreshold: 20,
    },
  };

  const activeProfile = chemProfiles[selectedChem];

  // Evaluate hourly status according to selected chemical constraints
  const evaluateHour = (item: (typeof hourlySpray)[0]) => {
    if (item.rainProb > activeProfile.rainThreshold) {
      return { status: 'poor', reason: `High rain risk (${item.rainProb}%) - pesticide wash-off` };
    }
    if (item.wind > activeProfile.maxWind) {
      return { status: 'poor', reason: `High wind drift (${item.wind} km/h > ${activeProfile.maxWind} max)` };
    }
    if (item.wind < activeProfile.minWind) {
      return { status: 'warning', reason: 'Near zero wind (<3 km/h) - thermal inversion drift risk' };
    }
    if (item.deltaT > activeProfile.maxDeltaT) {
      return { status: 'warning', reason: `High Delta-T (${item.deltaT}°C) - rapid droplet evaporation` };
    }
    if (item.temp > 29) {
      return { status: 'warning', reason: `High temp (${item.temp}°C) - product volatilization risk` };
    }
    return { status: 'optimal', reason: 'Optimal conditions for droplet deposition' };
  };

  const evaluatedHours = hourlySpray.slice(0, 18).map((h) => ({
    ...h,
    customEval: evaluateHour(h),
  }));

  const optimalCount = evaluatedHours.filter((h) => h.customEval.status === 'optimal').length;
  const bestHour = evaluatedHours.find((h) => h.customEval.status === 'optimal');

  return (
    <div className="bg-[#FAF7EE] rounded-2xl p-3.5 sm:p-5 border border-[#DDD5C0] w-full max-w-full overflow-hidden shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D2]">
        <div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-[#245E43]" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Spray Window & Chemical Drift Optimizer
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time spray suitability factoring Delta-T, wind velocity, thermal inversions, and rainfastness.
          </p>
        </div>

        {/* Chemical Selector */}
        <div className="flex flex-wrap gap-1 bg-[#EFEAD8] p-1 rounded-xl border border-[#DDD5C0] self-start sm:self-auto text-xs">
          {(['herbicide', 'fungicide', 'insecticide', 'foliar_fert'] as ChemicalType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedChem(type)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                selectedChem === type
                  ? 'bg-[#245E43] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Target Application Profile Info */}
      <div className="my-3.5 p-3.5 rounded-xl bg-white border border-[#E8E2D2] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="space-y-1">
          <span className="font-bold text-slate-900">{activeProfile.title}</span>
          <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">
            {activeProfile.desc}
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono tabular-nums shrink-0">
          <div className="text-center p-2 rounded-lg bg-[#FAF7EE] border border-[#DDD5C0]">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Wind Window</span>
            <span className="text-xs font-bold text-teal-800">
              {formatWind(activeProfile.minWind, isImperial)} - {formatWind(activeProfile.maxWind, isImperial)}
            </span>
          </div>
          <div className="text-center p-2 rounded-lg bg-[#FAF7EE] border border-[#DDD5C0]">
            <span className="text-[10px] text-slate-500 block uppercase font-sans">Max Delta-T</span>
            <span className="text-xs font-bold text-[#C27803]">{activeProfile.maxDeltaT}°C</span>
          </div>
        </div>
      </div>

      {/* Summary recommendation callout */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#E8F3EB] border border-[#C5DEC9] text-xs mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#245E43] shrink-0" />
          <span className="text-[#1D4A34]">
            <strong>{optimalCount} of next 18 hours</strong> qualify as optimal spray conditions.
            {bestHour && (
              <span className="ml-1 text-[#245E43] font-medium">
                Recommended entry around {new Date(bestHour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}.
              </span>
            )}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#245E43] font-semibold px-2 py-0.5 rounded-md bg-white border border-[#C5DEC9] shrink-0">
          EPA / APVMA Standard
        </span>
      </div>

      {/* Hourly Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {evaluatedHours.map((hour, idx) => {
          const d = new Date(hour.time);
          const timeLabel = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
          const status = hour.customEval.status;

          const statusStyles = {
            optimal: 'bg-white border-emerald-300 hover:border-emerald-500 shadow-2xs',
            warning: 'bg-white border-amber-300 hover:border-amber-500 shadow-2xs',
            poor: 'bg-white border-rose-200 hover:border-rose-400 opacity-90',
          }[status];

          const badgeStyles = {
            optimal: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            warning: 'bg-amber-50 text-amber-800 border-amber-200',
            poor: 'bg-rose-50 text-rose-800 border-rose-200',
          }[status];

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${statusStyles}`}
              title={hour.customEval.reason}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{timeLabel}</span>
                  <span className={`text-[9px] uppercase font-mono tabular-nums px-1.5 py-0.2 rounded-md border font-semibold ${badgeStyles}`}>
                    {status}
                  </span>
                </div>

                <div className="mt-2 space-y-1 font-mono tabular-nums text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Wind:</span>
                    <span className="text-slate-800 font-semibold">{formatWind(hour.wind, isImperial)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delta-T:</span>
                    <span className="text-[#C27803] font-semibold">{hour.deltaT}°C</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Rain:</span>
                    <span className="text-blue-600 font-semibold">{hour.rainProb}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[#E8E2D2] text-[10px] text-slate-500 truncate">
                {hour.customEval.reason}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
