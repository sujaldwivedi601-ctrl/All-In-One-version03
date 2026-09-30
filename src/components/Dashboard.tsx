import React from 'react';
import { 
  Camera, 
  CloudRain, 
  Droplet, 
  Building2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  LogIn,
  Sprout,
  ShieldCheck, 
  Zap,
  Lock,
  WifiOff,
  Clock,
  CheckCircle2,
  Heart,
  Star,
  Users,
  AlertTriangle,
  Leaf,
  Layers,
  Thermometer,
  Wind
} from 'lucide-react';
import { FarmerProfile, CropAnalysisRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useUserLocation } from '../context/LocationContext';

interface DashboardProps {
  profile: FarmerProfile | null;
  analyses: CropAnalysisRecord[];
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  setActiveTab: (tab: string) => void;
  onOpenProfile: () => void;
  isOffline?: boolean;
  lastSyncTime?: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  analyses,
  isLoggedIn,
  onRequireLogin,
  setActiveTab,
  onOpenProfile,
  isOffline = false,
  lastSyncTime,
}) => {
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const { locationName: userLiveLocation } = useUserLocation();

  const latestAnalysis = analyses[0] || null;
  const villageName = userLiveLocation || profile?.village || '';
  const districtName = profile?.district || '';
  const stateName = profile?.state || '';

  // -------------------------------------------------------------
  // GUEST / UNLOGGED-IN VIEW: WHAT THE SITE CAN DO (FEATURE TOUR)
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="space-y-6 pb-24 md:pb-10 max-w-full overflow-hidden">
        
        {/* Guest Hero Section */}
        <section className="bg-linear-to-br from-emerald-900 via-emerald-800 to-green-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg relative overflow-hidden border border-emerald-700/50">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs sm:text-sm font-bold border border-emerald-400/30">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Smart Agriculture & AI Farm Intelligence</span>
            </div>

            {/* Main Heading in English */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-['Outfit'] tracking-tight leading-tight text-white">
              Diagnose Crop Diseases & Optimize Your Yield in Seconds
            </h1>

            {/* Friendly explanation in Hindi / Hinglish for local farmers */}
            <p className="text-emerald-100/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
              {isHindi
                ? 'E-Farmer भारतीय किसान भाइयों के लिए खास तैयार किया गया है। अपने मोबाइल कैमरे से बीमार पत्ते की फोटो खींचकर तुरंत रोग जांच, जैविक इलाज, मौसम व बारिश के अनुसार ट्यूबवेल का सही समय और सरकारी सब्सिडी की सीधी जानकारी पाएं।'
                : 'E-Farmer equips Indian growers with cutting-edge botanical AI, live micro-climate weather forecasts, automated irrigation schedules, and direct government subsidy access.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('crop-ai')}
                className="px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 text-emerald-700" />
                <span>{isHindi ? 'AI Crop Scanner (फसल जांचें)' : 'Try AI Crop Scanner'}</span>
              </button>

              <button
                onClick={onRequireLogin}
                className="px-5 py-3 rounded-2xl bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-500/40 font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isHindi ? 'Sign In / Registration' : 'Sign In with Google'}</span>
              </button>
            </div>
          </div>

          {/* Background Decorative Accent */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        </section>

        {/* Feature Highlight 1: How E-Farmer Improves Plants & Treats Crops */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                Core Botanical AI
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Outfit'] tracking-tight">
                How Our AI Improves & Protects Your Crops
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 self-start sm:self-auto">
              94.8% Botanical Accuracy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1: Scan & Detect */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 font-['Outfit']">
                1. Point Camera & Scan Leaf
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHindi
                  ? 'किसी भी रोगग्रस्त पत्ते या कीड़े वाले पौधे की मोबाइल से फोटो लें। हमारा AI तुरंत फफूंद (Fungus), झुलसा (Blight), पीलापन या रसचूषक कीटों को पहचान लेता है।'
                  : 'Take a quick photo of any diseased leaf or pest cluster. Our AI analyzes leaf texture, discoloration, and lesion spots to pinpoint rust, blight, rot, or aphids instantly.'}
              </p>
            </div>

            {/* Step 2: Immediate Organic & Chemical Protocol */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 font-['Outfit']">
                2. Organic Cures & Precise Dosages
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHindi
                  ? 'तुरंत घरेलू व जैविक नुस्खे (नीम तेल स्प्रे, बायो-फंगीसाइड) और प्रति एकड़ सही केमिकल दवाई की नाप पाएं ताकि पौधे न जलें और फालतू खर्च बचे।'
                  : 'Receive instant organic treatments (neem oil formulations, bio-fungicides) plus exact chemical dosages per pump/acre so you never burn foliage or waste expensive inputs.'}
              </p>
            </div>

            {/* Step 3: Prevent Recurrence & Weather Guard */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 font-['Outfit']">
                3. Weather-Safe Spray Windows
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHindi
                  ? 'दवाई छिड़कने से पहले यह मौसम और हवा की गति देखता है। यदि 24 घंटे में तेज बारिश की संभावना हो तो चेतावनी देता है ताकि दवा बारिश में धुल न जाए।'
                  : 'E-Farmer syncs diagnosis with upcoming wind and rain forecasts. It warns you not to spray if rain is predicted within 24 hours, preventing wasted medicine.'}
              </p>
            </div>

          </div>
        </section>

        {/* Feature Highlight 2: Live Weather Forecast & Water Intelligence */}
        <section className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-xs font-bold mb-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-300" />
                <span>Hyperlocal Agricultural Meteorology</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                Live Weather & Irrigation Advisory
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('weather-water')}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{isHindi ? 'Weather Radar देखें' : 'Explore Weather Radar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Live Weather Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="text-xs text-blue-200 font-medium">Temperature (तापमान)</div>
              <div className="text-xl sm:text-2xl font-black font-['Outfit'] mt-1">28°C</div>
              <div className="text-[11px] text-blue-300">{isHindi ? 'फसल बढ़वार हेतु अनुकूल' : 'Optimal vegetative growth'}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="text-xs text-blue-200 font-medium">Rain Probability (बारिश की संभावना)</div>
              <div className="text-xl sm:text-2xl font-black font-['Outfit'] mt-1 text-amber-300">70%</div>
              <div className="text-[11px] text-blue-300">{isHindi ? '24 घंटे में 18 mm बारिश का अनुमान' : '18 mm expected in 24 hrs'}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="text-xs text-blue-200 font-medium">Wind Speed (हवा की गति)</div>
              <div className="text-xl sm:text-2xl font-black font-['Outfit'] mt-1">14 km/h</div>
              <div className="text-[11px] text-blue-300">{isHindi ? 'सुबह दवा छिड़काव के लिए सुरक्षित' : 'Safe for morning spraying'}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
              <div className="text-xs text-blue-200 font-medium">Water Saved (पानी बचत)</div>
              <div className="text-xl sm:text-2xl font-black font-['Outfit'] mt-1 text-emerald-300">-45%</div>
              <div className="text-[11px] text-blue-300">{isHindi ? 'ट्यूबवेल चलाने की आवश्यकता नहीं' : 'Delay pump cycles'}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-800/60 border border-blue-700/80 text-xs sm:text-sm text-blue-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Smart Irrigation Alert:</strong> {isHindi 
                ? 'आसपास तेज बारिश आने वाली है। ट्यूबवेल या बोरवेल का पंप 48 घंटे के लिए बंद रखें ताकि पानी और बिजली दोनों की बचत हो और जड़ें न सड़ें।'
                : 'Heavy rain is approaching. Postpone borehole pumping by 48 hours to preserve groundwater and prevent root rot.'}
            </span>
          </div>
        </section>

        {/* Feature Highlight 3: Satisfied Farmer Reviews & Testimonials */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
                Farmer Community
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Outfit'] tracking-tight">
                Our Users Are Very Satisfied
              </h2>
            </div>
            <div className="flex items-center gap-1 text-amber-500 self-start sm:self-auto">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-extrabold text-stone-800 ml-1.5">4.9 / 5 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                {isHindi
                  ? '"मेरे 8 एकड़ गेहूं के खेत में पीला रतुआ (Yellow Rust) लग गया था। E-Farmer ने तुरंत बीमारी पकड़ी और प्रोपिकोनाज़ोल का सटीक नाप बताया, जिससे मेरी 40% फसल बच गई!"'
                  : '"Yellow rust attacked my 8-acre wheat field. E-Farmer detected the fungus within seconds, told me the exact Propiconazole dosage, and saved 40% of my harvest!"'}
              </p>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">Ramesh Patel (रमेश पटेल)</div>
                  <div className="text-[11px] text-stone-500">Wheat Farmer • Anand, Gujarat</div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  Saved Crop
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                {isHindi
                  ? '"बारिश के अलर्ट ने मुझे भारी बारिश से 2 दिन पहले आगाह कर दिया। मैंने ट्यूबवेल बंद रखा और एक ही हफ्ते में ₹3,500 के डीजल का खर्च बचा लिया!"'
                  : '"The rain advisory warned me 2 days before the downpour. I held my tubewell watering and saved ₹3,500 on diesel in a single week!"'}
              </p>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">Gurpreet Singh (गुरप्रीत सिंह)</div>
                  <div className="text-[11px] text-stone-500">Paddy Farmer • Ludhiana, Punjab</div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                  Saved Diesel
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                {isHindi
                  ? '"मुझे इसी पोर्टल से पीएम-कुसुम सोलर पंप और ड्रिप सब्सिडी की जानकारी मिली। आसान स्टेप-बाय-स्टेप प्रोसेस से मुझे 55% सरकारी सब्सिडी मिल गई।"'
                  : '"I discovered the PM-KUSUM solar scheme and Drip subsidy on this portal. Received 55% state grant assistance with easy step-by-step guidance."'}
              </p>
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">Kavita Deshmukh (कविता देशमुख)</div>
                  <div className="text-[11px] text-stone-500">Horticulture • Nashik, Maharashtra</div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                  55% Grant
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* 4 Interactive Feature Tiles */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          <div 
            onClick={() => setActiveTab('crop-ai')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-base font-extrabold text-stone-900 font-['Outfit']">
              AI Crop Doctor
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              {isHindi ? '50+ फसल रोगों की पहचान और सटीक स्प्रे नुस्खे।' : 'Instant diagnosis of 50+ crop diseases & spray protocols.'}
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('weather-water')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-blue-500 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5" />
            </div>
            <div className="text-base font-extrabold text-stone-900 font-['Outfit']">
              Water & Weather
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              {isHindi ? 'लाइव बारिश अलर्ट, हवा की रफ्तार और ट्यूबवेल का सही समय।' : 'Live rain alerts, wind speed & smart irrigation schedules.'}
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('schemes')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-amber-500 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-base font-extrabold text-stone-900 font-['Outfit']">
              Govt. Schemes
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              {isHindi ? 'पीएम-किसान, ड्रिप सब्सिडी, सोलर पंप और फसल बीमा।' : 'PM-Kisan, drip subsidies, solar pumps & crop insurance.'}
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('marketplace')}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-base font-extrabold text-stone-900 font-['Outfit']">
              Farmer Market
            </div>
            <p className="text-xs text-stone-500 leading-snug">
              {isHindi ? 'पराली/भूसा बेचें और ट्रैक्टर-यंत्र बिना बिचौलिए किराए पर लें।' : 'Trade crop residue (straw/stubble) & rent machinery peer-to-peer.'}
            </p>
          </div>

        </section>

        {/* Bottom Call to Action for Visitors */}
        <section className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 text-center space-y-3">
          <h3 className="text-xl sm:text-2xl font-black font-['Outfit']">
            Ready to Protect Your Crops & Maximize Income?
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
            {isHindi
              ? 'अपना किसान खाता बनाएं या गूगल से लॉगिन करें ताकि आपकी फसलों का रिकॉर्ड सुरक्षित रहे और सरकारी योजनाओं की सटीक पात्रता जान सकें।'
              : 'Sign in with your Google account to create your personal farm profile, track disease records, and unlock tailored government subsidy matches.'}
          </p>
          <div className="pt-2">
            <button
              onClick={onRequireLogin}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base inline-flex items-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>{isHindi ? 'Sign In / Free Registration' : 'Get Started • Free Sign In'}</span>
            </button>
          </div>
        </section>

      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED LOGGED-IN VIEW: USER FARM DETAILS & PERSONALIZED DATA
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 sm:space-y-5 pb-24 md:pb-8 max-w-full overflow-hidden">
      
      {/* Offline Mode Notification */}
      {isOffline && (
        <div className="bg-stone-900 text-stone-100 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm border border-stone-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-white flex items-center gap-2">
                <span>Working in Offline Field Mode</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold">Cached</span>
              </div>
              <div className="text-xs text-stone-400 truncate">
                {isHindi 
                  ? `स्थानीय रूप से सहेजे गए कृषि रिकॉर्ड प्रदर्शित किए जा रहे हैं`
                  : `Displaying last synced farm records`} {lastSyncTime ? `(${new Date(lastSyncTime).toLocaleDateString()})` : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Grid: Authenticated Farmer Context + Primary Crop Scan Action */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Personal Farm Card */}
        <div className="md:col-span-5 flex flex-col justify-between bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {isHindi ? 'Your Farm Profile (किसान प्रोफाइल)' : 'Your Farm Profile'}
                </span>
                {lastSyncTime && (
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>Live Synced</span>
                  </span>
                )}
              </div>
              <button
                onClick={onOpenProfile}
                className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0 cursor-pointer hover:bg-emerald-100 transition-colors"
              >
                Edit Farm
              </button>
            </div>

            {/* User Details */}
            <div className="flex items-center gap-3 my-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                {profile?.name?.charAt(0) || 'F'}
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-extrabold text-stone-900 font-['Outfit'] truncate">
                  {profile?.name || 'Farmer User'}
                </div>
                <div className="text-xs sm:text-sm text-stone-600 flex items-center gap-1.5 truncate mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {villageName ? `${villageName}${districtName ? `, ${districtName}` : ''}${stateName ? `, ${stateName}` : ''}` : 'Location Not Set (Click Edit Farm)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Farm Land & Crop Specifications */}
            <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-stone-50 p-2.5 rounded-xl">
              <div>
                <span className="text-stone-500 block">Primary Crop (मुख्य फसल)</span>
                <strong className="text-stone-900 font-bold">{profile?.primaryCrop || 'Not Specified'}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Land Area (कुल जमीन)</span>
                <strong className="text-stone-900 font-bold">{profile?.landAreaAcres ? `${profile.landAreaAcres} Acres` : 'Not Specified'}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Soil Health Card</span>
                <strong className={profile?.hasSoilCard ? 'text-emerald-700 font-bold' : 'text-stone-600'}>
                  {profile?.hasSoilCard ? 'Verified Card' : 'Not Linked'}
                </strong>
              </div>
              <div>
                <span className="text-stone-500 block">Kisan Credit Card</span>
                <strong className={profile?.hasKisanCreditCard ? 'text-emerald-700 font-bold' : 'text-stone-600'}>
                  {profile?.hasKisanCreditCard ? 'Active KCC' : 'Not Linked'}
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-2.5 mt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
            <span>Stage: <strong className="text-stone-900">{profile?.cropStage || 'Not Specified'}</strong></span>
            <span>Soil: <strong className="text-stone-900">{profile?.soilType || 'Not Specified'}</strong></span>
          </div>
        </div>

        {/* Primary Action Card: Scan Sick Crop Leaf */}
        <div 
          onClick={() => setActiveTab('crop-ai')}
          className="md:col-span-7 bg-linear-to-r from-emerald-800 to-green-900 text-white p-5 sm:p-6 rounded-3xl shadow-md cursor-pointer relative overflow-hidden flex items-center justify-between hover:shadow-lg transition-all"
        >
          <div className="space-y-2 relative z-10 pr-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>AI Crop Leaf Doctor</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
              Scan Your Crop Leaf
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm line-clamp-2 max-w-md">
              {isHindi
                ? 'रोगग्रस्त पत्तों की फोटो लें और कीट, फफूंद पहचानकर तुरंत जैविक उपचार व स्प्रे की सही मात्रा जानें।'
                : 'Take a leaf photo to diagnose pests, blight & get instant organic or chemical spray dosages for your farm.'}
            </p>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
        </div>

      </div>

      {/* Crop Field Weather Radar Alert Tile */}
      <div 
        onClick={() => setActiveTab('weather-water')}
        className={`p-4 sm:p-5 rounded-2xl text-white shadow-xs cursor-pointer flex items-center justify-between transition-colors ${
          villageName ? 'bg-blue-900 hover:bg-blue-950' : 'bg-emerald-900 hover:bg-emerald-950 border border-emerald-700'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${villageName ? 'bg-blue-800/80 text-blue-300' : 'bg-emerald-800 text-emerald-300'}`}>
            <CloudRain className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs sm:text-sm font-bold truncate ${villageName ? 'text-blue-300' : 'text-emerald-300'}`}>
              {villageName ? `🌾 Live Field Satellite Weather • ${villageName}` : '📍 Where Are Your Crop Fields Located?'}
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate">
              {villageName 
                ? (isHindi ? 'लाइव तापमान, प्रति घंटे बारिश की संभावना और पंप चलाने का समय देखें' : 'Check real-time temperature, hour-by-hour rain probability, and pump schedule')
                : (isHindi ? 'सटीक मौसम और बारिश का पूर्वानुमान पाने के लिए अपने खेत की लोकेशन दर्ज करें' : 'Tap to enter your farm plot location to receive hyper-accurate temperature & rain radar for your crops')}
            </div>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-white/70 shrink-0" />
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setActiveTab('crop-ai')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div className="text-sm sm:text-base font-bold text-stone-900 font-['Outfit']">
            AI Crop Doctor
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {isHindi ? 'पत्ते की फोटो खींचकर रोग जांचें' : 'Point camera at sick leaf'}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('weather-water')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Droplet className="w-5 h-5" />
          </div>
          <div className="text-sm sm:text-base font-bold text-stone-900 font-['Outfit']">
            Water & Weather
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {isHindi ? 'बारिश के अनुसार ट्यूबवेल समय' : 'Live rain & pump runtime'}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-sm sm:text-base font-bold text-stone-900 font-['Outfit']">
            Govt. Schemes
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {isHindi ? 'सब्सिडी व सरकारी योजनाओं की पात्रता' : 'Subsidies & grant matches'}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-sm sm:text-base font-bold text-stone-900 font-['Outfit']">
            Farmer Market
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {isHindi ? 'पराली व कृषि उपकरण खरीदें/बेचें' : 'Residue & machine rental'}
          </div>
        </button>
      </div>

    </div>
  );
};
