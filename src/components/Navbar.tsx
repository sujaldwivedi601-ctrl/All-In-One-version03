import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, 
  MapPin, 
  LogOut, 
  LogIn, 
  Layers, 
  Camera, 
  CloudSun, 
  Building2, 
  ShoppingBag,
  Menu,
  X,
  Languages,
  UserPlus,
  User,
  Settings,
  MoreVertical,
  Navigation,
  Globe
} from 'lucide-react';
import { FarmerProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserLocation } from '../context/LocationContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: FarmerProfile | null;
  onOpenProfile: () => void;
  onRequireLogin: (initialMode?: 'login' | 'register') => void;
  onOpenLocationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenProfile,
  onRequireLogin,
  onOpenLocationModal,
}) => {
  const { user, signOut, loading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { locationName } = useUserLocation();
  
  // Responsive dropdown menu state (replaces messy scattered buttons on both mobile & desktop)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Clean Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Home', shortLabel: 'Home', icon: Layers },
    { id: 'crop-ai', label: 'Scan Crop', shortLabel: 'Scan', icon: Camera, highlight: true },
    { id: 'weather-water', label: 'Weather & Water', shortLabel: 'Weather', icon: CloudSun },
    { id: 'schemes', label: 'Schemes', shortLabel: 'Schemes', icon: Building2 },
    { id: 'marketplace', label: 'Marketplace', shortLabel: 'Market', icon: ShoppingBag },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMenuOpen(false);
  };

  // Location display: strictly uses real user GPS / chosen location or farm village
  const displayLocation = locationName 
    ? locationName 
    : user && profile?.village 
    ? `${profile.village}${profile.district ? `, ${profile.district}` : ''}`
    : 'Set Location';

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            
            {/* Left: Logo & Brand */}
            <div 
              className="flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() => handleTabClick('dashboard')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base md:text-lg font-black text-stone-900 tracking-tight font-['Outfit']">
                    E-FARMER
                  </span>
                  <span className="hidden sm:inline-block text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                    Smart Agri
                  </span>
                </div>
                
                {/* Real User Location Button with interactive modal trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLocationModal();
                  }}
                  className="text-[10px] sm:text-xs text-stone-600 hover:text-emerald-700 flex items-center gap-1 truncate max-w-[130px] sm:max-w-[190px] md:max-w-[240px] cursor-pointer group text-left"
                  title="Click to detect real GPS or search your village"
                >
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate underline underline-offset-2 decoration-stone-300 group-hover:decoration-emerald-500">
                    {displayLocation}
                  </span>
                </button>
              </div>
            </div>

            {/* Center: Main Navigation Tabs (Desktop & Tablet) */}
            <nav className="hidden lg:flex items-center gap-1 bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 shadow-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Clean, Unified "More / Menu" Dropdown Button */}
            <div className="relative shrink-0 flex items-center gap-2" ref={menuRef}>
              
              {/* Quick Sign In button if guest and on desktop */}
              {!user && (
                <button
                  onClick={() => onRequireLogin('login')}
                  disabled={loading}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )}

              {/* The "Three Lines" Hamburger / More Options Button */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 rounded-2xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  menuOpen 
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20' 
                    : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-700'
                }`}
                aria-label="More Options"
                title="Options, Language, and Farmer Settings"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                
                {user ? (
                  <div className="flex items-center gap-1.5 pr-0.5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                        {user.displayName ? user.displayName.charAt(0) : 'F'}
                      </div>
                    )}
                    <span className="hidden md:inline text-xs font-bold max-w-[80px] truncate">
                      {profile?.name || user.displayName?.split(' ')[0] || 'Account'}
                    </span>
                  </div>
                ) : (
                  <span className="hidden md:inline text-xs font-bold text-stone-700">
                    Menu
                  </span>
                )}
              </button>

              {/* ------------------------------------------------------------- */}
              {/* UNIFIED DROPDOWN MENU (Language, My Farm, Logout, Navigation) */}
              {/* ------------------------------------------------------------- */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-stone-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* User Profile Card / Header in Dropdown */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 mb-2">
                    {user ? (
                      <div className="flex items-center gap-2.5">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {user.displayName ? user.displayName.charAt(0) : 'F'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold text-stone-900 truncate">
                            {profile?.name || user.displayName || 'Farmer User'}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-stone-600">
                        <span className="font-bold text-stone-900 block mb-1">Welcome, Farmer Friend</span>
                        <span>Sign in to store your crop health history and get personalized schemes.</span>
                        <div className="grid grid-cols-2 gap-2 mt-2.5">
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              onRequireLogin('login');
                            }}
                            className="py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Login</span>
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpen(false);
                              onRequireLogin('register');
                            }}
                            className="py-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Register</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 1: Language Switcher inside Dropdown */}
                  <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100 mb-2">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Language / भाषा</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {language === 'hi' ? 'हिंदी सक्रिय' : 'English Active'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-1 bg-white rounded-xl border border-stone-200">
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          language === 'en'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('hi')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          language === 'hi'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        हिंदी (Hindi)
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Real Location Changer */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenLocationModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-stone-100 text-xs font-bold text-stone-800 transition-colors cursor-pointer mb-1"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-blue-600" />
                      <span>Change Farm Location</span>
                    </div>
                    <span className="text-[11px] text-stone-500 truncate max-w-[120px]">
                      {displayLocation}
                    </span>
                  </button>

                  {/* Section 3: My Farm Profile (If Logged In) */}
                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50 text-xs font-bold text-stone-800 transition-colors cursor-pointer mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-700" />
                        <span>My Farm Profile & Land</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {profile?.landAreaAcres ? `${profile.landAreaAcres} Acres` : 'Edit'}
                      </span>
                    </button>
                  )}

                  {/* Mobile Navigation Links (Shown in dropdown on smaller screens where top nav is hidden) */}
                  <div className="lg:hidden border-t border-stone-100 pt-1.5 my-1.5 space-y-0.5">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          {item.highlight && !isActive && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                              AI
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Section 4: Log Out Button (If Logged In) */}
                  {user && (
                    <div className="border-t border-stone-100 pt-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          setMenuOpen(false);
                          await signOut();
                        }}
                        className="w-full flex items-center gap-2 p-2.5 rounded-2xl hover:bg-red-50 text-xs font-bold text-red-700 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Keeps 5 primary icons accessible at the thumb area) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1 shadow-lg safe-bottom">
        <div className="grid grid-cols-5 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-emerald-800 font-extrabold'
                    : 'text-stone-500 hover:text-stone-800 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  item.highlight && !isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : isActive
                    ? 'bg-emerald-700 text-white scale-105'
                    : ''
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] mt-0.5 leading-none font-semibold truncate max-w-full">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
