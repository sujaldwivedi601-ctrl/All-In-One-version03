import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Layers, 
  Sprout, 
  Droplet, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Save, 
  RotateCcw,
  Lock,
  WifiOff,
  Clock
} from 'lucide-react';
import { FarmerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FarmerProfileViewProps {
  profile: FarmerProfile;
  onUpdateProfile: (updated: FarmerProfile) => void;
  onClose?: () => void;
  onNavigateTab?: (tab: string) => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  isOffline?: boolean;
  lastSyncTime?: string | null;
}

export const FarmerProfileView: React.FC<FarmerProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  onNavigateTab,
  isLoggedIn = false,
  onRequireLogin,
  isOffline = false,
  lastSyncTime,
}) => {
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const [formData, setFormData] = useState<FarmerProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof FarmerProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn && !isOffline) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-full overflow-hidden">
      
      {/* Top Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-green-900 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-xl">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farm Configuration Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
            The Farmer Profile is the Core
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            {isHindi
              ? 'अपनी जमीन, मिट्टी और फसल की जानकारी एक बार दर्ज करें। AI डॉक्टर, मौसम का पूर्वानुमान और सरकारी योजनाएं आपकी इसी प्रोफाइल के आधार पर सटीक जानकारी प्रदान करेंगी।'
              : 'Enter your land, soil, and crop details once. Crop AI, Weather forecasts, and Subsidies use these parameters to tailor recommendations.'}
          </p>
        </div>
      </div>

      {/* Offline Status Notice */}
      {isOffline && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="truncate">
              Offline mode • Profile edits are preserved in device storage and will automatically sync with Cloud SQL when connection resumes.
            </span>
          </div>
          {lastSyncTime && (
            <span className="text-[11px] text-amber-800 font-bold shrink-0">
              Synced {new Date(lastSyncTime).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Guest Mode Notice */}
      {!isLoggedIn && !isOffline && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">
              Viewing demo parameters • Sign in to save your personal farm coordinates and crops.
            </span>
          </div>
          {onRequireLogin && (
            <button
              onClick={onRequireLogin}
              className="px-3 py-1 rounded-xl bg-amber-800 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-6">
        
        {/* Section 1: Farmer & Location */}
        <div>
          <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 font-['Outfit']">
            <User className="w-4 h-4 text-emerald-700" />
            <span>Farmer Information & Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Village / District</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => handleChange('village', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Land & Soil */}
        <div>
          <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 font-['Outfit']">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Land Size & Soil Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Total Land (Acres)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.landAreaAcres}
                onChange={(e) => handleChange('landAreaAcres', parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Soil Texture</label>
              <select
                value={formData.soilType}
                onChange={(e) => handleChange('soilType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="Loamy Soil">Loamy Soil (Fertile & balanced)</option>
                <option value="Black Cotton Soil">Black Cotton Soil (Heavy clay)</option>
                <option value="Sandy Loam">Sandy Loam (Quick drainage)</option>
                <option value="Alluvial Soil">Alluvial Soil (River basin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Farmer Category</label>
              <select
                value={formData.farmerCategory}
                onChange={(e) => handleChange('farmerCategory', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="Marginal (< 2.5 Acres)">Marginal (&lt; 2.5 Acres)</option>
                <option value="Small Farmer (2.5-5 Acres)">Small Farmer (2.5 - 5 Acres)</option>
                <option value="Medium (5-10 Acres)">Medium (5 - 10 Acres)</option>
                <option value="Large (> 10 Acres)">Large (&gt; 10 Acres)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Crops & Stage */}
        <div>
          <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 font-['Outfit']">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>Active Crops & Crop Stage</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Crop</label>
              <input
                type="text"
                value={formData.primaryCrop}
                onChange={(e) => handleChange('primaryCrop', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Current Growth Stage</label>
              <input
                type="text"
                value={formData.cropStage}
                onChange={(e) => handleChange('cropStage', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Water & Irrigation */}
        <div>
          <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 font-['Outfit']">
            <Droplet className="w-4 h-4 text-cyan-700" />
            <span>Water Source & Irrigation Method</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Water Source</label>
              <select
                value={formData.waterSource}
                onChange={(e) => handleChange('waterSource', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="Well / Borewell">Well / Borewell (Groundwater)</option>
                <option value="Canal Irrigation">Canal Irrigation (Surface)</option>
                <option value="Farm Pond / Rainwater">Farm Pond / Rainwater Harvesting</option>
                <option value="River / Stream Lift">River / Stream Lift</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Irrigation Method</label>
              <select
                value={formData.irrigationType}
                onChange={(e) => handleChange('irrigationType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="Flood / Furrow">Flood / Furrow (Standard)</option>
                <option value="Sprinkler System">Sprinkler System</option>
                <option value="Drip Micro-irrigation">Drip Micro-irrigation (Water Saving)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Cards & Badges */}
        <div>
          <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-3 pb-2 border-b border-stone-100 font-['Outfit']">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Government Verification Cards</span>
          </h3>

          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <input
                type="checkbox"
                checked={formData.hasSoilCard}
                onChange={(e) => handleChange('hasSoilCard', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm"
              />
              <span className="font-semibold text-stone-800">Has Soil Health Card</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <input
                type="checkbox"
                checked={formData.hasKisanCreditCard}
                onChange={(e) => handleChange('hasKisanCreditCard', e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm"
              />
              <span className="font-semibold text-stone-800">Has Kisan Credit Card (KCC)</span>
            </label>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Farm profile saved successfully! {isOffline ? '(Stored on device; will sync when back online)' : 'Synchronized with Cloud SQL.'}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
};
