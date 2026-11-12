import React, { useState } from 'react';
import {
  Calendar,
  CloudSun,
  Droplets,
  Wind
} from 'lucide-react';
import { WeatherData, CropConfig } from '../types';
import { formatTemp, formatPrecip, formatWind, getWeatherCodeInfo } from '../utils/weatherUtils';

interface SevenDayForecastProps {
  weather: WeatherData;
  crop: CropConfig;
  stageIndex: number;
  isImperial: boolean;
  language?: 'hi' | 'en';
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({
  weather,
  crop,
  stageIndex,
  isImperial,
  language = 'hi',
}) => {
  const isHindi = language === 'hi';
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const daily = weather.daily;

  if (!daily || !daily.time || daily.time.length === 0) {
    return null;
  }

  const daysCount = Math.min(7, daily.time.length);
  const currentKc = crop.stages[stageIndex]?.kc || 1.0;

  const getDayAgronomicTag = (idx: number) => {
    const tMax = daily.temperature_2m_max[idx] ?? 25;
    const tMin = daily.temperature_2m_min[idx] ?? 12;
    const rainSum = daily.precipitation_sum[idx] ?? 0;
    const rainProb = daily.precipitation_probability_max[idx] ?? 0;
    const windMax = daily.wind_speed_10m_max[idx] ?? 10;

    if (tMin <= crop.criticalFrostTempC + 1.5) {
      return {
        label: isHindi ? 'पाला खतरा' : 'Frost Risk',
        color: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        action: isHindi ? 'शाम को हल्की सिंचाई करें, पाला से फसल बचाएं' : 'Prepare frost protection',
      };
    }
    if (rainSum > 12 || rainProb > 65) {
      return {
        label: isHindi ? 'बारिश अलर्ट' : 'Rain Alert',
        color: 'bg-blue-50 text-blue-800 border-blue-200',
        action: isHindi ? 'छिड़काव न करें, पानी निकासी ठीक रखें' : 'No spraying; clear drainage',
      };
    }
    if (tMax >= crop.idealTempMaxC + 2) {
      return {
        label: isHindi ? 'गर्मी / लू' : 'Heat Stress',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        action: isHindi ? 'खेत में नमी बनाए रखें, दोपहर में दवा न डालें' : 'Maintain hydration; flower drop risk',
      };
    }
    if (windMax > 18) {
      return {
        label: isHindi ? 'तेज हवा' : 'Wind Drift',
        color: 'bg-rose-50 text-rose-800 border-rose-200',
        action: isHindi ? 'दवा का छिड़काव न करें, दवा उड़ने का खतरा' : 'High wind drift; postpone spray',
      };
    }
    return {
      label: isHindi ? 'उत्तम मौसम' : 'Optimal Field',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      action: isHindi ? 'छिड़काव, खाद व जुताई के लिए अनुकूल मौसम' : 'Ideal for fieldwork and operations',
    };
  };

  const selectedTag = getDayAgronomicTag(selectedDayIdx);
  const selectedDate = new Date(daily.time[selectedDayIdx]);

  return (
    <div className="bg-[#FAF7EE] rounded-2xl p-3.5 sm:p-5 mb-5 border border-[#DDD5C0] w-full max-w-full overflow-hidden shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D2]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#245E43] shrink-0" />
          <h2 className="font-bold text-sm sm:text-base text-slate-900 truncate">
            {isHindi ? '7 दिनों का कृषि मौसम व कार्य योजना' : '7-Day Agronomic Forecast'}
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {isHindi ? 'दैनिक स्थिति' : 'Daily Outlook'}
        </span>
      </div>

      {/* Grid of 7 days strictly responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 my-3.5 w-full max-w-full">
        {Array.from({ length: daysCount }).map((_, idx) => {
          const date = new Date(daily.time[idx]);
          const dayName = idx === 0 ? (isHindi ? 'आज' : 'Today') : date.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { weekday: 'short' });
          const dateStr = date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
          const code = daily.weather_code[idx] ?? 0;
          const codeInfo = getWeatherCodeInfo(code);
          const tMax = daily.temperature_2m_max[idx] ?? 25;
          const tMin = daily.temperature_2m_min[idx] ?? 12;
          const rain = daily.precipitation_sum[idx] ?? 0;
          const rainProb = daily.precipitation_probability_max[idx] ?? 0;
          const tag = getDayAgronomicTag(idx);

          const isSelected = selectedDayIdx === idx;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#E8F3EB] border-[#245E43] shadow-xs ring-1 ring-[#245E43]/40'
                  : 'bg-white hover:bg-slate-50 border-[#E8E2D2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${idx === 0 ? 'text-[#C27803]' : 'text-slate-800'}`}>
                    {dayName}
                  </span>
                  <span className="text-[10px] font-mono tabular-nums text-slate-400">{dateStr}</span>
                </div>

                <div className="flex items-center gap-1.5 my-2">
                  <CloudSun className={`w-4 h-4 shrink-0 ${codeInfo.color}`} />
                  <span className="text-[11px] text-slate-700 font-medium truncate">
                    {codeInfo.label}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs font-mono tabular-nums my-1">
                  <span className="font-bold text-slate-900">{formatTemp(tMax, isImperial)}</span>
                  <span className="text-slate-500 text-[11px]">{formatTemp(tMin, isImperial)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums pt-1.5 border-t border-[#E8E2D2]">
                  <span className="flex items-center gap-1 text-blue-600 font-medium">
                    <Droplets className="w-3 h-3" />
                    {rainProb}%
                  </span>
                  <span>{formatPrecip(rain, isImperial)}</span>
                </div>

                <div className={`mt-2 text-[10px] font-semibold text-center py-0.5 px-1 rounded-md border truncate ${tag.color}`}>
                  {tag.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Advice */}
      <div className="p-4 rounded-xl bg-white border border-[#E8E2D2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              {selectedDayIdx === 0
                ? (isHindi ? 'आज का दिन' : 'Today')
                : selectedDate.toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${selectedTag.color}`}>
              {selectedTag.label}
            </span>
          </div>
          <p className="text-slate-700 text-xs sm:text-sm">
            <strong className="text-slate-900">{isHindi ? 'किसान सलाह:' : 'Action:'}</strong> {selectedTag.action}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E2D2] w-full sm:w-auto">
          <div>
            <span className="text-slate-500 text-[11px] block">{isHindi ? 'दैनिक वाष्पीकरण' : 'ET₀'}</span>
            <span className="font-bold text-teal-700">{formatPrecip(daily.et0_fao_evapotranspiration[selectedDayIdx] ?? 4.0, isImperial)}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">{isHindi ? 'अधिकतम हवा' : 'Max Wind'}</span>
            <span className="font-bold text-slate-800">{formatWind(daily.wind_gusts_10m_max[selectedDayIdx] ?? 12, isImperial)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
