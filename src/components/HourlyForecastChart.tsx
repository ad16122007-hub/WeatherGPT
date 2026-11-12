import React, { useState } from 'react';
import { Clock, Droplets, Wind, Thermometer, Layers } from 'lucide-react';
import { WeatherData } from '../types';
import { formatTemp, formatPrecip, formatWind } from '../utils/weatherUtils';

interface HourlyForecastChartProps {
  weather: WeatherData;
  isImperial: boolean;
  language?: 'hi' | 'en';
}

export const HourlyForecastChart: React.FC<HourlyForecastChartProps> = ({
  weather,
  isImperial,
  language = 'hi',
}) => {
  const isHindi = language === 'hi';
  const [selectedMetric, setSelectedMetric] = useState<'temp' | 'rain' | 'wind' | 'soil'>('temp');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hourly = weather.hourly;
  const hoursToShow = 24; // 24 hours view
  const times = (hourly?.time || []).slice(0, hoursToShow);
  const temps = (hourly?.temperature_2m || []).slice(0, hoursToShow);
  const rainProbs = (hourly?.precipitation_probability || []).slice(0, hoursToShow);
  const rainAmounts = (hourly?.precipitation || []).slice(0, hoursToShow);
  const winds = (hourly?.wind_speed_10m || []).slice(0, hoursToShow);
  const gusts = (hourly?.wind_gusts_10m || []).slice(0, hoursToShow);
  const soils = (hourly?.soil_moisture_3_to_9cm || []).slice(0, hoursToShow).map((v) => Math.round(v * 100));

  if (!times.length) return null;

  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);
  const tempRange = maxTemp - minTemp || 1;
  const maxWind = Math.ceil(Math.max(...gusts, 20));

  const svgWidth = 680;
  const svgHeight = 130;
  const paddingX = 15;
  const paddingY = 15;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const getX = (idx: number) => paddingX + (idx / (hoursToShow - 1)) * chartWidth;
  const getYTemp = (val: number) => paddingY + chartHeight - ((val - minTemp) / tempRange) * chartHeight;
  const getYWind = (val: number) => paddingY + chartHeight - (val / maxWind) * chartHeight;

  const tempPoints = temps.map((val, idx) => `${getX(idx)},${getYTemp(val)}`).join(' ');
  const windPoints = winds.map((val, idx) => `${getX(idx)},${getYWind(val)}`).join(' ');
  const gustPoints = gusts.map((val, idx) => `${getX(idx)},${getYWind(val)}`).join(' ');

  const activeIdx = hoveredIndex !== null ? hoveredIndex : 0;
  const activeTimeStr = times[activeIdx];
  const activeDate = activeTimeStr ? new Date(activeTimeStr) : new Date();
  const formattedActiveTime = activeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="bg-[#FAF7EE] rounded-2xl p-3.5 sm:p-5 mb-5 border border-[#DDD5C0] w-full max-w-full overflow-hidden shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D2]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#245E43] shrink-0" />
          <h2 className="font-bold text-sm sm:text-base text-slate-900 truncate">
            {isHindi ? '24 घंटों का सटीक कृषि मौसम चक्र' : '24-Hour Precision Agro Timeline'}
          </h2>
        </div>

        {/* Metric Selector (Scrollable horizontally on tiny screens) */}
        <div className="flex items-center gap-1 bg-[#EFEAD8] p-1 rounded-xl border border-[#DDD5C0] overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setSelectedMetric('temp')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedMetric === 'temp'
                ? 'bg-[#245E43] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3 h-3" />
            <span>{isHindi ? 'तापमान' : 'Temp'}</span>
          </button>
          <button
            onClick={() => setSelectedMetric('rain')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedMetric === 'rain'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3 h-3" />
            <span>{isHindi ? 'बारिश' : 'Rain'}</span>
          </button>
          <button
            onClick={() => setSelectedMetric('wind')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedMetric === 'wind'
                ? 'bg-teal-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3 h-3" />
            <span>{isHindi ? 'हवा' : 'Wind'}</span>
          </button>
          <button
            onClick={() => setSelectedMetric('soil')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedMetric === 'soil'
                ? 'bg-[#C27803] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{isHindi ? 'जड़ नमी' : 'Soil'}</span>
          </button>
        </div>
      </div>

      {/* Active Inspector Bar */}
      <div className="grid grid-cols-4 gap-2 my-3 p-3 rounded-xl bg-white border border-[#E8E2D2] text-center text-xs shadow-2xs">
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">{isHindi ? 'समय' : 'Hour'}</span>
          <span className="font-bold text-slate-900 font-mono tabular-nums text-xs sm:text-sm">{formattedActiveTime}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">{isHindi ? 'तापमान' : 'Temp'}</span>
          <span className="font-bold text-[#245E43] font-mono tabular-nums text-xs sm:text-sm">{formatTemp(temps[activeIdx] ?? 20, isImperial)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">{isHindi ? 'बारिश' : 'Rain'}</span>
          <span className="font-bold text-blue-600 font-mono tabular-nums text-xs sm:text-sm">{rainProbs[activeIdx] ?? 0}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block font-mono">{isHindi ? 'हवा' : 'Wind'}</span>
          <span className="font-bold text-teal-700 font-mono tabular-nums text-xs sm:text-sm">{formatWind(winds[activeIdx] ?? 0, isImperial)}</span>
        </div>
      </div>

      {/* Scrollable Chart Viewport strictly enclosed */}
      <div className="w-full max-w-full overflow-x-auto no-scrollbar pt-1">
        <div className="w-[680px] max-w-none">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-32 overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
            <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={svgWidth - paddingX} y2={paddingY + chartHeight / 2} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />
            <line x1={paddingX} y1={paddingY + chartHeight} x2={svgWidth - paddingX} y2={paddingY + chartHeight} stroke="rgba(0,0,0,0.12)" />

            {selectedMetric === 'temp' && (
              <>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#245E43" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#245E43" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points={`${getX(0)},${paddingY + chartHeight} ${tempPoints} ${getX(hoursToShow - 1)},${paddingY + chartHeight}`} fill="url(#tempGrad)" />
                <polyline fill="none" stroke="#245E43" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={tempPoints} />
              </>
            )}

            {selectedMetric === 'rain' && (
              <>
                {rainProbs.map((prob, idx) => {
                  const barH = (prob / 100) * chartHeight;
                  const x = getX(idx) - 5;
                  const y = paddingY + chartHeight - barH;
                  return (
                    <rect key={idx} x={x} y={y} width="10" height={barH} rx="2" fill={prob > 40 ? '#2563eb' : '#60a5fa'} opacity={prob > 0 ? 0.85 : 0.2} />
                  );
                })}
              </>
            )}

            {selectedMetric === 'wind' && (
              <>
                <polyline fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={windPoints} />
                <polyline fill="none" stroke="#c27803" strokeWidth="1.5" strokeDasharray="4 3" points={gustPoints} />
              </>
            )}

            {selectedMetric === 'soil' && (
              <polyline fill="none" stroke="#c27803" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={soils.map((v, i) => `${getX(i)},${paddingY + chartHeight - (v / 60) * chartHeight}`).join(' ')} />
            )}

            {hoveredIndex !== null && (
              <line x1={getX(hoveredIndex)} y1={paddingY} x2={getX(hoveredIndex)} y2={paddingY + chartHeight} stroke="#0f172a" strokeWidth="1" strokeDasharray="2 2" />
            )}

            {times.map((_, idx) => (
              <rect
                key={idx}
                x={getX(idx) - (chartWidth / hoursToShow) / 2}
                y={0}
                width={chartWidth / hoursToShow}
                height={svgHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            ))}
          </svg>

          {/* Time ticks */}
          <div className="flex justify-between px-3 pt-1 text-[11px] font-mono tabular-nums text-slate-500">
            {times.filter((_, i) => i % 3 === 0).map((timeStr) => {
              const d = new Date(timeStr);
              return (
                <span key={timeStr}>
                  {d.toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 text-center mt-2 sm:hidden">
        {isHindi ? '← समय देखने के लिए चार्ट को दायें-बायें खिसकाएं →' : '← Swipe horizontally to see all hours →'}
      </p>
    </div>
  );
};
