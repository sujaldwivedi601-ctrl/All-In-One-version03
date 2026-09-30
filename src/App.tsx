import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AICropAnalysis } from './components/AICropAnalysis';
import { WeatherWater } from './components/WeatherWater';
import { SchemeFinder } from './components/SchemeFinder';
import { Marketplace } from './components/Marketplace';
import { FarmerProfileView } from './components/FarmerProfileView';
import { AuthModal } from './components/AuthModal';
import { LocationModal } from './components/LocationModal';
import { FarmerProfile, CropAnalysisRecord } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LocationProvider, useUserLocation } from './context/LocationContext';
import { Sprout, X, WifiOff } from 'lucide-react';
import {
  saveCachedProfile,
  getCachedProfile,
  saveCachedAnalyses,
  getCachedAnalyses,
  getLastSyncTime,
} from './lib/offlineStorage';

const defaultGuestProfile: FarmerProfile = {
  name: '',
  phone: '',
  state: '',
  district: '',
  village: '',
  latitude: 0,
  longitude: 0,
  landAreaAcres: 1.0,
  soilType: 'Loamy Soil',
  primaryCrop: '',
  cropStage: '',
  secondaryCrops: [],
  waterSource: 'Well / Borewell',
  irrigationType: 'Flood / Furrow',
  farmerCategory: 'Small Farmer',
  hasSoilCard: false,
  hasKisanCreditCard: false,
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const { user, idToken, getIdToken } = useAuth();
  const { language } = useLanguage();
  const { setLocation, latitude: globalLat } = useUserLocation();

  // Profile and analyses state (null when guest/logged-out to preserve privacy)
  const [profile, setProfile] = useState<FarmerProfile | null>(() => {
    return user ? getCachedProfile() : null;
  });
  const [analyses, setAnalyses] = useState<CropAnalysisRecord[]>(() => {
    return user ? getCachedAnalyses() : [];
  });
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSync, setLastSync] = useState<string | null>(() => getLastSyncTime());

  // Listen to browser online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Authenticated fetch helper with automatic 401 token-refresh retry and offline fallback
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = idToken;
    if (!token && user) {
      token = await getIdToken();
    }

    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      let response = await fetch(url, { ...options, headers });

      // If token expired, fetch a fresh token and retry once
      if (response.status === 401 && user) {
        const freshToken = await getIdToken(true);
        if (freshToken) {
          headers.set('Authorization', `Bearer ${freshToken}`);
          response = await fetch(url, { ...options, headers });
        }
      }
      return response;
    } catch (networkError) {
      return new Response(JSON.stringify({ offline: true, error: 'Offline network error' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }, [idToken, user, getIdToken]);

  // When user is authenticated or comes online, sync with database and update cache
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setAnalyses([]);
      return;
    }

    // Load profile
    authenticatedFetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.profile) {
          setProfile(data.profile);
          saveCachedProfile(data.profile);
          setLastSync(new Date().toISOString());

          // If user has saved coordinates in their profile and no active GPS override is set yet, sync to LocationContext
          if (data.profile.latitude && data.profile.longitude && Number(data.profile.latitude) !== 0 && !globalLat) {
            const locName = `${data.profile.village || ''}${data.profile.district ? `, ${data.profile.district}` : ''}`;
            setLocation(Number(data.profile.latitude), Number(data.profile.longitude), locName.trim() || 'My Farm', 'profile');
          }
        }
      })
      .catch((e) => {
        console.warn('Profile fetch offline fallback:', e);
        const cached = getCachedProfile();
        if (cached) setProfile(cached);
      });

    // Load analyses
    authenticatedFetch('/api/crop-analyses')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.analyses) {
          setAnalyses(data.analyses);
          saveCachedAnalyses(data.analyses);
          setLastSync(new Date().toISOString());
        }
      })
      .catch((e) => {
        console.warn('Crop analyses offline fallback:', e);
        const cached = getCachedAnalyses();
        if (cached && cached.length > 0) setAnalyses(cached);
      });
  }, [idToken, user, isOnline, authenticatedFetch]);

  const handleUpdateProfile = async (updated: FarmerProfile) => {
    setProfile(updated);
    saveCachedProfile(updated);
    setLastSync(new Date().toISOString());

    if (!user) return;

    try {
      await authenticatedFetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Saved profile locally, will sync when online:', e);
    }
  };

  const handleAnalysisComplete = (record: CropAnalysisRecord) => {
    setAnalyses((prev) => {
      const next = [record, ...prev];
      saveCachedAnalyses(next);
      return next;
    });
  };

  const requireLoginPrompt = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF6] text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] w-full max-w-full overflow-x-hidden">
      
      {/* Offline Status Bar Banner */}
      {!isOnline && (
        <div className="bg-amber-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 flex items-center justify-between shadow-xs sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              {language === 'hi' 
                ? 'ऑफलाइन मोड सक्रिय • पिछले सहेजे गए रिकॉर्ड देख रहे हैं'
                : 'Offline Field Mode Active • Viewing last synced farm records'} 
              {lastSync ? ` (${new Date(lastSync).toLocaleDateString()})` : ''}
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-amber-200">
            {language === 'hi' ? 'परिवर्तन डिवाइस पर स्थानीय रूप से सुरक्षित हैं' : 'Changes saved locally to device'}
          </span>
        </div>
      )}

      {/* Top Bar with Three-Lines "More" dropdown and Real Location Selector */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenProfile={() => setShowProfileModal(true)}
        onRequireLogin={requireLoginPrompt}
        onOpenLocationModal={() => setShowLocationModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-full md:max-w-4xl lg:max-w-6xl w-full mx-auto px-3 sm:px-6 md:px-8 py-5">
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            analyses={analyses}
            isLoggedIn={!!user}
            onRequireLogin={() => requireLoginPrompt('login')}
            setActiveTab={setActiveTab}
            onOpenProfile={() => setShowProfileModal(true)}
            isOffline={!isOnline}
            lastSyncTime={lastSync}
          />
        )}

        {activeTab === 'crop-ai' && (
          <AICropAnalysis
            profile={profile || defaultGuestProfile}
            analyses={analyses}
            isLoggedIn={!!user}
            onRequireLogin={() => requireLoginPrompt('login')}
            idToken={idToken}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'weather-water' && (
          <WeatherWater
            profile={profile || defaultGuestProfile}
            onUpdateProfile={handleUpdateProfile}
            isLoggedIn={!!user}
            onRequireLogin={() => requireLoginPrompt('login')}
            onOpenLocationModal={() => setShowLocationModal(true)}
          />
        )}

        {activeTab === 'schemes' && (
          <SchemeFinder
            profile={profile}
            onOpenProfile={() => setShowProfileModal(true)}
            isLoggedIn={!!user}
            onRequireLogin={() => requireLoginPrompt('login')}
          />
        )}

        {activeTab === 'marketplace' && (
          <Marketplace
            profile={profile}
            isLoggedIn={!!user}
            onRequireLogin={() => requireLoginPrompt('login')}
            idToken={idToken}
          />
        )}

        {activeTab === 'profile' && (
          <FarmerProfileView
            profile={profile || defaultGuestProfile}
            onUpdateProfile={handleUpdateProfile}
            onNavigateTab={setActiveTab}
            isLoggedIn={!!user}
            onRequireLogin={() => requireLoginPrompt('login')}
            isOffline={!isOnline}
            lastSyncTime={lastSync}
          />
        )}
      </main>

      {/* Complete Farmer Authentication & Registration Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />

      {/* Real Location Selector Modal (GPS auto-detect + Open-Meteo geocode search) */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />

      {/* Farmer Profile Modal (Only for Authenticated Users) */}
      {showProfileModal && profile && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#F8FAF6] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 relative my-4">
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-sm sm:text-base font-['Outfit']">
                  {language === 'hi' ? 'किसान प्रोफाइल एवं सेटिंग्स' : 'Farmer Profile & Settings'}
                </h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <FarmerProfileView
                profile={profile}
                onUpdateProfile={(up) => {
                  handleUpdateProfile(up);
                  setShowProfileModal(false);
                }}
                onClose={() => setShowProfileModal(false)}
                onNavigateTab={(t) => {
                  setActiveTab(t);
                  setShowProfileModal(false);
                }}
                isLoggedIn={!!user}
                onRequireLogin={() => requireLoginPrompt('login')}
                isOffline={!isOnline}
                lastSyncTime={lastSync}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LocationProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </LocationProvider>
  );
}
