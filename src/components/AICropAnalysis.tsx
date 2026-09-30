import React, { useState, useRef } from 'react';
import { 
  Camera, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Lock,
  CheckCircle2,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  AlertTriangle,
  Droplet,
  HeartPulse
} from 'lucide-react';
import { CropAnalysisRecord, FarmerProfile } from '../types';
import { SAMPLE_CROP_IMAGES, SampleCropImage } from '../data/sampleCrops';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AICropAnalysisProps {
  profile: FarmerProfile | null;
  analyses: CropAnalysisRecord[];
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  idToken: string | null;
  onAnalysisComplete: (record: CropAnalysisRecord) => void;
}

export const AICropAnalysis: React.FC<AICropAnalysisProps> = ({
  profile,
  analyses,
  isLoggedIn,
  onRequireLogin,
  idToken,
  onAnalysisComplete,
}) => {
  const { getIdToken } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isHindi = language === 'hi';
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropName, setCropName] = useState<string>(profile?.primaryCrop || '');
  const [cropStage, setCropStage] = useState<string>(profile?.cropStage || '');
  const [farmerNote, setFarmerNote] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<CropAnalysisRecord | null>(analyses[0] || null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  
  // Interactive "Answer Questions" interface state
  const [isAnsweringQuestions, setIsAnsweringQuestions] = useState<boolean>(false);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);

  // Collapsible Detailed Analysis state
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side downscaling to guarantee Firestore document limit (<1MB) is never exceeded
  const compressImage = (src: string, maxDim = 900, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      if (src.length < 200000 || src.startsWith('http')) {
        resolve(src);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
          return;
        }
        resolve(src);
      };
      img.onerror = () => resolve(src);
      img.src = src;
    });
  };

  const handleSelectSample = (sample: SampleCropImage) => {
    setSelectedImage(sample.imageUrl);
    setCropName(sample.crop);
    setFarmerNote(`Suspected: ${sample.suspectedIssue}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawResult = reader.result as string;
        try {
          const optimized = await compressImage(rawResult, 900, 0.75);
          setSelectedImage(optimized);
        } catch {
          setSelectedImage(rawResult);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    if (!selectedImage) {
      setStatusNotice(isHindi ? 'कृपया जांच के लिए पौधे की पत्ती का फोटो चुनें।' : 'Please upload a leaf photo or choose a sample test leaf to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setStatusNotice(null);
    try {
      let base64 = selectedImage;
      if (selectedImage.startsWith('http')) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      base64 = await compressImage(base64, 900, 0.75);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = (await getIdToken()) || idToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await fetch('/api/crop-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64: base64,
          cropName: cropName || 'Unspecified',
          cropStage: cropStage || 'Unspecified',
          farmerNote,
        }),
      });

      if (res.status === 401) {
        const freshToken = await getIdToken(true);
        if (freshToken) {
          headers['Authorization'] = `Bearer ${freshToken}`;
          res = await fetch('/api/crop-analysis', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              imageBase64: base64,
              cropName: cropName || 'Unspecified',
              cropStage: cropStage || 'Unspecified',
              farmerNote,
            }),
          });
        }
      }

      const data = await res.json();
      if (data.success && data.analysis) {
        setActiveResult(data.analysis);
        onAnalysisComplete(data.analysis);
        setQuestionAnswers({});
        setIsAnsweringQuestions(false);
        if (data.analysis.providerNotice) {
          setStatusNotice(data.analysis.providerNotice);
        }
      } else {
        setStatusNotice(isHindi ? 'विश्लेषण सेवा इस समय व्यस्त है। कृपया पुनः प्रयास करें।' : 'AI crop diagnosis service is experiencing high traffic. Please retry in a moment.');
      }
    } catch (err) {
      console.error(err);
      setStatusNotice(isHindi ? 'कनेक्शन बाधित हुआ। कृपया पुनः प्रयास करें।' : 'Network connection was interrupted. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Re-run analysis synthesizing IMAGE + ORIGINAL FARMER INFORMATION + NEW ANSWERS
  const handleAnswerSubmit = async () => {
    if (!selectedImage) return;
    setIsReanalyzing(true);
    setStatusNotice(null);
    try {
      let base64 = selectedImage;
      if (selectedImage.startsWith('http')) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
      base64 = await compressImage(base64, 900, 0.75);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = (await getIdToken()) || idToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/crop-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          imageBase64: base64,
          cropName: cropName || 'Unspecified',
          cropStage: cropStage || 'Unspecified',
          farmerNote,
          followUpAnswers: questionAnswers,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setActiveResult(data.analysis);
        onAnalysisComplete(data.analysis);
        setIsAnsweringQuestions(false);
        setStatusNotice(isHindi ? 'आपके उत्तरों के साथ विश्लेषण सफलतापूर्वक अपडेट किया गया!' : 'Analysis updated with your answers!');
        setTimeout(() => setStatusNotice(null), 4000);
      } else {
        setStatusNotice(data.error || 'Failed to update analysis.');
      }
    } catch (err) {
      console.error('Re-analysis error:', err);
      setStatusNotice('Failed to re-analyze. Please try again.');
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Copy short farmer-first response formatted to clipboard
  const copyFullReportToClipboard = () => {
    if (!activeResult) return;
    const cropText = isHindi ? (activeResult.cropHi || activeResult.crop || activeResult.identifiedCrop) : (activeResult.crop || activeResult.identifiedCrop);
    const problemText = isHindi ? (activeResult.problemHi || activeResult.problem || activeResult.leadingDiagnosis) : (activeResult.problem || activeResult.leadingDiagnosis);
    const findingsList = (isHindi ? (activeResult.whatIFoundHi || activeResult.whatIFound) : activeResult.whatIFound) || [];
    const actionsList = (isHindi ? (activeResult.whatToDoNowHi || activeResult.whatToDoNow) : activeResult.whatToDoNow) || [];
    const warningText = isHindi ? (activeResult.warningHi || activeResult.warning) : activeResult.warning;
    const questionsList = (isHindi ? (activeResult.questionsHi || activeResult.questions) : activeResult.questions) || [];

    const text = `🌱 CROP
${cropText}

STATUS
${activeResult.healthStatus}

🔍 PROBLEM
${problemText}

Confidence: ${activeResult.confidence}

WHAT I FOUND
${findingsList.map((f: string) => `• ${f}`).join('\n')}

WHAT TO DO NOW
${actionsList.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}
${warningText ? `\n⚠️ WARNING\n${warningText}` : ''}
${questionsList.length > 0 ? `\n📋 MORE INFORMATION NEEDED\n${questionsList.map((q: string) => `• ${q}`).join('\n')}` : ''}
`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  // Status mapping
  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return {
          icon: '🟢',
          text: isHindi ? 'स्वस्थ (Healthy)' : 'Healthy',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-300'
        };
      case 'Minor Issue':
        return {
          icon: '🟡',
          text: isHindi ? 'हल्की समस्या (Minor Issue)' : 'Minor Issue',
          badge: 'bg-yellow-50 text-yellow-800 border-yellow-300'
        };
      case 'Moderate Concern':
        return {
          icon: '🟠',
          text: isHindi ? 'मध्यम चिंता (Moderate Concern)' : 'Moderate Concern',
          badge: 'bg-orange-50 text-orange-800 border-orange-300'
        };
      case 'Severe Threat':
        return {
          icon: '🔴',
          text: isHindi ? 'गंभीर खतरा (Severe Threat)' : 'Severe Threat',
          badge: 'bg-red-50 text-red-800 border-red-300'
        };
      case 'Insufficient Evidence':
      default:
        return {
          icon: '⚪',
          text: isHindi ? 'अपर्याप्त साक्ष्य (Insufficient Evidence)' : 'Insufficient Evidence',
          badge: 'bg-stone-100 text-stone-700 border-stone-300'
        };
    }
  };

  // Confidence mapping: ONLY High, Moderate, Low, Insufficient Evidence
  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'High':
        return {
          text: isHindi ? 'उच्च (High)' : 'High',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'Moderate':
        return {
          text: isHindi ? 'मध्यम (Moderate)' : 'Moderate',
          badge: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'Low':
        return {
          text: isHindi ? 'कम (Low)' : 'Low',
          badge: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'Insufficient Evidence':
      default:
        return {
          text: isHindi ? 'अपर्याप्त साक्ष्य' : 'Insufficient Evidence',
          badge: 'bg-stone-200 text-stone-700 border-stone-300'
        };
    }
  };

  // Derived display strings based on language toggle
  const displayCrop = activeResult ? (isHindi ? (activeResult.cropHi || activeResult.crop || activeResult.identifiedCrop || activeResult.cropName) : (activeResult.crop || activeResult.identifiedCrop || activeResult.cropName)) : '';
  const displayProblem = activeResult ? (isHindi ? (activeResult.problemHi || activeResult.problem || activeResult.leadingDiagnosis) : (activeResult.problem || activeResult.leadingDiagnosis)) : '';
  const displayFindings = activeResult ? ((isHindi ? (activeResult.whatIFoundHi || activeResult.whatIFound) : activeResult.whatIFound) || activeResult.visibleEvidence || []) : [];
  const displayActions = activeResult ? ((isHindi ? (activeResult.whatToDoNowHi || activeResult.whatToDoNow) : activeResult.whatToDoNow) || activeResult.actionPlan?.immediateActions || []) : [];
  const displayWarning = activeResult ? (isHindi ? (activeResult.warningHi || activeResult.warning) : activeResult.warning) : null;
  const displayQuestions = activeResult ? ((isHindi ? (activeResult.questionsHi || activeResult.questions) : activeResult.questions) || activeResult.informationNeeded || []) : [];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Outfit'] flex items-center gap-2">
            <span>🌱</span>
            <span>{isHindi ? 'एआई फसल स्कैनर व स्वास्थ्य जांच' : 'AI Crop Scanner & Health Diagnostics'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            {isHindi 
              ? 'फसल की पत्ती या फल का फोटो अपलोड करें और तुरंत सरल, किसान-हितैषी सलाह पाएं।' 
              : 'Upload a clear leaf or crop photo to receive short, cautious, farmer-friendly guidance.'}
          </p>
        </div>

        {/* Global Language Toggle Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'hi' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {statusNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center justify-between gap-2 animate-in fade-in">
          <span>{statusNotice}</span>
          <button 
            type="button" 
            onClick={() => setStatusNotice(null)} 
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Authentication Prompt if not logged in */}
      {!isLoggedIn && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {isHindi 
                ? 'फसल स्वास्थ्य निदान और अपनी रिपोर्ट सहेजने के लिए कृपया लॉगिन करें।' 
                : 'Please sign in to run crop diagnostics and save historical diagnostic records.'}
            </span>
          </div>
          <button
            onClick={onRequireLogin}
            className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors shrink-0"
          >
            {isHindi ? 'लॉगिन करें' : 'Sign In'}
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Image Upload & Parameters */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 overflow-hidden">
          
          {/* Photo Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-16/10 rounded-2xl border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-stone-50 overflow-hidden cursor-pointer flex flex-col items-center justify-center p-3 transition-colors group"
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Crop Leaf" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-stone-800">
                  {isHindi ? 'फोटो खींचें या छवि अपलोड करें' : 'Tap to Take Photo or Upload Image'}
                </div>
                <div className="text-xs text-stone-400">
                  {isHindi ? 'पत्ती, तना, फल, मिट्टी या कीट की तस्वीर (JPG/PNG)' : 'Leaves, stems, fruits, soil, or insects (JPG / PNG)'}
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>

          {/* Quick Benchmark Reference Samples */}
          <div>
            <div className="text-xs font-bold text-stone-600 mb-2">
              {isHindi ? 'या संदर्भ नमूने से परीक्षण करें:' : 'Or test with reference sample:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_CROP_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedImage === sample.imageUrl
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <img src={sample.imageUrl} alt={sample.crop} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">{sample.crop}</div>
                    <div className="text-[10px] text-stone-500 truncate">{sample.suspectedIssue}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Farmer Context Parameters */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {isHindi ? 'फसल का नाम (Crop Type)' : 'Crop Type'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'जैसे गेहूं, टमाटर, धान' : 'e.g. Wheat, Tomato, Paddy'}
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold bg-stone-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                {isHindi ? 'वृद्धि अवस्था (Stage)' : 'Growth Stage'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'जैसे बढ़वार, फूल, दाना' : 'e.g. Vegetative, Flowering'}
                value={cropStage}
                onChange={(e) => setCropStage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50"
              />
            </div>
          </div>

          {/* Field Observations Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              {isHindi ? 'खेत के लक्षण व अवलोकन' : 'Field Observations & Visible Symptoms'}
            </label>
            <textarea
              rows={2}
              placeholder={isHindi ? 'जैसे पत्तियों पर पीली धारियां, मुड़ते किनारे, नीचे बारीक कीट दिखे...' : 'e.g. Yellow stripes along veins, curling edges, saw tiny aphids underneath...'}
              value={farmerNote}
              onChange={(e) => setFarmerNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 resize-none"
            />
          </div>

          {/* Run Diagnostic Button */}
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin shrink-0" />
                <span>{isHindi ? 'एआई फसल स्वास्थ्य का विश्लेषण कर रहा है...' : 'AI Analyzing Crop Health...'}</span>
              </>
            ) : !isLoggedIn ? (
              <>
                <Lock className="w-4 h-4 shrink-0" />
                <span>{isHindi ? 'जांच के लिए लॉगिन करें' : 'Sign In to Run Analysis'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{isHindi ? 'फसल जांचें (Analyze Crop)' : 'Analyze Crop Health'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Default Farmer-First Output Card */}
        <div className="lg:col-span-7">
          {activeResult ? (
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-5 overflow-hidden max-w-full">
              
              {/* Header Bar with Language Switch & Copy Report */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900 font-['Outfit']">
                      {isHindi ? 'फसल स्वास्थ्य निदान रिपोर्ट' : 'Crop Diagnostic Result'}
                    </h3>
                    <div className="text-[11px] text-stone-500">
                      {new Date(activeResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyFullReportToClipboard}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copy response to clipboard"
                  >
                    {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReport ? (isHindi ? 'कॉपी हो गया!' : 'Copied!') : (isHindi ? 'कॉपी करें' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 7: FARMER INFORMATION CONFLICT BANNER */}
              {activeResult.conflict?.hasConflict && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{isHindi ? '⚠️ संभावित फसल बेमेल (Crop Mismatch)' : '⚠️ Possible Crop Mismatch'}</span>
                  </div>
                  <div className="text-xs text-amber-900 pl-7 space-y-0.5">
                    <div>
                      <strong className="font-bold">{isHindi ? 'किसान द्वारा दर्ज:' : 'Farmer entered:'} </strong>
                      <span>{activeResult.conflict.farmerInput}</span>
                    </div>
                    <div>
                      <strong className="font-bold">{isHindi ? 'AI दृश्य आकलन:' : 'AI visual assessment:'} </strong>
                      <span className="font-bold text-amber-950">{activeResult.conflict.visualAssessment}</span>
                    </div>
                    <p className="pt-1 text-[11px] text-amber-800 font-medium leading-relaxed">
                      {isHindi ? (activeResult.conflict.messageHi || activeResult.conflict.message) : activeResult.conflict.message}
                    </p>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 11 FORMAT: CROP, STATUS, PROBLEM, CONFIDENCE */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3.5">
                
                {/* 🌱 CROP & STATUS */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                      🌱 {isHindi ? 'फसल (CROP)' : 'CROP'}
                    </div>
                    <div className="text-lg font-black text-stone-900 font-['Outfit']">
                      {displayCrop}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider mb-0.5 text-right sm:text-left">
                      {isHindi ? 'स्थिति (STATUS)' : 'STATUS'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 shadow-2xs ${getHealthBadge(activeResult.healthStatus).badge}`}>
                      <span>{getHealthBadge(activeResult.healthStatus).icon}</span>
                      <span>{getHealthBadge(activeResult.healthStatus).text}</span>
                    </div>
                  </div>
                </div>

                {/* 🔍 PROBLEM & CONFIDENCE */}
                <div className="pt-3 border-t border-stone-200/80 flex items-start justify-between flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                      🔍 {isHindi ? 'समस्या (PROBLEM)' : 'PROBLEM'}
                    </div>
                    <div className="text-base sm:text-lg font-black text-emerald-950 font-['Outfit'] leading-snug">
                      {displayProblem}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-0.5">
                      {isHindi ? 'सटीकता (Confidence)' : 'Confidence'}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block ${getConfidenceBadge(activeResult.confidence).badge}`}>
                      {getConfidenceBadge(activeResult.confidence).text}
                    </span>
                  </div>
                </div>

              </div>

              {/* ----------------------------------------------------------------- */}
              {/* WHAT I FOUND (2–4 important visible observations) */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-2">
                <div className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📋 {isHindi ? 'मुझे क्या दिखा (WHAT I FOUND)' : 'WHAT I FOUND'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <ul className="text-xs sm:text-sm text-stone-700 space-y-2 pl-4 list-disc">
                    {displayFindings.map((finding: string, idx: number) => (
                      <li key={idx} className="leading-relaxed font-medium">{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* WHAT TO DO NOW (2–4 immediate low-risk actions) */}
              {/* ----------------------------------------------------------------- */}
              <div className="space-y-2">
                <div className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>✅ {isHindi ? 'अब क्या करें (WHAT TO DO NOW)' : 'WHAT TO DO NOW'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <ol className="text-xs sm:text-sm text-stone-800 space-y-2 pl-4 list-decimal font-medium">
                    {displayActions.map((action: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{action}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* ⚠️ WARNING / DISCLAIMER (if necessary) */}
              {/* ----------------------------------------------------------------- */}
              {displayWarning && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black block uppercase text-[10px] text-amber-800 tracking-wider">
                      ⚠️ {isHindi ? 'महत्वपूर्ण चेतावनी' : 'IMPORTANT WARNING'}
                    </span>
                    <span className="font-semibold leading-relaxed">{displayWarning}</span>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* 📋 MORE INFORMATION NEEDED & INTERACTIVE "ANSWER QUESTIONS" */}
              {/* ----------------------------------------------------------------- */}
              {displayQuestions.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📋 {isHindi ? 'अधिक जानकारी की आवश्यकता है' : 'MORE INFORMATION NEEDED'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnsweringQuestions(!isAnsweringQuestions)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{isAnsweringQuestions ? (isHindi ? 'फॉर्म बंद करें' : 'Hide Questions') : (isHindi ? 'प्रश्नों के उत्तर दें (Answer Questions)' : 'Answer Questions')}</span>
                    </button>
                  </div>

                  <ul className="text-xs text-stone-700 space-y-1.5 pl-4 list-disc">
                    {displayQuestions.map((q: string, idx: number) => (
                      <li key={idx} className="leading-relaxed font-medium">{q}</li>
                    ))}
                  </ul>

                  {/* Interactive Input Form for Answering Follow-up Questions */}
                  {isAnsweringQuestions && (
                    <div className="pt-3 border-t border-stone-200 space-y-3 animate-in fade-in">
                      <div className="text-xs font-bold text-stone-800">
                        {isHindi 
                          ? 'सटीक सलाह के लिए नीचे दिए गए प्रश्नों के उत्तर दर्ज करें:' 
                          : 'Please answer these questions to refine the diagnosis:'}
                      </div>
                      <div className="space-y-2.5">
                        {displayQuestions.map((q: string, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <label className="block text-[11px] font-bold text-stone-700">
                              {idx + 1}. {q}
                            </label>
                            <input
                              type="text"
                              value={questionAnswers[q] || ''}
                              onChange={(e) => setQuestionAnswers({ ...questionAnswers, [q]: e.target.value })}
                              placeholder={isHindi ? 'अपना उत्तर यहां लिखें...' : 'Type your answer here...'}
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleAnswerSubmit}
                        disabled={isReanalyzing}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                      >
                        {isReanalyzing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{isHindi ? 'उत्तरों के साथ पुनः विश्लेषण जारी है...' : 'Re-analyzing with your answers...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'उत्तर सबमिट करें व दोबारा जांचें' : 'Submit Answers & Re-analyze'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* ACTION BUTTON: [ View Detailed Analysis ] */}
              {/* ----------------------------------------------------------------- */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="px-4 py-2.5 rounded-2xl border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>
                    {showDetailedAnalysis 
                      ? (isHindi ? 'विस्तृत विश्लेषण छिपाएं' : 'Hide Detailed Analysis') 
                      : (isHindi ? 'विस्तृत विश्लेषण देखें (View Detailed Analysis)' : 'View Detailed Analysis')}
                  </span>
                  {showDetailedAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 10: DETAILED ANALYSIS PANEL (Shown ONLY when requested) */}
              {/* ----------------------------------------------------------------- */}
              {showDetailedAnalysis && (
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4 animate-in fade-in text-xs">
                  
                  <div className="font-black text-stone-900 text-sm uppercase tracking-wider border-b border-stone-200 pb-2">
                    {isHindi ? '🔬 विस्तृत तकनीकी व कृषि विश्लेषण' : '🔬 Detailed Technical Agronomic Analysis'}
                  </div>

                  {/* Diagnostic Reasoning */}
                  {activeResult.detailedAnalysis?.reasoning && (
                    <div className="space-y-1">
                      <span className="font-bold text-stone-900 block">
                        {isHindi ? 'निदान का आधार (Diagnostic Reasoning):' : 'Diagnostic Reasoning:'}
                      </span>
                      <p className="text-stone-700 leading-relaxed">
                        {isHindi 
                          ? (activeResult.detailedAnalysis.reasoningHi || activeResult.detailedAnalysis.reasoning) 
                          : activeResult.detailedAnalysis.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Primary vs Secondary Damage */}
                  {activeResult.detailedAnalysis?.primaryVsSecondary && (
                    <div className="space-y-1">
                      <span className="font-bold text-stone-900 block">
                        {isHindi ? 'प्राथमिक बनाम द्वितीयक क्षति (Primary vs Secondary):' : 'Primary vs Secondary Damage:'}
                      </span>
                      <p className="text-stone-700 leading-relaxed">
                        {isHindi 
                          ? (activeResult.detailedAnalysis.primaryVsSecondaryHi || activeResult.detailedAnalysis.primaryVsSecondary) 
                          : activeResult.detailedAnalysis.primaryVsSecondary}
                      </p>
                    </div>
                  )}

                  {/* Alternative Causes */}
                  {activeResult.detailedAnalysis?.alternativeCauses && activeResult.detailedAnalysis.alternativeCauses.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-stone-900 block">
                        {isHindi ? 'अन्य संभावित कारण (Alternative Explanations Considered):' : 'Alternative Causes Considered:'}
                      </span>
                      <ul className="pl-4 list-disc space-y-1 text-stone-700">
                        {(isHindi 
                          ? (activeResult.detailedAnalysis.alternativeCausesHi || activeResult.detailedAnalysis.alternativeCauses) 
                          : activeResult.detailedAnalysis.alternativeCauses
                        ).map((alt: string, i: number) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detailed Crop Care */}
                  {activeResult.detailedAnalysis?.cropCare && (
                    <div className="pt-2 border-t border-stone-200 space-y-2">
                      <span className="font-bold text-stone-900 block">
                        {isHindi ? 'दीर्घकालिक फसल देखभाल (Long-term Crop Care):' : 'Detailed Crop Care:'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-1">
                          <span className="font-extrabold text-cyan-900 flex items-center gap-1">
                            <Droplet className="w-3.5 h-3.5 text-cyan-700" />
                            <span>{isHindi ? 'जल प्रबंधन' : 'Water'}</span>
                          </span>
                          <p className="text-[11px] text-stone-700 leading-relaxed">
                            {isHindi ? (activeResult.detailedAnalysis.cropCareHi?.water || activeResult.detailedAnalysis.cropCare.water) : activeResult.detailedAnalysis.cropCare.water}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                          <span className="font-extrabold text-amber-900 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <span>{isHindi ? 'पोषण प्रबंधन' : 'Nutrition'}</span>
                          </span>
                          <p className="text-[11px] text-stone-700 leading-relaxed">
                            {isHindi ? (activeResult.detailedAnalysis.cropCareHi?.nutrition || activeResult.detailedAnalysis.cropCare.nutrition) : activeResult.detailedAnalysis.cropCare.nutrition}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                          <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{isHindi ? 'सामान्य देखभाल' : 'Other Care'}</span>
                          </span>
                          <p className="text-[11px] text-stone-700 leading-relaxed">
                            {isHindi ? (activeResult.detailedAnalysis.cropCareHi?.otherCare || activeResult.detailedAnalysis.cropCare.otherCare) : activeResult.detailedAnalysis.cropCare.otherCare}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-stone-300 text-center text-stone-400 space-y-2 flex flex-col items-center justify-center min-h-[360px]">
              <HeartPulse className="w-10 h-10 text-stone-300" />
              <div className="text-base font-bold text-stone-600">
                {isHindi ? 'फसल स्वास्थ्य जांच के लिए तैयार' : 'Ready to Analyze Crop Health'}
              </div>
              <div className="text-xs text-stone-500 max-w-sm">
                {isHindi
                  ? 'बाईं ओर अपनी फसल की पत्ती का फोटो अपलोड करें या नमूना चुनें, फिर "फसल जांचें" पर क्लिक करें।'
                  : 'Upload your crop leaf photo on the left or tap one of the reference samples, then click "Analyze Crop Health" to view the farmer-first diagnosis.'}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
