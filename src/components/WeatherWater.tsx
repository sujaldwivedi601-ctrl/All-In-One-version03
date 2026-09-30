import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Droplets, 
  Wind, 
  Thermometer, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  MapPin, 
  AlertTriangle, 
  Lock, 
  Save, 
  Search, 
  Compass, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle, 
  Sun, 
  CloudSun,
  Navigation
} from 'lucide-react';
import { WeatherData, WaterPlan, FarmerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useUserLocation } from '../context/LocationContext';
import {
  saveCachedWeather,
  getCachedWeather,
  saveCachedWaterPlan,
  getCachedWaterPlan
} from '../lib/offlineStorage';

interface WeatherWaterProps {
  profile: FarmerProfile | null;
  onUpdateProfile: (updated: FarmerProfile) => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  onOpenLocationModal?: () => void;
}

export const WeatherWater: React.FC<WeatherWaterProps> = ({
  profile,
  onUpdateProfile,
  isLoggedIn,
  onRequireLogin,
  onOpenLocationModal,
}) => {
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const { 
    latitude: globalLat, 
    longitude: globalLon, 
    locationName: globalLocationName, 
    detectLocation, 
    setLocation,
    isLocating: isLocatingGlobal
  } = useUserLocation();

  // Primary active coordinates: prefer user's detected/chosen GPS, fallback to profile coordinates if saved
  const lat = globalLat || (profile?.latitude && Number(profile.latitude) !== 0 ? Number(profile.latitude) : null);
  const lon = globalLon || (profile?.longitude && Number(profile.longitude) !== 0 ? Number(profile.longitude) : null);
  const locationName = globalLocationName || (profile?.village ? `${profile.village}${profile.district ? `, ${profile.district}` : ''}` : '');

  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(!lat);
  
  // Geocode Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Weather & Water Data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(() => getCachedWeather());
  const [waterPlan, setWaterPlan] = useState<any | null>(() => getCachedWaterPlan());
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // User Interactive Water Parameters
  const [landArea, setLandArea] = useState<number>(profile?.landAreaAcres ? Number(profile.landAreaAcres) : 2.0);
  const [selectedCrop, setSelectedCrop] = useState<string>(profile?.primaryCrop || 'Wheat');
  const [cropStage, setCropStage] = useState<string>(profile?.cropStage || 'Vegetative');
  const [irrigationType, setIrrigationType] = useState<string>(profile?.irrigationType || 'Flood / Furrow');
  const [pumpHp, setPumpHp] = useState<number>(5);

  // Search Indian villages, towns, and districts via Open-Meteo Geocoding
  const handleSearchLocations = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(text.trim())}`);
      const data = await res.json();
      if (data.success && data.results) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.warn('Geocode search failed:', e);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectFieldLocation = (place: any) => {
    setLocation(place.latitude, place.longitude, place.displayLabel, 'search');
    setSearchQuery('');
    setSearchResults([]);
    setIsEditingLocation(false);
  };

  const handleDetectGPS = async () => {
    setGpsNotice(isHindi ? 'सटीक जीपीएस सिग्नल ले रहे हैं...' : 'Acquiring high-accuracy GPS signal...');
    const ok = await detectLocation();
    if (ok) {
      setGpsNotice(null);
      setIsEditingLocation(false);
    } else {
      setGpsNotice(isHindi ? 'जीपीएस सिग्नल प्राप्त नहीं हुआ। कृपया गांव या जिला खोजें।' : 'Could not get GPS. Please search your village below.');
    }
  };

  // Fetch Weather & Recalculate Water Requirement for the Crop Field
  const fetchFieldWeatherAndWater = async () => {
    if (lat === null || lon === null) return;
    setLoading(true);
    try {
      // 1. Fetch Live Satellite Weather
      const wRes = await fetch(`/api/weather-intel?lat=${lat}&lon=${lon}&location=${encodeURIComponent(locationName)}`);
      const wJson = await wRes.json();
      let forecastRain = 0;
      if (wJson.success) {
        setWeatherData(wJson);
        saveCachedWeather(wJson);
        forecastRain = wJson.current?.rainfallForecastMm || 0;
      }

      // 2. Fetch Grounded Water Plan with live rain deduction
      const wpRes = await fetch('/api/water-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landAreaAcres: landArea,
          crop: selectedCrop,
          cropStage: cropStage,
          irrigationType: irrigationType,
          forecastRainMm: forecastRain,
          pumpHp: pumpHp,
        }),
      });
      const wpJson = await wpRes.json();
      if (wpJson.success) {
        setWaterPlan(wpJson.plan);
        saveCachedWaterPlan(wpJson.plan);
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lat !== null && lon !== null) {
      fetchFieldWeatherAndWater();
    }
  }, [lat, lon, landArea, selectedCrop, cropStage, irrigationType, pumpHp]);

  // Permanently save this field location to user's profile
  const handleSaveFieldToProfile = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    if (profile && lat && lon) {
      const parts = locationName.split(',');
      const v = parts[0]?.trim() || profile.village;
      const d = parts[1]?.trim() || profile.district;
      const s = parts[2]?.trim() || profile.state;
      onUpdateProfile({
        ...profile,
        village: v,
        district: d,
        state: s,
        latitude: lat,
        longitude: lon,
        landAreaAcres: landArea,
        primaryCrop: selectedCrop,
        cropStage: cropStage,
        irrigationType: irrigationType,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8 max-w-full overflow-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* CROP FIELD LOCATION SELECTOR (Clear distinction: Real GPS & Search) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{isHindi ? 'Real Location Target (वास्तविक स्थान)' : 'Real Farm Satellite Coordinates'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Outfit']">
              {locationName ? `Field: ${locationName}` : (isHindi ? 'आपका खेत किस स्थान पर है?' : 'Where Are Your Crop Fields Located?')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              {lat && lon 
                ? (isHindi 
                    ? `लाइव ओपन-मेटियो सैटेलाइट निर्देशांक लॉक हैं: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (तापमान इसी स्थान का है)` 
                    : `Live satellite telemetry locked on coordinates: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (Temperature basis)`)
                : (isHindi 
                    ? 'कृपया जीपीएस से अपना वास्तविक स्थान प्राप्त करें या अपना गांव खोजें ताकि असली मौसम दिखे।' 
                    : 'Please detect your real GPS coordinates or search your village to see genuine weather.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{isEditingLocation ? 'Close' : 'Change Location'}</span>
            </button>

            {isLoggedIn && lat && lon && (
              <button
                onClick={handleSaveFieldToProfile}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveSuccess ? (isHindi ? 'सहेज लिया!' : 'Saved to Profile!') : (isHindi ? 'प्रोफाइल में सहेजें' : 'Save to Profile')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & GPS Location Box */}
        {isEditingLocation && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocatingGlobal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocatingGlobal ? 'animate-spin' : ''}`} />
                <span>{isLocatingGlobal ? (isHindi ? 'जीपीएस ले रहे हैं...' : 'Pinpointing GPS...') : (isHindi ? 'मेरे डिवाइस का वास्तविक स्थान प्राप्त करें (GPS)' : 'Auto-Detect Real GPS Location')}</span>
              </button>

              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isHindi ? 'या गांव, तालुका, जिला खोजें (Search Village/City)...' : 'Or search your village, taluka, or district...'}
                  value={searchQuery}
                  onChange={(e) => handleSearchLocations(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm bg-white"
                />
              </div>
            </div>

            {gpsNotice && (
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{gpsNotice}</span>
              </div>
            )}

            {/* Results dropdown */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 divide-y divide-stone-100 bg-white">
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectFieldLocation(result)}
                    className="p-2.5 hover:bg-emerald-50 text-xs cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{result.displayLabel}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {result.latitude.toFixed(2)}°, {result.longitude.toFixed(2)}°
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* IF NO CROP FIELD LOCATION SET: PROMINENT CALL TO ACTION */}
      {/* ------------------------------------------------------------- */}
      {(!lat || !lon) && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-stone-900 font-['Outfit']">
            {isHindi ? 'आपका वास्तविक स्थान अभी सेट नहीं है' : 'Your Real Location is Not Set'}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            {isHindi
              ? 'कृपया ऊपर "Auto-Detect Real GPS Location" पर क्लिक करें या अपना गांव खोजें ताकि मौसम व तापमान की असली सैटेलाइट रीडिंग दिखाई दे।'
              : 'Please click "Auto-Detect Real GPS Location" above or search your village so real-time temperature and rain data can be fetched.'}
          </p>
          <div className="pt-2">
            <button
              onClick={handleDetectGPS}
              className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>{isHindi ? 'अभी जीपीएस से पता लगाएं' : 'Detect GPS Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WHEN CROP FIELD LOCATION IS SET: DISPLAY ACCURATE RADAR & HOURLY */}
      {/* ------------------------------------------------------------- */}
      {lat && lon && weatherData && (
        <>
          {/* Weather Alert Tile for the Field */}
          {weatherData.alert && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-900 text-white shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                  <CloudRain className="w-6 h-6 text-blue-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-blue-200">{weatherData.alert.title}</div>
                  <div className="text-xs text-blue-100 leading-relaxed">{weatherData.alert.message}</div>
                </div>
              </div>
            </div>
          )}

          {/* Real Live Field Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            {/* Field Temperature */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span>Field Temperature</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-stone-900">
                {weatherData.current?.temperature}°C
              </div>
              <div className="text-xs text-stone-500">
                {isHindi ? `अनुभव: ${weatherData.current?.feelsLike ?? weatherData.current?.temperature}°C` : `Feels like ${weatherData.current?.feelsLike ?? weatherData.current?.temperature}°C`}
              </div>
            </div>

            {/* Rain Radar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                <span>Rainfall Radar</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-stone-900">
                {weatherData.current?.rainProbability}%
              </div>
              <div className="text-xs text-blue-700 font-bold">
                {weatherData.current?.rainfallForecastMm} mm {isHindi ? 'आज बारिश का अनुमान' : 'expected today'}
              </div>
            </div>

            {/* Field Humidity */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                <span>Air Humidity</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-stone-900">
                {weatherData.current?.humidity}%
              </div>
              <div className="text-xs text-stone-500">{isHindi ? 'हवा में नमी' : 'Canopy moisture'}</div>
            </div>

            {/* Field Wind & Spray Advisory */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <div className="text-xs font-bold text-stone-500 uppercase flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-emerald-600" />
                <span>Wind & Spray Window</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-['Outfit'] text-stone-900">
                {weatherData.current?.windSpeed} km/h
              </div>
              <div className="text-xs font-bold">
                {weatherData.current?.windSpeed && weatherData.current.windSpeed < 18 ? (
                  <span className="text-emerald-700">{isHindi ? '✅ छिड़काव के लिए सुरक्षित' : '✅ Safe for spraying'}</span>
                ) : (
                  <span className="text-rose-700">{isHindi ? '⚠️ तेज हवा: छिड़काव टालें' : '⚠️ High wind: delay spray'}</span>
                )}
              </div>
            </div>

          </div>

          {/* Hourly Timeline */}
          {weatherData.hourly && weatherData.hourly.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-blue-700">Hourly Precision</span>
                  <h3 className="text-sm sm:text-base font-extrabold text-stone-900 font-['Outfit']">
                    Next 24 Hours Rain & Temperature Over Your Crops
                  </h3>
                </div>
                <span className="text-xs text-stone-500 hidden sm:inline">{locationName}</span>
              </div>

              {/* Scrollable Hourly Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {weatherData.hourly.slice(0, 16).map((hr, idx) => (
                  <div
                    key={idx}
                    className={`shrink-0 w-24 p-3 rounded-2xl border text-center space-y-1.5 ${
                      hr.rainProbability >= 40 
                        ? 'bg-blue-50/80 border-blue-300' 
                        : idx === 0 
                        ? 'bg-emerald-50 border-emerald-300' 
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-600">{hr.hourLabel}</div>
                    <div className="text-base font-black font-['Outfit'] text-stone-900">{hr.temperature}°C</div>
                    <div className="text-[11px] font-bold text-blue-700 flex items-center justify-center gap-1">
                      <CloudRain className="w-3 h-3" />
                      <span>{hr.rainProbability}%</span>
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      {hr.precipitationMm > 0 ? `${hr.precipitationMm} mm` : '0 mm'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Real Meteorological Forecast */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 font-['Outfit']">
              7-Day Crop Field Weather Forecast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {weatherData.forecast?.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center space-y-1.5 ${
                    idx === 0 ? 'bg-emerald-50/70 border-emerald-300' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="text-xs font-extrabold text-stone-900">{day.day}</div>
                  <div className="text-[11px] text-stone-500">{day.date}</div>
                  <div className="text-base font-black font-['Outfit'] text-stone-900">
                    {day.tempMax}° / {day.tempMin}°
                  </div>
                  <div className="text-[11px] font-bold text-blue-700 flex items-center justify-center gap-1">
                    <CloudRain className="w-3 h-3" />
                    <span>{day.rainProbability}%</span>
                  </div>
                  <div className="text-[10px] text-stone-600 truncate">{day.condition}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Grounded Water Planning for this Field */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase text-cyan-700">Agronomic Water Demand</span>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 font-['Outfit']">
                  Irrigation Planning & Tubewell Runtime for This Field
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-cyan-50 text-cyan-900 rounded-full border border-cyan-200 self-start sm:self-auto">
                Grounded with Live Field Rain Deduction
              </span>
            </div>

            {/* Farm Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Field Size (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.2"
                  value={landArea}
                  onChange={(e) => setLandArea(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Crop Type</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-stone-50"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Paddy / Rice">Paddy / Rice</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Maize">Maize</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Soybean">Soybean</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Growth Stage</label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50"
                >
                  <option value="Initial / Sowing">Initial / Sowing</option>
                  <option value="Vegetative">Vegetative</option>
                  <option value="Flowering / Grain Filling">Flowering / Grain Filling</option>
                  <option value="Maturity">Maturity</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Irrigation Method</label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-stone-50"
                >
                  <option value="Flood / Furrow">Flood / Furrow (45% eff.)</option>
                  <option value="Sprinkler">Sprinkler (75% eff.)</option>
                  <option value="Drip Irrigation">Drip Irrigation (90% eff.)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Pump Motor HP</label>
                <select
                  value={pumpHp}
                  onChange={(e) => setPumpHp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold"
                >
                  <option value={3}>3 HP (~10,000 L/h)</option>
                  <option value={5}>5 HP (~18,000 L/h)</option>
                  <option value={7.5}>7.5 HP (~25,000 L/h)</option>
                </select>
              </div>
            </div>

            {/* Calculated Output & Step-by-Step Explanation */}
            {waterPlan && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-cyan-50/80 border border-cyan-200 p-4 rounded-2xl">
                    <div className="text-xs font-extrabold uppercase text-cyan-800">
                      {isHindi ? 'Net Water Needed (पानी की कुल आवश्यकता)' : 'Net Field Water Needed'}
                    </div>
                    <div className="text-2xl font-black font-['Outfit'] text-cyan-950 mt-1">
                      {waterPlan.dailyWaterLiters.toLocaleString()} Liters
                    </div>
                    <div className="text-xs text-cyan-800 mt-1">
                      {isHindi ? 'बारिश का अनुमान घटाने के बाद' : 'After deducting live rain forecast'}
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl">
                    <div className="text-xs font-extrabold uppercase text-emerald-800">
                      {isHindi ? 'Recommended Pump Run (ट्यूबवेल चलाने का समय)' : 'Recommended Pump Run'}
                    </div>
                    <div className="text-2xl font-black font-['Outfit'] text-emerald-950 mt-1">
                      {waterPlan.pumpRuntime?.hours}h {waterPlan.pumpRuntime?.minutes}m
                    </div>
                    <div className="text-xs text-emerald-800 mt-1">
                      {isHindi ? `आपके ${pumpHp} HP ट्यूबवेल के अनुसार` : `With your ${pumpHp} HP tubewell`}
                    </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
                    <div className="text-xs font-extrabold uppercase text-stone-700">
                      {isHindi ? 'Drip Water Savings (ड्रिप से पानी की बचत)' : 'Drip Water Savings'}
                    </div>
                    <div className="text-2xl font-black font-['Outfit'] text-stone-900 mt-1">
                      {waterPlan.savingPotentialPercent}%
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      {isHindi ? `बाढ़ सिंचाई की तुलना में ${waterPlan.waterSavedLitersDaily.toLocaleString()} L/दिन की बचत` : `Save ${waterPlan.waterSavedLitersDaily.toLocaleString()} L/day over flood watering`}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm space-y-2">
                  <div className="font-extrabold text-stone-900 flex items-center gap-1.5 font-['Outfit']">
                    <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>How this calculation works for your field:</span>
                  </div>
                  <ul className="text-stone-600 space-y-1 pl-4 list-disc">
                    <li>
                      <strong>Crop Water Demand:</strong> {waterPlan.explanation?.cropDemand}
                    </li>
                    <li>
                      <strong>Rain Contribution:</strong> {waterPlan.explanation?.rainContribution}
                    </li>
                    <li>
                      <strong>System Efficiency:</strong> {waterPlan.explanation?.efficiencyEffect}
                    </li>
                    <li>
                      <strong>Advisory:</strong> <span className="text-stone-900 font-semibold">{waterPlan.recommendation}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};
