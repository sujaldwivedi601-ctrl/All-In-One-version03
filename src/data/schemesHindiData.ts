export interface SchemeHindiContent {
  name: string;
  categoryHindi: string;
  benefitAmountHindi: string;
  shortDescHindi: string;
  matchReasonHindi: string;
  eligibilityHindi: string[];
  documentsHindi: string[];
  applicationRouteHindi: string;
  tailoredStatusHindi: string;
}

export const schemesHindiMap: Record<string, SchemeHindiContent> = {
  'pm-kisan': {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    categoryHindi: 'क्रेडिट और आय सहायता',
    benefitAmountHindi: '₹6,000 प्रति वर्ष (सीधे बैंक खाते में DBT)',
    shortDescHindi: 'सभी पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता, ₹2,000 की तीन बराबर किस्तों में सीधे बैंक खाते में दी जाती है।',
    matchReasonHindi: 'छोटे और सीमांत सभी भूस्वामी किसानों के लिए सीधी सरकारी सहायता।',
    eligibilityHindi: [
      'खेती योग्य भूमि वाले सभी किसान परिवार पात्र हैं',
      'सभी राज्यों एवं केंद्र शासित प्रदेशों के छोटे एवं सीमांत किसान',
      'आधार से जुड़ा बैंक खाता और e-KYC पूरा होना अनिवार्य है'
    ],
    documentsHindi: [
      'आधार कार्ड (Aadhaar Card)',
      'भूमि स्वामित्व रिकॉर्ड (खतौनी / खसरा / 7/12 नकल)',
      'बैंक पासबुक की प्रति या कैंसल चेक',
      'आधार से लिंक सक्रिय मोबाइल नंबर'
    ],
    applicationRouteHindi: 'PM-KISAN पोर्टल पर ऑनलाइन आवेदन करें या नजदीकी जन सेवा केंद्र (CSC) / ग्राम पंचायत जाएं।',
    tailoredStatusHindi: 'पात्र एवं अनुशंसित (Eligible)',
  },
  'pmksy-per-drop': {
    name: 'PM Krishi Sinchayee Yojana - Per Drop More Crop (PDMC)',
    categoryHindi: 'सिंचाई सहायता (Irrigation)',
    benefitAmountHindi: '55% तक पूंजीगत लागत सब्सिडी (Grant)',
    shortDescHindi: 'ड्रिप (टपक) और स्प्रिंकलर (फव्वारा) सिंचाई प्रणाली लगाने के लिए छोटे और सीमांत किसानों को 55% तक और अन्य किसानों को 45% तक सरकारी सब्सिडी मिलती है।',
    matchReasonHindi: 'पारंपरिक बाढ़ सिंचाई के स्थान पर ड्रिप लगाने पर पानी और बिजली की भारी बचत।',
    eligibilityHindi: [
      'निश्चित जल स्रोत (कुआं, ट्यूबवेल/बोरवेल, फार्म पोंड, नहर) उपलब्ध होना चाहिए',
      'न्यूनतम 0.2 हेक्टेयर खेती योग्य भूमि',
      'छोटे एवं सीमांत किसानों को 10% अतिरिक्त प्राथमिकता सब्सिडी'
    ],
    documentsHindi: [
      'जमीन का भू-अभिलेख (7/12, 8-A या राज्य राजस्व रिकॉर्ड)',
      'जल स्रोत उपलब्धता प्रमाण पत्र / ट्यूबवेल बिजली बिल',
      'आधार कार्ड एवं बैंक पासबुक की प्रति',
      'मृदा स्वास्थ्य कार्ड (यदि उपलब्ध हो)'
    ],
    applicationRouteHindi: 'राज्य कृषि / बागवानी पोर्टल (जैसे i-Khedut, MahaDBT या pmksy.gov.in) पर ऑनलाइन आवेदन करें।',
    tailoredStatusHindi: '55% सब्सिडी पात्र (Eligible)',
  },
  'smam-machinery': {
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    categoryHindi: 'कृषि यंत्र सब्सिडी (Machinery)',
    benefitAmountHindi: '40% से 50% कृषि यंत्र सब्सिडी (रोटावेटर पर ₹1,25,000 तक)',
    shortDescHindi: 'ट्रैक्टर, पावर टिलर, रोटावेटर, लेजर लैंड लेवलर, सीड ड्रिल और कंबाइन हार्वेस्टर जैसे आधुनिक कृषि यंत्रों की खरीद पर 40% से 50% तक वित्तीय अनुदान।',
    matchReasonHindi: 'रोटावेटर, टिलर व बुवाई मशीनों पर भारी सब्सिडी उपलब्ध है।',
    eligibilityHindi: [
      'वैध खेती योग्य जमीन का रिकॉर्ड रखने वाले किसान',
      'पिछले 5 वर्षों में उसी उपकरण के लिए सरकारी सब्सिडी न ली हो',
      'छोटे, सीमांत एवं महिला किसानों को विशेष प्राथमिकता'
    ],
    documentsHindi: [
      'जमीन का खसरा / खतौनी राजस्व दस्तावेज',
      'आधार कार्ड और वोटर पहचान पत्र',
      'अधिकृत कृषि यंत्र डीलर का कोटेशन / प्रोफार्मा इनवॉइस',
      'बैंक खाता पासबुक की फोटोकॉपी'
    ],
    applicationRouteHindi: 'प्रत्यक्ष किसान पोर्टल agrimachinery.nic.in या राज्य कृषि विभाग के पोर्टल पर आवेदन करें।',
    tailoredStatusHindi: 'पात्र (Eligible)',
  },
  'pm-fasal-bima': {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    categoryHindi: 'फसल सुरक्षा एवं बीमा (Crop Protection)',
    benefitAmountHindi: 'पूर्ण बीमित राशि (रबी फसल हेतु केवल 1.5% व खरीफ हेतु 2% प्रीमियम)',
    shortDescHindi: 'सूखा, बाढ़, बेमौसम बारिश, कीट या ओलावृष्टि से फसल नुकसान होने पर न्यूनतम प्रीमियम पर व्यापक बीमा सुरक्षा एवं त्वरित वित्तीय मुआवजा।',
    matchReasonHindi: 'बेमौसम बारिश, ओलावृष्टि और कीट प्रकोप से खड़ी फसल की संपूर्ण सुरक्षा।',
    eligibilityHindi: [
      'अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी ऋणी एवं गैर-ऋणी किसान',
      'बटाईदार और पट्टेदार किसान भी स्व-घोषणा पत्र के साथ पात्र हैं'
    ],
    documentsHindi: [
      'पटवारी / ग्राम सेवक द्वारा प्रमाणित बुवाई प्रमाण पत्र / खतौनी',
      'बैंक पासबुक का विवरण (IFSC कोड सहित)',
      'आधार कार्ड की प्रति',
      'फसल बुवाई स्व-घोषणा पत्र'
    ],
    applicationRouteHindi: 'अपनी बैंक शाखा, राष्ट्रीय फसल बीमा पोर्टल pmfby.gov.in या नजदीकी CSC केंद्र से कट-ऑफ तिथि से पहले जुड़ें।',
    tailoredStatusHindi: 'उपलब्ध (Active)',
  },
  'pm-kusum-solar': {
    name: 'PM-KUSUM Scheme (Solar Agriculture Pumps)',
    categoryHindi: 'सौर ऊर्जा सिंचाई पंप (Solar Irrigation)',
    benefitAmountHindi: '3 HP से 10 HP सौर पंपों पर 60% तक भारी सब्सिडी',
    shortDescHindi: 'डीजल और बिजली ट्यूबवेल को सौर ऊर्जा से संचालित करने या नए स्टैंडअलोन सोलर पंप लगाने के लिए 60% (30% केंद्र + 30% राज्य) तक का अनुदान।',
    matchReasonHindi: 'डीजल और बिजली बिल के खर्च को शून्य करके दिन में मुफ्त सौर सिंचाई प्रदान करता है।',
    eligibilityHindi: [
      'व्यक्तिगत किसान, सहकारी समितियां और किसान उत्पादक संगठन (FPO)',
      'खेती योग्य जमीन पर बोरवेल या खुला कुआं उपलब्ध होना चाहिए',
      'जहां बिजली ग्रिड कनेक्शन नहीं है, उन्हें कंपोनेंट-बी के तहत सर्वोच्च प्राथमिकता'
    ],
    documentsHindi: [
      'भूमि स्वामित्व दस्तावेज एवं नक्शा',
      'आधार कार्ड एवं मोबाइल नंबर',
      'बैंक खाता विवरण एवं पासबुक',
      'ग्रिड कनेक्शन न होने का शपथ पत्र (कंपोनेंट-बी हेतु)'
    ],
    applicationRouteHindi: 'राज्य अक्षय ऊर्जा विकास निगम (REDA) अथवा pmkusum.mnre.gov.in पर ऑनलाइन आवेदन करें।',
    tailoredStatusHindi: 'उच्च सब्सिडी (High Subsidy)',
  },
  'kisan-credit-card': {
    name: 'Kisan Credit Card (KCC) & Interest Subvention',
    categoryHindi: 'ऋण एवं कार्यशील पूंजी (Credit & Loans)',
    benefitAmountHindi: '₹3,00,000 तक की कार्यशील पूंजी केवल 4% प्रभावी ब्याज दर पर',
    shortDescHindi: 'फसल की बुवाई, खाद-बीज, कीटनाशक और कृषि उपकरणों के रखरखाव के लिए ₹3 लाख तक का अल्पकालिक कृषि ऋण बेहद रियायती 4% शुद्ध ब्याज दर पर उपलब्ध।',
    matchReasonHindi: 'खाद, बीज, कीटनाशक और सिंचाई के लिए समय पर आसान एवं सस्ता ऋण।',
    eligibilityHindi: [
      'सभी किसान (व्यक्तिगत या संयुक्त खातेदार)',
      'पट्टेदार किसान, बटाईदार और मौखिक पट्टेदार',
      'स्वयं सहायता समूह (SHG) और संयुक्त देयता समूह (JLG)'
    ],
    documentsHindi: [
      'पासपोर्ट फोटो के साथ भरा हुआ KCC आवेदन पत्र',
      'राजस्व प्राधिकारी द्वारा प्रमाणित भू-अभिलेख',
      'आधार कार्ड और पैन कार्ड',
      'नजदीकी ग्रामीण/सहकारी बैंक से अनापत्ति प्रमाण पत्र (No Dues)'
    ],
    applicationRouteHindi: 'किसी भी राष्ट्रीयकृत, सहकारी या ग्रामीण बैंक शाखा में जाएं, या SBI YONO Krishi से ऑनलाइन आवेदन करें।',
    tailoredStatusHindi: 'सक्रिय सुविधा (Active Access)',
  }
};
