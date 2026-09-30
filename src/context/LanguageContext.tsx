import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Auth Modal - Keeps familiar English words like 'Registration', 'Login', 'Password' with Hindi guidance
  authModalTitle: { en: 'Farmer Portal Access', hi: 'Farmer Portal Access' },
  authModalSubtitle: { 
    en: 'Sign in or register to access AI crop diagnostics, tubewell plans, and marketplace.', 
    hi: 'AI Crop Diagnostics, पानी योजना और हाट बाजार के लिए Login या Registration करें।' 
  },
  tabLogin: { en: 'Login', hi: 'Login' },
  tabRegister: { en: 'Register', hi: 'Registration' },
  fullName: { en: 'Full Name', hi: 'Full Name (पूरा नाम)' },
  fullNamePlaceholder: { en: 'e.g. Ramesh Patel', hi: 'उदा. रमेश पटेल' },
  emailAddress: { en: 'Email Address', hi: 'Email ID (ईमेल पता)' },
  emailPlaceholder: { en: 'farmer@example.com', hi: 'farmer@example.com' },
  password: { en: 'Password', hi: 'Password (पासवर्ड)' },
  passwordPlaceholder: { en: 'At least 6 characters', hi: 'कम से कम 6 अक्षर' },
  confirmPassword: { en: 'Confirm Password', hi: 'Confirm Password (दोबारा दर्ज करें)' },
  confirmPasswordPlaceholder: { en: 'Re-enter your password', hi: 'पासवर्ड दोबारा दर्ज करें' },
  forgotPassword: { en: 'Forgot password?', hi: 'Forgot Password (पासवर्ड भूल गए?)' },
  sendResetLink: { en: 'Send Reset Link', hi: 'Reset Link भेजें' },
  backToLogin: { en: 'Back to Login', hi: 'Back to Login (वापस जाएं)' },
  loginButton: { en: 'Sign In to Your Account', hi: 'Login करें (Sign In)' },
  registerButton: { en: 'Create Farmer Account', hi: 'Registration पूरा करें (खाता बनाएं)' },
  orDivider: { en: 'OR', hi: 'या (OR)' },
  continueWithGoogle: { en: 'Continue with Google', hi: 'Continue with Google' },
  alreadyHaveAccount: { en: 'Already have an account?', hi: 'क्या पहले से खाता है?' },
  dontHaveAccount: { en: 'New to E-Farmer?', hi: 'नए किसान भाई?' },
  registerNow: { en: 'Register Now', hi: 'Registration करें' },
  loginNow: { en: 'Login Now', hi: 'Login करें' },
  cancel: { en: 'Cancel', hi: 'Cancel' },

  // User Protection Notice & About Registration
  aboutRegistrationTitle: { 
    en: 'About Our Registration & User Protection', 
    hi: 'About Registration & User Protection (पंजीकरण व सुरक्षा)' 
  },
  aboutRegistrationDesc: { 
    en: 'Your account keeps your farm records private, secures your AI crop prescriptions, and protects your identity in local trade.',
    hi: 'Registration करने से आपके खेत का पूरा रिकॉर्ड और AI फसल पर्चियां सुरक्षित रहती हैं, और स्थानीय व्यापार में आपकी पहचान सुरक्षित रहती है।'
  },
  protectionPoint1Title: { en: '100% Data Protection & Privacy', hi: '100% Data Protection & Privacy' },
  protectionPoint1Desc: { 
    en: 'Your email and phone number are safely encrypted. We never share your land details with third-party advertisers.',
    hi: 'आपका Email और Mobile Number पूरी तरह सुरक्षित और Encrypted है। आपकी जमीन या फसल का विवरण किसी विज्ञापनदाता को नहीं बेचा जाता।'
  },
  protectionPoint2Title: { en: 'Save Your Farm Health History', hi: 'Farm Health History (रिकॉर्ड सुरक्षित)' },
  protectionPoint2Desc: { 
    en: 'Keep track of all scanned crop leaf diagnoses and custom water runtime calculations across all your devices.',
    hi: 'जांची गई सभी फसलों के रोग, दवाई का नाप और ट्यूबवेल पानी का हिसाब आपके मोबाइल पर हमेशा सुरक्षित रहेगा।'
  },
  protectionPoint3Title: { en: 'Verified Local Trade Access', hi: 'Direct Local Trade (सीधा व्यापार)' },
  protectionPoint3Desc: { 
    en: 'List your straw, organic manure, or farm equipment for rent without middleman cuts. Connect directly with nearby farmers.',
    hi: 'बिना बिचौलियों के पराली, गोबर खाद या ट्रैक्टर किराए पर दें और आसपास के साथी किसानों से सीधे संपर्क करें।'
  },
  userProtectionBadge: { en: 'Secure & Encrypted Farmer Identity', hi: 'Secure & Encrypted Farmer Identity' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('efarmer_language');
      if (saved === 'hi' || saved === 'en') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('efarmer_language', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
