// Offline LocalStorage Caching Strategy for E-Farmer
import { FarmerProfile, CropAnalysisRecord, WeatherData, WaterPlan } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'efarmer_cached_profile_v1',
  ANALYSES: 'efarmer_cached_analyses_v1',
  WEATHER: 'efarmer_cached_weather_v1',
  WATER_PLAN: 'efarmer_cached_water_plan_v1',
  LAST_SYNC: 'efarmer_last_sync_timestamp',
};

export interface OfflineSyncStatus {
  isOffline: boolean;
  lastSyncedAt: string | null;
  hasCachedData: boolean;
}

// 1. Farmer Profile Cache
export function saveCachedProfile(profile: FarmerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.warn('LocalStorage save profile failed:', e);
  }
}

export function getCachedProfile(): FarmerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage get profile failed:', e);
    return null;
  }
}

// 2. Crop Analysis Diagnoses Cache
export function saveCachedAnalyses(analyses: CropAnalysisRecord[]): void {
  try {
    // Keep up to 20 most recent diagnoses for offline viewing
    const slice = analyses.slice(0, 20);
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(slice));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  } catch (e) {
    console.warn('LocalStorage save analyses failed:', e);
  }
}

export function getCachedAnalyses(): CropAnalysisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ANALYSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage get analyses failed:', e);
    return [];
  }
}

// 3. Weather Data Cache (for offline advisory)
export function saveCachedWeather(weather: WeatherData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
  } catch (e) {
    console.warn('LocalStorage save weather failed:', e);
  }
}

export function getCachedWeather(): WeatherData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEATHER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// 4. Water Plan Cache
export function saveCachedWaterPlan(plan: WaterPlan): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WATER_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.warn('LocalStorage save water plan failed:', e);
  }
}

export function getCachedWaterPlan(): WaterPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WATER_PLAN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// 5. Last Sync Date helper
export function getLastSyncTime(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  } catch (e) {
    return null;
  }
}
