export interface CropConfig {
  id: string;
  name: string;
  nameHi?: string;
  category: 'Cereal' | 'Fruit' | 'Vegetable' | 'Legume' | 'Cash Crop' | 'Nut';
  stages: { name: string; nameHi?: string; kc: number; description: string }[];
  idealTempMinC: number;
  idealTempMaxC: number;
  criticalFrostTempC: number;
  rootDepthCm: number;
  waterNeedMmPerDay: number;
  primaryPests: string[];
}

export interface FarmContext {
  locationName: string;
  latitude: number;
  longitude: number;
  cropName: string;
  cropStage: string;
  temperature: number;
  humidity: number;
  vpd: number;
  deltaT: number;
  windSpeed: number;
  windGusts: number;
  soilMoisture: number;
  soilTemp: number;
  et0: number;
  rainOutlook: string;
  sprayStatus: string;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    soil_temperature_0cm: number;
    soil_temperature_6cm: number;
    soil_moisture_0_to_1cm: number;
    soil_moisture_1_to_3cm: number;
    soil_moisture_3_to_9cm: number;
    soil_moisture_9_to_27cm: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    weather_code: number[];
    surface_pressure: number[];
    cloud_cover: number[];
    et0_fao_evapotranspiration: number[];
    vapour_pressure_deficit: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    soil_temperature_0cm: number[];
    soil_temperature_6cm: number[];
    soil_moisture_0_to_1cm: number[];
    soil_moisture_1_to_3cm: number[];
    soil_moisture_3_to_9cm: number[];
    soil_moisture_9_to_27cm: number[];
    uv_index: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    et0_fao_evapotranspiration: number[];
  };
  agronomic: {
    vpd: number;
    deltaT: number;
    soil: {
      seedbedPct: number;
      rootZonePct: number;
      deepPct: number;
      temp0cm: number;
      temp6cm: number;
    };
    currentSpray: {
      status: 'optimal' | 'warning' | 'poor';
      reason: string;
    };
    hourlySpray: {
      time: string;
      temp: number;
      rh: number;
      wind: number;
      rainProb: number;
      deltaT: number;
      status: 'optimal' | 'warning' | 'poor';
      reason: string;
    }[];
    dailyGDD: {
      date: string;
      gdd: number;
    }[];
  };
}

export interface GeocodeLocation {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isLiveGps?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AgronomyReport {
  summary: string;
  sprayWindow: {
    status: 'Optimal' | 'Caution' | 'Unfavorable';
    recommendedWindow: string;
    rationale: string;
    driftRisk: 'Low' | 'Moderate' | 'High';
    rainfastnessWindowHours: number;
  };
  irrigation: {
    recommendation: string;
    urgency: 'Low' | 'Medium' | 'High';
    depletionStatus: string;
    waterBalanceNetMm: number;
    systemRuntimeHours: string;
  };
  pestDiseaseAlert: {
    riskLevel: 'Low' | 'Moderate' | 'High';
    primaryThreats: string[];
    microclimateDriver: string;
    preventativeAction: string;
  };
  fieldTrafficability: {
    status: 'Good' | 'Marginal' | 'Unfavorable';
    soilCompactionRisk: 'Low' | 'Medium' | 'High';
    equipmentGuidance: string;
  };
  frostHeatRisk: {
    frostThreat: string;
    heatStressThreat: string;
    mitigation: string;
  };
  next72HoursActionPlan: string[];
}
