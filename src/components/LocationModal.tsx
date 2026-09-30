import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  X, 
  Loader2, 
  Check, 
  AlertCircle,
  Building
} from 'lucide-react';
import { useUserLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { 
    locationName, 
    detectLocation, 
    setLocation, 
    isLocating, 
    gpsError 
  } = useUserLocation();
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(text.trim())}`);
      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
      }
    } catch (e) {
      console.warn('Location search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setLocation(place.latitude, place.longitude, place.displayLabel, 'search');
    onClose();
  };

  const handleGpsClick = async () => {
    const success = await detectLocation();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm font-['Outfit']">
                {isHindi ? 'अपना वास्तविक स्थान चुनें' : 'Set Your Exact Location'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isHindi ? 'सटीक तापमान व वर्षा पूर्वानुमान हेतु' : 'For accurate real-time temperature & rainfall'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Current Location Badge */}
          {locationName ? (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="truncate">
                  {isHindi ? 'वर्तमान स्थान:' : 'Current:'} <strong>{locationName}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{isHindi ? 'स्थान सेट नहीं है। कृपया जीपीएस से पता लगाएं या खोजें।' : 'No location configured. Please detect GPS or search.'}</span>
            </div>
          )}

          {/* 1-Tap Real GPS Auto-Detect */}
          <button
            type="button"
            onClick={handleGpsClick}
            disabled={isLocating}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-emerald-900/10 transition-all"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{isHindi ? 'सटीक जीपीएस सिग्नल ले रहे हैं...' : 'Detecting exact device GPS location...'}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 shrink-0" />
                <span>{isHindi ? 'मेरे डिवाइस का वास्तविक स्थान प्राप्त करें (GPS)' : 'Use My Real GPS Location'}</span>
              </>
            )}
          </button>

          {gpsError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{gpsError}</span>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-stone-200"></div>
            <span className="shrink-0 mx-3 text-stone-400 text-xs font-bold">
              {isHindi ? 'या गांव/शहर खोजें' : 'OR SEARCH VILLAGE / CITY'}
            </span>
            <div className="grow border-t border-stone-200"></div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isHindi ? 'उदा. आनंद, वडोदरा, लुधियाना, नासिक...' : 'Search village, taluka, or district...'}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm bg-white"
            />
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-2 text-xs text-stone-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{isHindi ? 'स्थान खोज रहे हैं...' : 'Searching places...'}</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-2xl border border-stone-200 divide-y divide-stone-100 bg-stone-50">
              {results.map((place, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-stone-900 block truncate">{place.name}</span>
                    <span className="text-[11px] text-stone-500 truncate block">
                      {[place.admin2, place.admin1, place.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
