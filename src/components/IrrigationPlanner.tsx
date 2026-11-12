import React, { useState } from 'react';
import {
  Droplets,
  Layers,
  Clock,
  Gauge,
  Sliders,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { WeatherData, CropConfig } from '../types';
import { formatPrecip } from '../utils/weatherUtils';

interface IrrigationPlannerProps {
  weather: WeatherData;
  crop: CropConfig;
  stageIndex: number;
  isImperial: boolean;
}

type IrrigationSystem = 'drip' | 'pivot' | 'sprinkler' | 'flood';

export const IrrigationPlanner: React.FC<IrrigationPlannerProps> = ({
  weather,
  crop,
  stageIndex,
  isImperial,
}) => {
  const [selectedSystem, setSelectedSystem] = useState<IrrigationSystem>('drip');
  const [fieldAreaHa, setFieldAreaHa] = useState<number>(25); // 25 hectares default

  const currentKc = crop.stages[stageIndex]?.kc || 1.0;
  const todayEt0 = weather.daily?.et0_fao_evapotranspiration?.[0] || 4.2;
  const cropWaterConsumption = todayEt0 * currentKc; // mm/day

  const currentMoisturePct = weather.agronomic?.soil?.rootZonePct || 28;

  // System efficiencies and typical application rates (mm/hour)
  const systemConfigs = {
    drip: {
      name: 'Precision Drip / Micro-irrigation',
      efficiency: 0.92,
      deliveryRateMmPerHour: 3.5,
      desc: 'High uniformity, zero canopy wetting, minimum evaporative loss.',
    },
    pivot: {
      name: 'Center Pivot / Linear Move',
      efficiency: 0.82,
      deliveryRateMmPerHour: 5.0,
      desc: 'Large area mechanized distribution. Watch wind drift and droplet evaporative loss.',
    },
    sprinkler: {
      name: 'Solid Set Overhead Sprinklers',
      efficiency: 0.72,
      deliveryRateMmPerHour: 6.5,
      desc: 'Canopy interception and evaporation. Avoid running during high VPD or strong winds.',
    },
    flood: {
      name: 'Furrow / Border Strip Flood',
      efficiency: 0.58,
      deliveryRateMmPerHour: 10.0,
      desc: 'Gravity surface flow. Deep percolation and runoff losses occur.',
    },
  };

  const activeSystem = systemConfigs[selectedSystem];

  // Water requirement gross = Net ETc / Efficiency
  const netDeficitMm = Math.max(0, cropWaterConsumption - (weather.current.precipitation || 0));
  const grossWaterRequirementMm = netDeficitMm / activeSystem.efficiency;

  // Runtime hours needed
  const runtimeHours = (grossWaterRequirementMm / activeSystem.deliveryRateMmPerHour).toFixed(1);

  // Volumetric requirement in m3 (1 mm over 1 ha = 10 m3 water = 10,000 liters)
  const totalVolumeM3 = Math.round(grossWaterRequirementMm * 10 * fieldAreaHa);

  // Soil moisture deficit status
  const getSoilStatus = (pct: number) => {
    if (pct < 18) return { label: 'Severe Depletion (Below Wilting Point)', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
    if (pct < 24) return { label: 'Moderate Moisture Stress (Irrigate Soon)', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' };
    if (pct <= 34) return { label: 'Optimal Available Water Capacity', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' };
    return { label: 'Near Saturated / Field Capacity', color: 'text-cyan-800', bg: 'bg-cyan-50 border-cyan-200' };
  };

  const soilStatus = getSoilStatus(currentMoisturePct);

  return (
    <div className="bg-[#FAF7EE] rounded-2xl p-4 sm:p-5 border border-[#DDD5C0] w-full max-w-full overflow-hidden shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D2]">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#245E43]" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Irrigation Scheduling & Soil Water Budgeting
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            FAO-56 Penman-Monteith crop evapotranspiration balanced with root-zone moisture sensor readings.
          </p>
        </div>

        {/* System Selector */}
        <div className="flex flex-wrap gap-1 bg-[#EFEAD8] p-1 rounded-xl border border-[#DDD5C0] self-start sm:self-auto text-xs">
          {(['drip', 'pivot', 'sprinkler', 'flood'] as IrrigationSystem[]).map((sys) => (
            <button
              key={sys}
              onClick={() => setSelectedSystem(sys)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-colors cursor-pointer ${
                selectedSystem === sys
                  ? 'bg-[#245E43] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sys}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-4">
        {/* Left: Water Balance Calculations */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-3.5 rounded-xl bg-white border border-[#E8E2D2] text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900">{activeSystem.name}</span>
              <span className="font-mono tabular-nums text-teal-800 font-bold bg-[#E8F3EB] px-2 py-0.5 rounded-md border border-[#C5DEC9]">
                Efficiency: {Math.round(activeSystem.efficiency * 100)}%
              </span>
            </div>
            <p className="text-slate-600 text-xs mb-3">
              {activeSystem.desc}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#E8E2D2] font-mono tabular-nums text-center">
              <div className="bg-[#FAF7EE] p-2 rounded-lg border border-[#DDD5C0]">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Reference ET₀</span>
                <span className="text-xs font-bold text-slate-800">{formatPrecip(todayEt0, isImperial)}</span>
              </div>
              <div className="bg-[#FAF7EE] p-2 rounded-lg border border-[#DDD5C0]">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Crop Kc</span>
                <span className="text-xs font-bold text-[#245E43]">{currentKc}</span>
              </div>
              <div className="bg-[#FAF7EE] p-2 rounded-lg border border-[#DDD5C0]">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Crop ETc</span>
                <span className="text-xs font-bold text-teal-700">{formatPrecip(cropWaterConsumption, isImperial)}</span>
              </div>
              <div className="bg-[#FAF7EE] p-2 rounded-lg border border-[#DDD5C0]">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Net Deficit</span>
                <span className="text-xs font-bold text-rose-700">{formatPrecip(netDeficitMm, isImperial)}</span>
              </div>
            </div>
          </div>

          {/* Area setting & Runtime calculation */}
          <div className="p-4 rounded-xl bg-[#E8F3EB] border border-[#C5DEC9] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-[#1D4A34]">Recommended Irrigation Runtime</span>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">{runtimeHours}</span>
                <span className="text-xs text-slate-600 font-medium">hours runtime</span>
              </div>
              <p className="text-xs text-slate-600">
                To deliver <strong className="text-[#245E43] font-mono tabular-nums">{formatPrecip(grossWaterRequirementMm, isImperial)}</strong> gross depth.
              </p>
            </div>

            <div className="text-center sm:text-right p-3 rounded-lg bg-white border border-[#C5DEC9] text-xs shadow-2xs">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Field Water Volume</span>
              <span className="text-base font-bold text-[#245E43] font-mono tabular-nums">
                {totalVolumeM3.toLocaleString()} m³
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                (for ~{fieldAreaHa} hectares / {Math.round(fieldAreaHa * 2.471)} acres)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Soil Profile Moisture Column */}
        <div className="p-4 rounded-xl bg-white border border-[#E8E2D2] flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold mb-3">
              <Layers className="w-3.5 h-3.5 text-[#C27803]" />
              <span>Root Zone Water Availability</span>
            </div>

            <div className={`p-3 rounded-xl border text-xs mb-3 ${soilStatus.bg}`}>
              <span className={`font-semibold block ${soilStatus.color}`}>
                {soilStatus.label}
              </span>
              <span className="text-xs text-slate-600 mt-1 block">
                Current root depth tension is at <strong className="font-mono tabular-nums">{currentMoisturePct}%</strong> volumetric water content.
              </span>
            </div>

            {/* Visual soil saturation gradient */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Field Capacity (~35%)</span>
                <span>Wilting Point (~16%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                {/* 50% MAD marker */}
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-rose-500/60 z-10" title="50% Management Allowed Depletion" />
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500 rounded-full"
                  style={{ width: `${Math.min(100, (currentMoisturePct / 40) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-center font-mono pt-1">
                Management Allowed Depletion (MAD) threshold: 50%
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E2D2] text-[11px] text-slate-500 flex items-center justify-between">
            <span>Crop: {crop.name.split('(')[0]}</span>
            <span className="text-[#245E43] font-semibold font-mono tabular-nums">Root Depth: {crop.rootDepthCm}cm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
