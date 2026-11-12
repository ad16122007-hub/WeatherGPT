export interface WeatherCodeInfo {
  label: string;
  iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudFog' | 'CloudDrizzle' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'CloudHail';
  color: string;
}

export function getWeatherCodeInfo(code: number): WeatherCodeInfo {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', iconName: 'Sun', color: 'text-amber-400' };
    case 1:
      return { label: 'Mainly Clear', iconName: 'CloudSun', color: 'text-amber-300' };
    case 2:
      return { label: 'Partly Cloudy', iconName: 'CloudSun', color: 'text-emerald-300' };
    case 3:
      return { label: 'Overcast', iconName: 'Cloud', color: 'text-stone-300' };
    case 45:
    case 48:
      return { label: 'Fog / Dew Mist', iconName: 'CloudFog', color: 'text-teal-300' };
    case 51:
    case 53:
    case 55:
      return { label: 'Light Drizzle', iconName: 'CloudDrizzle', color: 'text-blue-300' };
    case 61:
    case 63:
      return { label: 'Moderate Rain', iconName: 'CloudRain', color: 'text-blue-400' };
    case 65:
      return { label: 'Heavy Rain', iconName: 'CloudRain', color: 'text-blue-500' };
    case 71:
    case 73:
    case 75:
      return { label: 'Snowfall', iconName: 'CloudSnow', color: 'text-cyan-200' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', iconName: 'CloudRain', color: 'text-blue-400' };
    case 95:
      return { label: 'Thunderstorm', iconName: 'CloudLightning', color: 'text-amber-500' };
    case 96:
    case 99:
      return { label: 'Thunderstorm w/ Hail', iconName: 'CloudHail', color: 'text-red-400' };
    default:
      return { label: 'Variable Weather', iconName: 'Cloud', color: 'text-emerald-400' };
  }
}

export function formatTemp(celsius: number, isImperial: boolean): string {
  if (isImperial) {
    const f = Math.round(celsius * 1.8 + 32);
    return `${f}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatPrecip(mm: number, isImperial: boolean): string {
  if (isImperial) {
    const inches = (mm / 25.4).toFixed(2);
    return `${inches}"`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function formatWind(kmh: number, isImperial: boolean): string {
  if (isImperial) {
    const mph = Math.round(kmh * 0.621371);
    return `${mph} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function getVPDStatus(vpd: number): { label: string; color: string; bg: string; desc: string } {
  if (vpd < 0.4) {
    return {
      label: 'Excess Humidity / Fungal Risk',
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/60 border-cyan-700/50',
      desc: 'Plant transpiration stalled. High risk of leaf mold, botrytis, and edema.',
    };
  }
  if (vpd <= 1.25) {
    return {
      label: 'Optimal Transpiration Window',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/60 border-emerald-700/50',
      desc: 'Ideal nutrient translocation and open stomata. Excellent photosynthetic efficiency.',
    };
  }
  if (vpd <= 1.7) {
    return {
      label: 'Moderate Stomatal Restriction',
      color: 'text-amber-400',
      bg: 'bg-amber-950/60 border-amber-700/50',
      desc: 'Atmosphere pulling moisture faster than typical uptake. Monitor soil tension.',
    };
  }
  return {
    label: 'High Atmospheric Thirst / Stress',
    color: 'text-rose-400',
    bg: 'bg-rose-950/60 border-rose-700/50',
    desc: 'Severe VPD causing partial stomatal closure to prevent wilting. Photosynthesis slowed.',
  };
}

export function getDeltaTStatus(deltaT: number): { label: string; color: string; sprayFriendly: boolean } {
  if (deltaT < 2.0) {
    return { label: 'Low (<2°C): Slow droplet drying, fungal risk', color: 'text-amber-400', sprayFriendly: false };
  }
  if (deltaT <= 8.0) {
    return { label: 'Optimal (2-8°C): Excellent pesticide absorption', color: 'text-emerald-400', sprayFriendly: true };
  }
  if (deltaT <= 10.0) {
    return { label: 'Marginal (8-10°C): Rapid droplet evaporation', color: 'text-amber-400', sprayFriendly: false };
  }
  return { label: 'Poor (>10°C): High droplet evaporation / drift', color: 'text-rose-400', sprayFriendly: false };
}
