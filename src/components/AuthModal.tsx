import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Languages, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sprout,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'login'
}) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    registerWithEmail, 
    resetPassword, 
    loading: authLoading 
  } = useAuth();
  
  const { language, setLanguage, t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAboutSection, setShowAboutSection] = useState(false);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    resetFormState();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दर्ज करें।' : 'Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || (language === 'hi' ? 'लॉगिन विफल रहा।' : 'Failed to sign in.'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दर्ज करें।' : 'Please enter email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await registerWithEmail(email, password, fullName);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(language === 'hi' ? 'खाता सफलतापूर्वक बन गया! आपका स्वागत है।' : 'Account created successfully! Welcome.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(result.error || (language === 'hi' ? 'पंजीकरण विफल रहा।' : 'Failed to register.'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage(language === 'hi' ? 'कृपया अपना पंजीकृत ईमेल दर्ज करें।' : 'Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(language === 'hi' 
        ? 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।' 
        : 'Password reset instructions have been sent to your email.');
    } else {
      setErrorMessage(result.error || (language === 'hi' ? 'रीसेट लिंक भेजने में त्रुटि।' : 'Failed to send reset link.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header with Language Selector & Close */}
        <div className="bg-stone-50/90 border-b border-stone-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-stone-900 text-sm sm:text-base font-['Outfit'] block leading-tight">
                E-FARMER
              </span>
              <span className="text-[10px] text-stone-500 font-semibold">
                {t('portalTagline')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Translator Switcher Button */}
            <div className="flex items-center bg-white border border-stone-200 rounded-xl p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Switch to English"
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="हिंदी में बदलें"
              >
                हिंदी
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300/80 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">

          {/* User Protection Trust Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-900 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{t('userProtectionBadge')}</span>
          </div>

          {/* Primary Two Choices: Login OR Register */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('tabLogin')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('tabRegister')}</span>
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('emailAddress')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    {t('password')}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-pulse">{language === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Signing in...'}</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t('loginButton')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('emailAddress')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPasswordPlaceholder')}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-500 leading-tight">
                {language === 'hi' 
                  ? 'पंजीकरण करके आप हमारी डेटा सुरक्षा व किसान गोपनीयता नीति स्वीकार करते हैं।' 
                  : 'By registering, you agree to our farmer data protection and privacy policy.'}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-pulse">{language === 'hi' ? 'खाता बना रहे हैं...' : 'Creating account...'}</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t('registerButton')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-stone-900 text-sm">
                  {language === 'hi' ? 'पासवर्ड रीसेट करें' : 'Reset Your Password'}
                </h4>
                <p className="text-xs text-stone-600">
                  {language === 'hi'
                    ? 'अपना पंजीकृत ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट करने का लिंक भेजेंगे।'
                    : 'Enter your registered email address and we will send you a password reset link.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t('emailAddress')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || authLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm cursor-pointer transition-all"
              >
                {isSubmitting ? (language === 'hi' ? 'भेज रहे हैं...' : 'Sending...') : t('sendResetLink')}
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="w-full text-center text-xs font-bold text-stone-600 hover:text-stone-900 py-1 cursor-pointer"
              >
                {t('backToLogin')}
              </button>
            </form>
          )}

          {/* Divider: OR / या */}
          {mode !== 'forgot' && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-stone-200"></div>
                <span className="shrink-0 mx-3 text-stone-400 text-xs font-bold tracking-wider">
                  {t('orDivider')}
                </span>
                <div className="grow border-t border-stone-200"></div>
              </div>

              {/* Continue with Google button */}
              <button
                type="button"
                onClick={async () => {
                  setErrorMessage(null);
                  const result = await signInWithGoogle();
                  if (result.success) {
                    onClose();
                  } else if (result.error && result.error !== 'Sign-in cancelled.') {
                    setErrorMessage(result.error);
                  }
                }}
                disabled={authLoading || isSubmitting}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-3 cursor-pointer transition-all"
              >
                {/* Official Google multicolored G SVG icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>{t('continueWithGoogle')}</span>
              </button>
            </>
          )}

          {/* Expandable Section: About Our Registration & User Protection */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowAboutSection(!showAboutSection)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>{t('aboutRegistrationTitle')}</span>
              </div>
              {showAboutSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAboutSection && (
              <div className="mt-2 p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-2.5 text-xs text-stone-600 animate-in fade-in">
                <p className="text-[11px] leading-relaxed text-stone-700 font-medium">
                  {t('aboutRegistrationDesc')}
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        {t('protectionPoint1Title')}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight">
                        {t('protectionPoint1Desc')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Sprout className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        {t('protectionPoint2Title')}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight">
                        {t('protectionPoint2Desc')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        {t('protectionPoint3Title')}
                      </span>
                      <span className="text-[11px] text-stone-500 leading-tight">
                        {t('protectionPoint3Desc')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
