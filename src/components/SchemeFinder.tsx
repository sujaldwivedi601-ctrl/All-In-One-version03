import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Search, 
  Sparkles, 
  Droplet, 
  Wrench, 
  ShieldCheck, 
  CreditCard, 
  Layers,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { Scheme, FarmerProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { schemesHindiMap } from '../data/schemesHindiData';

interface SchemeFinderProps {
  profile: FarmerProfile | null;
  onOpenProfile: () => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}

export const SchemeFinder: React.FC<SchemeFinderProps> = ({
  profile,
  onOpenProfile,
  isLoggedIn,
  onRequireLogin,
}) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schemes?category=${selectedCategory}`);
      const data = await res.json();
      if (data.success && data.schemes) {
        setSchemes(data.schemes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const categories = [
    { id: 'All', label: 'All Schemes', labelHindi: 'सभी योजनाएं (All)', icon: Layers },
    { id: 'Irrigation', label: 'Irrigation', labelHindi: 'सिंचाई (Irrigation)', icon: Droplet },
    { id: 'Machinery', label: 'Machinery', labelHindi: 'कृषि यंत्र (Machinery)', icon: Wrench },
    { id: 'Crop Protection', label: 'Insurance', labelHindi: 'फसल बीमा (Insurance)', icon: ShieldCheck },
    { id: 'Credit & Income', label: 'Credit & Income', labelHindi: 'ऋण व आय (Credit)', icon: CreditCard },
  ];

  const filteredSchemes = schemes.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const hiData = schemesHindiMap[s.id];
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.shortDesc && s.shortDesc.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.benefitAmount && s.benefitAmount.toLowerCase().includes(q)) ||
      (hiData && hiData.shortDescHindi && hiData.shortDescHindi.includes(q)) ||
      (hiData && hiData.benefitAmountHindi && hiData.benefitAmountHindi.includes(q))
    );
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-20 md:pb-6 max-w-full overflow-hidden">
      
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                {isHindi 
                  ? 'Government Schemes & Subsidies (सरकारी योजनाएं व अनुदान)' 
                  : 'Government Schemes & Subsidies'}
              </span>
            </div>
            
            {/* Main Heading in English */}
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Outfit'] tracking-tight break-words">
              Direct Farmer Support
            </h2>
            
            {/* Description in Hindi when toggled */}
            <p className="text-xs sm:text-sm text-stone-600 mt-1 break-words leading-relaxed">
              {isHindi
                ? 'सरकारी अनुदान, सिंचाई सब्सिडी और कृषि यंत्रों पर मिलने वाली वित्तीय सहायता की पूरी जानकारी। जाने योजना में क्या मिलेगा और Registration कैसे करें।'
                : 'Verified financial aid, machinery grants & irrigation schemes tailored to your farm with step-by-step registration guidance.'}
            </p>
          </div>
          <div className="self-start sm:self-center">
            <span className="text-xs sm:text-sm font-bold px-3 py-1.5 bg-stone-100 text-stone-700 rounded-xl whitespace-nowrap">
              {isHindi ? `${filteredSchemes.length} Schemes उपलब्ध` : `${filteredSchemes.length} Schemes Available`}
            </span>
          </div>
        </div>

        {/* Guest Viewing Notice */}
        {!isLoggedIn && (
          <div className="mt-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs sm:text-sm">
                {isHindi
                  ? 'Viewing Mode • अपनी जमीन और खतौनी के अनुसार सटीक Eligibility जांचने के लिए Sign In करें।'
                  : 'Viewing Mode • Sign in to check tailored eligibility based on your land and soil card.'}
              </span>
            </div>
            <button
              onClick={onRequireLogin}
              className="text-xs sm:text-sm font-bold text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300 shrink-0 cursor-pointer hover:bg-amber-100 transition-colors"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 max-w-full">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{isHindi ? cat.labelHindi : cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={isHindi 
            ? 'योजना का नाम, सब्सिडी राशि या कृषि यंत्र खोजें (Search Scheme, Subsidy)...' 
            : 'Search by scheme name, subsidy amount, or equipment...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs sm:text-sm bg-white"
        />
      </div>

      {/* Scheme Cards Grid: 1 col on mobile, 2 cols on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchemes.map((scheme) => {
          const hi = schemesHindiMap[scheme.id];

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-3.5 overflow-hidden"
            >
              <div className="space-y-3">
                {/* Top row: Category tag & Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                    {isHindi && hi?.categoryHindi ? hi.categoryHindi : scheme.category}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {isHindi && hi?.tailoredStatusHindi ? hi.tailoredStatusHindi : (scheme.tailoredStatus || 'Eligible')}
                  </span>
                </div>

                {/* Scheme Title in English (Always in English as requested) */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 font-['Outfit'] leading-snug break-words">
                    {scheme.name}
                  </h3>
                </div>

                {/* Highlighted Benefit Box (What government provides) */}
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-0.5">
                  <div className="text-[11px] uppercase font-bold text-amber-800">
                    {isHindi ? 'Benefit Amount (सरकार से क्या मिलेगा)' : 'Benefit Amount'}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-stone-900 break-words leading-tight">
                    {isHindi && hi?.benefitAmountHindi ? hi.benefitAmountHindi : scheme.benefitAmount}
                  </div>
                </div>

                {/* Short Description (In Hindi when toggled) */}
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed break-words">
                  {isHindi && hi?.shortDescHindi ? hi.shortDescHindi : scheme.shortDesc}
                </p>

                {/* Match Reason Banner */}
                {(scheme.matchReason || hi?.matchReasonHindi) && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-800 flex items-start gap-2 break-words">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="break-words">
                      {isHindi && hi?.matchReasonHindi ? hi.matchReasonHindi : scheme.matchReason}
                    </span>
                  </div>
                )}
              </div>

              {/* Eligibility & Documents Accordion */}
              <div className="pt-3 border-t border-stone-100 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  
                  {/* Who can apply / Eligibility */}
                  <div className="bg-stone-50 p-3 rounded-xl">
                    <div className="font-bold text-stone-800 mb-1">
                      {isHindi ? 'पात्रता (Key Eligibility):' : 'Key Eligibility:'}
                    </div>
                    <ul className="text-stone-600 space-y-1">
                      {((isHindi && hi?.eligibilityHindi) || scheme.eligibility || []).slice(0, 2).map((el, i) => (
                        <li key={i} className="flex items-start gap-1.5 break-words">
                          <span className="text-emerald-700 font-bold">•</span>
                          <span>{el}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Documents */}
                  <div className="bg-stone-50 p-3 rounded-xl">
                    <div className="font-bold text-stone-800 mb-1">
                      {isHindi ? 'ज़रूरी दस्तावेज़ (Documents):' : 'Documents:'}
                    </div>
                    <ul className="text-stone-600 space-y-1">
                      {((isHindi && hi?.documentsHindi) || scheme.documents || []).slice(0, 2).map((doc, i) => (
                        <li key={i} className="flex items-start gap-1.5 break-words">
                          <span className="text-amber-700 font-bold">•</span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* How to Register & Application Route */}
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold text-emerald-900 block text-[11px]">
                      {isHindi ? 'Registration कैसे करें (How to Register):' : 'How to Apply / Registration:'}
                    </span>
                    <span className="text-[11px] text-emerald-800 leading-tight">
                      {isHindi && hi?.applicationRouteHindi ? hi.applicationRouteHindi : (scheme.applicationRoute || 'Direct Online Portal')}
                    </span>
                  </div>
                </div>

                {/* Online Apply Button */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <span className="text-xs font-semibold text-stone-500 truncate">
                    {isHindi ? 'Official Government Portal' : (scheme.applicationRoute || 'Direct Online Portal')}
                  </span>
                  <a
                    href={scheme.officialPortalUrl || 'https://agricoop.nic.in'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2 sm:py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs shrink-0"
                  >
                    <span>{isHindi ? 'Apply Online / Portal' : 'Apply Online'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
