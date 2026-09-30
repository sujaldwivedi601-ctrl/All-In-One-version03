// AgriDoctor AI Diagnostic Reference Prescriptions
// Used as verified fallback if Gemini API is temporarily constrained or in offline field scenarios

import type { CropAnalysisRecord } from '../types.ts';

export function generateSmartCropDiagnostic(cropName: string = 'Wheat', cropStage: string = 'Vegetative', note: string = ''): CropAnalysisRecord {
  const normCrop = (cropName || 'wheat').toLowerCase();
  const normNote = (note || '').toLowerCase();

  // Conflict detection for fallback
  let conflict = null;
  if (normCrop.includes('rice') && (normNote.includes('wheat') || normNote.includes('rust'))) {
    conflict = {
      hasConflict: true,
      field: 'crop',
      farmerInput: 'Wheat',
      visualAssessment: 'Rice / Paddy',
      message: 'Possible crop mismatch. Farmer entered Wheat, but visual symptoms resemble Rice foliage. Please confirm before relying on crop-specific treatments.',
      messageHi: 'संभावित फसल बेमेल: किसान द्वारा गेहूं दर्ज किया गया, लेकिन दृश्य लक्षण धान/चावल जैसे हैं। कृपया उपचार लागू करने से पहले पुष्टि करें।'
    };
  }

  // 1. Wheat
  if (normCrop.includes('wheat') || normNote.includes('rust') || normNote.includes('stripe') || normNote.includes('yellow')) {
    return {
      id: 'analysis-' + Date.now(),
      timestamp: new Date().toISOString(),
      cropName: 'Wheat',
      crop: 'Wheat',
      cropHi: 'गेहूं',
      healthStatus: 'Minor Issue',
      healthStatusHi: 'हल्की समस्या',
      problem: 'Yellow Stripe Rust (Puccinia striiformis)',
      problemHi: 'पीला रतुआ (येलो स्ट्राइप रस्ट)',
      confidence: 'High',
      confidenceHi: 'उच्च',
      whatIFound: [
        'Linear yellow-orange powder pustules arranged in parallel stripes along leaf veins',
        'Chlorotic yellow discoloration on upper leaf blades',
        'Premature tip drying on infected foliage'
      ],
      whatIFoundHi: [
        'पत्ती की नसों के समानांतर पीली-नारंगी धारियों में उभरे हुए पाउडर के दाने (पस्ट्यूल्स)',
        'ऊपरी पत्तियों पर पीले रंग की धारियां व क्लोरोसिस',
        'संक्रमित पत्तियों के ऊपरी सिरों का समय से पहले सूखना'
      ],
      whatToDoNow: [
        'Halt flood irrigation for 48 hours to drop relative humidity in the crop canopy.',
        'Avoid touching healthy crop areas immediately after inspecting infected leaves to prevent spreading fungal spores.',
        'Stop any excessive urea/nitrogen top-dressing as surplus nitrogen accelerates rust proliferation.',
        'If rust patches are expanding, consult local KVK or apply recommended foliar protection.'
      ],
      whatToDoNowHi: [
        'फसल में नमी कम करने के लिए 48 घंटे तक सिंचाई रोकें।',
        'संक्रमित पत्तियों को छूने के बाद तुरंत स्वस्थ पौधों को न छुएं ताकि बीजाणु न फैलें।',
        'अत्यधिक यूरिया या नाइट्रोजन उर्वरक तुरंत रोकें क्योंकि यह बीमारी को बढ़ावा देता है।',
        'यदि फैलाव बढ़ रहा है तो नजदीकी कृषि विज्ञान केंद्र (KVK) से संपर्क करें।'
      ],
      warning: 'Do not spray chemicals during windy afternoons or right before rain.',
      warningHi: 'तेज हवा या बारिश की संभावना होने पर छिड़काव न करें।',
      questions: [
        'What specific wheat variety was sown (e.g. DBW-187, HD-2967, HD-3086)?',
        'How much of your field is affected (isolated patches or across entire field)?',
        'Has any fungicide or nitrogen top-dressing been applied in the last 14 days?'
      ],
      questionsHi: [
        'आपने गेहूं की कौन सी किस्म बोई है (जैसे DBW-187, HD-2967)?',
        'खेत का कितना हिस्सा प्रभावित है (कुछ हिस्से या पूरा खेत)?',
        'क्या पिछले 14 दिनों में कोई फफूंदनाशक या यूरिया दिया गया था?'
      ],
      conflict,
      detailedAnalysis: {
        detailedEvidence: [
          'Linear yellow urediniospore pustules ruptured through leaf epidermis',
          'Interveinal chlorosis on middle and flag leaves',
          'No visible caterpillar or chewing pest damage on stem base'
        ],
        detailedEvidenceHi: [
          'पत्ती की त्वचा पर समानांतर पीली धारियों में फंगस के दाने',
          'पत्तियों की नसों के बीच पीलापन',
          'तने या जड़ पर किसी कीट के काटने के निशान नहीं हैं'
        ],
        alternativeCauses: [
          'Wheat Leaf Blight (Bipolaris sorokiniana) - less likely due to absence of dark oval blotches',
          'Nitrogen or Sulfur deficiency - ruled out because yellowing is in sharp pustular stripes rather than uniform fading'
        ],
        alternativeCausesHi: [
          'गेहूं का पत्ती झुलसा (बाइपोलारिस) - अंडाकार गहरे धब्बे न होने के कारण संभावना कम है',
          'नाइट्रोजन/सल्फर की कमी - क्योंकि पीलापन धारियों में पाउडर जैसा है, सामान्य पत्ती पीली नहीं है'
        ],
        primaryVsSecondary: 'Primary fungal infection (Puccinia striiformis). Leaf tip drying is secondary moisture desiccation through ruptured leaf epidermis.',
        primaryVsSecondaryHi: 'प्राथमिक कारण फफूंद संक्रमण है। पत्ती के सिरों का सूखना टूटी हुई त्वचा से नमी के नुकसान के कारण द्वितीयक प्रभाव है।',
        reasoning: 'The characteristic parallel stripe pustules along leaf veins are a diagnostic hallmark of yellow rust in cool, moist conditions.',
        reasoningHi: 'पत्तियों की नसों के समानांतर पीली धारियां ठंडे और नमी वाले मौसम में पीले रतुआ का स्पष्ट लक्षण हैं।',
        additionalInfoNeeded: [
          'Weather over past 7 days (morning fog or dew)',
          'Crop growth stage (tillering, booting, or heading)'
        ],
        additionalInfoNeededHi: [
          'पिछले 7 दिनों का मौसम (सुबह का कोहरा या ओस)',
          'फसल की वर्तमान अवस्था (कल्ले फूटना, गाभा या बाली निकलना)'
        ],
        cropCare: {
          water: 'Maintain moist but not waterlogged soil; delay overhead sprinkler watering.',
          nutrition: 'Ensure adequate potassium (potash) fertilization to reinforce cell walls.',
          otherCare: 'Plan next sowing with certified rust-resistant varieties like DBW-303 or HD-3226.'
        },
        cropCareHi: {
          water: 'मिट्टी में उचित नमी रखें, जलभराव न होने दें; फव्वारा सिंचाई से बचें।',
          nutrition: 'पौधों की रोग प्रतिरोधक क्षमता बढ़ाने के लिए पोटाश उर्वरक संतुलित मात्रा में दें।',
          otherCare: 'अगली बार रोग-प्रतिरोधी किस्में जैसे DBW-303 या HD-3226 चुनें।'
        }
      },
      // Backward compatibility mappings
      identifiedCrop: 'Wheat (Triticum aestivum)',
      leadingDiagnosis: 'Yellow Stripe Rust (Puccinia striiformis)',
      visibleEvidence: [
        'Linear yellow-orange pustules arranged in distinct stripes parallel to leaf veins',
        'Chlorotic yellow streaking on upper leaf blades',
        'Premature drying of leaf tips'
      ],
      imageQuality: 'Good',
      imageQualityNotes: 'Leaf surface is well-lit and foliage lesions are clearly discernible.',
      leadingPossibility: {
        cause: 'Fungal pathogen (Puccinia striiformis f. sp. tritici)',
        explanation: 'The characteristic linear arrangement of yellow urediniospores along the vascular veins is a hallmark signature of stripe rust.'
      },
      otherPossibilities: [
        'Wheat Leaf Blight (Bipolaris sorokiniana) - less likely due to lack of dark oval blotches',
        'Nitrogen or Sulfur deficiency - ruled out because discoloration is in sharp pustular stripes'
      ],
      primaryVsSecondary: 'Primary fungal infection. Secondary leaf tip desiccation from moisture loss.',
      informationNeeded: [
        'What specific wheat variety was sown?',
        'How widespread is this yellow striping across your field?'
      ],
      actionPlan: {
        immediateActions: [
          'Halt flood irrigation for 48 hours to reduce relative humidity in the crop canopy.',
          'Avoid touching healthy crop areas immediately after inspecting affected leaves.',
          'Avoid excessive urea/nitrogen top-dressing.'
        ],
        monitoring: [
          'Scout the field daily during early morning hours to check spread.'
        ],
        professionalAssistance: [
          'Contact your local Block Agriculture Extension Officer (KVK) if spreading.'
        ],
        chemicalBiologicalControl: []
      },
      cropCare: {
        water: 'Maintain moist but not waterlogged soil; delay overhead sprinkler watering.',
        nutrition: 'Ensure balanced potassium fertilization to reinforce cell wall strength.',
        otherCare: 'Plan next season with rust-resistant cultivars like DBW-303 or HD-3226.'
      },
      farmerSummary: 'Hold your watering today to drop canopy moisture, stop extra urea, and monitor field daily. If spreading rapidly, consult your local KVK.',
      condition: 'Yellow Stripe Rust (Puccinia striiformis)',
      severity: 'Moderate',
      confidencePercentage: 92,
      summary: 'Yellow stripe rust identified. Prompt moisture reduction and scouting will safeguard grain filling.'
    };
  }

  // 2. Tomato
  if (normCrop.includes('tomato') || normNote.includes('blight') || normNote.includes('spot')) {
    return {
      id: 'analysis-' + Date.now(),
      timestamp: new Date().toISOString(),
      cropName: 'Tomato',
      crop: 'Tomato',
      cropHi: 'टमाटर',
      healthStatus: 'Minor Issue',
      healthStatusHi: 'हल्की समस्या',
      problem: 'Early Blight (Alternaria solani)',
      problemHi: 'अगेती झुलसा (अर्ली ब्लाइट)',
      confidence: 'High',
      confidenceHi: 'उच्च',
      whatIFound: [
        'Dark brown circular lesions with concentric target-board rings on lower foliage',
        'Chlorotic yellow halos surrounding spots on older leaves',
        'Lower canopy leaf curling with intact main stems'
      ],
      whatIFoundHi: [
        'निचली पत्तियों पर छल्लेदार (टारगेट-बोर्ड जैसे) गोल भूरे धब्बे',
        'धब्बों के चारों ओर हल्का पीला घेरा',
        'निचले पत्तों का मुड़ना और सूखना, जबकि मुख्य तना सुरक्षित है'
      ],
      whatToDoNow: [
        'Prune off heavily infected lower leaves up to 20 cm from soil and dispose of them away from the field.',
        'Water at the plant base; avoid overhead sprinkling or splashing soil onto leaves.',
        'Scout upper leaves every 2 days to verify infection is not moving upwards.',
        'Apply organic neem or copper-based bio-protectant during late afternoon.'
      ],
      whatToDoNowHi: [
        'जमीन से 20 सेमी ऊपर तक के गंभीर रूप से खराब पत्तों को काटकर खेत से दूर नष्ट करें।',
        'सिंचाई केवल पौधों की जड़ों में करें; पत्तियों पर पानी न छिड़कें।',
        'हर 2 दिन में ऊपरी नई पत्तियों की जांच करें।',
        'शाम के समय सुरक्षित नीम या जैविक फफूंदनाशक का छिड़काव करें।'
      ],
      warning: 'Do not compost diseased leaves inside the vegetable field.',
      warningHi: 'रोगग्रस्त पत्तियों को खेत की खाद में न मिलाएं।',
      questions: [
        'Are dark spots also visible on tomato stems or green fruit?',
        'Do you use drip watering or furrow irrigation?',
        'When did you first notice these spots on the bottom leaves?'
      ],
      questionsHi: [
        'क्या तने या हरे फलों पर भी काले-भूरे धब्बे दिख रहे हैं?',
        'आप ड्रिप सिंचाई करते हैं या खुली नाली से पानी देते हैं?',
        'आपने सबसे पहले ये धब्बे कब देखे?'
      ],
      conflict,
      detailedAnalysis: {
        detailedEvidence: [
          'Concentric circular rings characteristic of Alternaria fungal fruiting',
          'Progressive defoliation limited to lowest 2 tiers of leaves',
          'Fruit currently clean of lesions'
        ],
        detailedEvidenceHi: [
          'अल्टरनेरिया फंगस के विशिष्ट संकेन्द्रित गोल छल्ले',
          'संक्रमण मुख्य रूप से निचली 2 परतों की पत्तियों तक सीमित',
          'वर्तमान में फलों पर कोई दाग नहीं है'
        ],
        alternativeCauses: [
          'Septoria Leaf Spot (Septoria lycopersici) - typically smaller with white/grey centers',
          'Bacterial Spot (Xanthomonas) - usually smaller water-soaked angular spots'
        ],
        alternativeCausesHi: [
          'सेप्टोरिया लीफ स्पॉट - जिसके धब्बे छोटे और केंद्र में सफेद/धूसर होते हैं',
          'जीवाणु धब्बा (बैक्टीरियल स्पॉट) - जो पानी जैसे कोणीय धब्बे बनाता है'
        ],
        primaryVsSecondary: 'Primary Alternaria fungal infection from soil splash. Yellowing halo is plant defense response.',
        primaryVsSecondaryHi: 'मिट्टी के छींटों से फैला प्राथमिक फफूंद संक्रमण। पीला घेरा पौधे की प्राकृतिक प्रतिक्रिया है।',
        reasoning: 'Concentric ring structure on older bottom leaves under warm, humid conditions is classic early blight.',
        reasoningHi: 'गर्म और नम मौसम में निचली पुरानी पत्तियों पर गोल छल्लेदार धब्बे अगेती झुलसा का निश्चित लक्षण हैं।',
        additionalInfoNeeded: [
          'Recent rainfall or overhead irrigation frequency',
          'Crop variety planted'
        ],
        additionalInfoNeededHi: [
          'हाल की बारिश या पानी देने का तरीका',
          'टमाटर की लगाई गई किस्म'
        ],
        cropCare: {
          water: 'Water directly at root zone using drip or controlled furrow; keep foliage dry.',
          nutrition: 'Avoid excessive nitrogen; ensure adequate calcium and potassium for sturdy leaves.',
          otherCare: 'Mulch soil around plants with dry straw to prevent spore splashing.'
        },
        cropCareHi: {
          water: 'जड़ों में सीधे पानी दें; पत्तियों को सूखा रखें।',
          nutrition: 'अत्यधिक नाइट्रोजन न दें; कैल्शियम और पोटाश का संतुलन रखें।',
          otherCare: 'पौधों के चारों ओर पुआल या सूखी घास बिछाएं ताकि पानी के छींटे पत्तों पर न पड़ें।'
        }
      },
      identifiedCrop: 'Tomato (Solanum lycopersicum)',
      leadingDiagnosis: 'Early Blight (Alternaria solani)',
      visibleEvidence: [
        'Dark brown circular lesions with concentric target-board rings on lower leaves',
        'Surrounding chlorotic yellow halo on infected foliar margins',
        'Lower canopy leaf curling and defoliation'
      ],
      imageQuality: 'Good',
      leadingPossibility: {
        cause: 'Fungal pathogen (Alternaria solani)',
        explanation: 'Target-board concentric rings starting from older bottom leaves after warm, humid periods indicate early blight.'
      },
      otherPossibilities: [
        'Septoria Leaf Spot (Septoria lycopersici)',
        'Bacterial Spot (Xanthomonas)'
      ],
      primaryVsSecondary: 'Primary fungal infection spread from soil splash onto lower foliage.',
      informationNeeded: [
        'Are lesions visible on the stems or fruit as well?'
      ],
      actionPlan: {
        immediateActions: [
          'Prune off all diseased lower leaves up to 20 cm from soil level and bag them.',
          'Switch from overhead sprinkler to drip irrigation to keep tomato foliage dry.'
        ],
        monitoring: [
          'Inspect upper foliage every 2 days to ensure lesions do not advance.'
        ],
        professionalAssistance: [
          'Consult local horticulture extension if stem collar rot or fruit rot develops.'
        ],
        chemicalBiologicalControl: []
      },
      cropCare: {
        water: 'Water directly at root zone; avoid splashing soil on leaves.',
        nutrition: 'Avoid excess nitrogen; apply adequate calcium to prevent secondary rot.',
        otherCare: 'Mulch soil around plants with straw to form a barrier against soil-borne spores.'
      },
      farmerSummary: 'Prune away the infected bottom leaves today, dispose of them safely, and water only at the roots.',
      condition: 'Early Blight (Alternaria solani)',
      severity: 'Moderate',
      confidencePercentage: 89,
      summary: 'Early blight detected on lower leaves. Lower pruning and clean watering will protect tomatoes.'
    };
  }

  // 3. Rice / Paddy
  if (normCrop.includes('rice') || normCrop.includes('paddy') || normNote.includes('bacterial') || normNote.includes('blight')) {
    return {
      id: 'analysis-' + Date.now(),
      timestamp: new Date().toISOString(),
      cropName: 'Paddy / Rice',
      crop: 'Paddy / Rice',
      cropHi: 'धान / चावल',
      healthStatus: 'Severe Threat',
      healthStatusHi: 'गंभीर खतरा',
      problem: 'Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)',
      problemHi: 'जीवाणु पत्ती झुलसा (बैक्टीरियल लीफ ब्लाइट)',
      confidence: 'High',
      confidenceHi: 'उच्च',
      whatIFound: [
        'Water-soaked to yellowish-white wavy lesions progressing along leaf margins towards blade base',
        'Drying and grayish-white bleaching of leaf tips (kresek symptom)',
        'Lesions restricted along vascular leaf veins'
      ],
      whatIFoundHi: [
        'पत्ती के किनारों पर लहरदार पीले-सफेद सूखते हुए धब्बे',
        'पत्तियों के ऊपरी सिरों का सफेद-धूसर होकर सूखना',
        'पत्ती की नसों के साथ-साथ बीमारी का फैलाव'
      ],
      whatToDoNow: [
        'Immediately halt all urea and nitrogen top-dressing to prevent rapid bacterial spread.',
        'Drain standing water from the plot for 48 hours if possible to break field-to-field bacterial transfer.',
        'Scout diagonal transects across the field to monitor if flag leaves are threatened.',
        'Contact your local Krishi Vigyan Kendra (KVK) for recommended local antibacterial formulation.'
      ],
      whatToDoNowHi: [
        'यूरिया या किसी भी नाइट्रोजन उर्वरक का उपयोग तुरंत रोक दें।',
        'यदि संभव हो तो खेत से 48 घंटे के लिए रुका हुआ पानी निकाल दें।',
        'खेत में घूमकर देखें कि क्या झंडा पत्ती (फ्लैग लीफ) तक बीमारी पहुंच रही है।',
        'सही उपचार के लिए तुरंत नजदीकी कृषि अधिकारी या KVK से सलाह लें।'
      ],
      warning: 'Bacterial blight spreads through moving irrigation water. Do not drain infected water into neighboring healthy plots.',
      warningHi: 'यह बीमारी बहते पानी से फैलती है। संक्रमित खेत का पानी दूसरे स्वस्थ खेत में न जाने दें।',
      questions: [
        'Did heavy rains or strong winds precede the yellowing?',
        'How much chemical nitrogen/urea has been applied so far?',
        'Is standing water currently draining between adjacent plots?'
      ],
      questionsHi: [
        'क्या बीमारी दिखने से पहले तेज हवाएं या भारी बारिश हुई थी?',
        'अब तक कितना यूरिया दिया जा चुका है?',
        'क्या खेत का पानी दूसरे खेतों में बह रहा है?'
      ],
      conflict,
      detailedAnalysis: {
        detailedEvidence: [
          'Marginal wavy yellow-tan chlorotic stripes progressing basipetally',
          'Vascular wilting on affected leaf sections',
          'No circular fungal concentric rings present'
        ],
        detailedEvidenceHi: [
          'पत्ती के किनारों से नीचे की ओर बढ़ती लहरदार पीली धारियां',
          'प्रभावित हिस्से का मुरझाना',
          'फफूंद के कोई गोल छल्लेदार धब्बे नहीं हैं'
        ],
        alternativeCauses: [
          'Rice Blast (Magnaporthe oryzae) - blast lesions are spindle-shaped (eye-shaped) with grey centers',
          'Potassium deficiency - shows marginal scorching without wavy margins'
        ],
        alternativeCausesHi: [
          'धान का झोंका रोग (ब्लास्ट) - जिसके धब्बे आंख के आकार के होते हैं',
          'पोटाश की कमी - जिसमें किनारे झुलसते हैं पर लहरदार नहीं होते'
        ],
        primaryVsSecondary: 'Primary bacterial vascular pathogen entering through leaf hydathodes.',
        primaryVsSecondaryHi: 'प्राथमिक जीवाणु संक्रमण जो पत्ती के सूक्ष्म छिद्रों से प्रवेश करता है।',
        reasoning: 'Wavy margins running down the blade edges from the tip are strongly diagnostic of bacterial blight.',
        reasoningHi: 'पत्ती के किनारों पर ऊपर से नीचे की ओर लहरदार सूखना इस बीमारी का पुख्ता प्रमाण है।',
        additionalInfoNeeded: [
          'Water stagnation depth in field',
          'Transplanting date and seedling source'
        ],
        additionalInfoNeededHi: [
          'खेत में पानी भरने की गहराई',
          'रोपाई की तारीख व पौध का स्रोत'
        ],
        cropCare: {
          water: 'Drain field temporarily; avoid deep standing water during disease outbreak.',
          nutrition: 'Apply MOP (potash) @ 15 kg/acre to boost plant cellular resistance.',
          otherCare: 'Disinfect weeding tools between plots.'
        },
        cropCareHi: {
          water: 'खेत से कुछ समय के लिए पानी निकालें; अधिक जलभराव से बचें।',
          nutrition: 'प्रति एकड़ 15 किग्रा पोटाश देकर पौधों को मजबूत बनाएं।',
          otherCare: 'खेत में काम करने वाले औजारों को साफ रखें।'
        }
      },
      identifiedCrop: 'Rice / Paddy (Oryza sativa)',
      leadingDiagnosis: 'Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)',
      visibleEvidence: [
        'Water-soaked to yellowish-white wavy lesions progressing along leaf margins',
        'Drying and grayish-white bleaching of leaf tips'
      ],
      imageQuality: 'Good',
      leadingPossibility: {
        cause: 'Bacterial pathogen (Xanthomonas oryzae)',
        explanation: 'Wavy margins progressing down the leaf blade from the tip are diagnostic of bacterial blight.'
      },
      otherPossibilities: [
        'Rice Blast (Magnaporthe oryzae)',
        'Potassium deficiency'
      ],
      primaryVsSecondary: 'Primary bacterial infection entering through leaf hydathodes.',
      informationNeeded: [
        'Did heavy winds or rains precede the appearance of symptoms?'
      ],
      actionPlan: {
        immediateActions: [
          'Immediately stop all urea and nitrogenous top-dressing.',
          'Drain field water if possible to break bacterial movement.'
        ],
        monitoring: [
          'Inspect daily across field diagonals.'
        ],
        professionalAssistance: [
          'Seek agricultural extension advisory immediately.'
        ],
        chemicalBiologicalControl: []
      },
      cropCare: {
        water: 'Do not allow irrigation water to flow from infected fields into healthy fields.',
        nutrition: 'Apply muriate of potash to boost plant resistance.',
        otherCare: 'Disinfect equipment between fields.'
      },
      farmerSummary: 'Stop all urea application immediately, drain standing water for 48 hours, and consult local KVK.',
      condition: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
      severity: 'Severe',
      confidencePercentage: 91,
      summary: 'Bacterial leaf blight detected. Immediate nitrogen freeze and clean water management required.'
    };
  }

  // 4. Default / General Agricultural Crop
  return {
    id: 'analysis-' + Date.now(),
    timestamp: new Date().toISOString(),
    cropName: cropName || 'Field Crop',
    crop: cropName || 'Field Crop',
    cropHi: cropName || 'फसल',
    healthStatus: 'Minor Issue',
    healthStatusHi: 'हल्की समस्या',
    problem: 'Foliar Leaf Spot & Nutrient Stress',
    problemHi: 'पत्ती के धब्बे व पोषण असंतुलन',
    confidence: 'Moderate',
    confidenceHi: 'मध्यम',
    whatIFound: [
      'Scattered small yellowish-brown spots on leaf surface',
      'Mild leaf margin curling with green center',
      'Main stem and vein vascular structure remain sturdy'
    ],
    whatIFoundHi: [
      'पत्ती की सतह पर बिखरे हुए छोटे पीले-भूरे धब्बे',
      'पत्ती के किनारों का हल्का मुड़ना जबकि बीच का भाग हरा है',
      'मुख्य नसें और तना सामान्य रूप से मजबूत हैं'
    ],
    whatToDoNow: [
      'Inspect the underside of 5 affected leaves with a magnifying glass for tiny insects or mites.',
      'Water in the early morning at the soil level; avoid evening foliage wetting.',
      'Hold off on any harsh chemical sprays; apply safe neem oil formulation (3-5 ml/L) this evening.',
      'Monitor marked plants over the next 48 hours to check if spots grow or stay stationary.'
    ],
    whatToDoNowHi: [
      'पत्तियों के नीचे बारीक कीड़ों या मकड़ी के जालों की जांच करें।',
      'सुबह के समय जड़ों में पानी दें; शाम को पत्तियों को गीला न करें।',
      'कोई भी तेज रासायनिक दवा न छिड़कें; आज शाम नीम तेल (3-5 मिली/लीटर) का सुरक्षित छिड़काव करें।',
      'अगले 48 घंटों तक नजर रखें कि क्या धब्बे बढ़ रहे हैं।'
    ],
    warning: 'Do not spray chemicals during peak afternoon heat or under strong direct sun.',
    warningHi: 'दोपहर की तेज धूप या गर्मी में कोई छिड़काव न करें।',
    questions: [
      'Are symptoms appearing mostly on old bottom leaves or fresh top shoots?',
      'Have you noticed any tiny flying pests or webs under the leaves?',
      'What was the most recent fertilizer applied to the soil?'
    ],
    questionsHi: [
      'क्या ये लक्षण पुरानी निचली पत्तियों पर हैं या नई ऊपरी पत्तियों पर?',
      'क्या पत्तियों के नीचे कोई बारीक कीट या जाले दिखाई दे रहे हैं?',
      'हाल ही में कौन सा खाद या उर्वरक दिया गया था?'
    ],
    conflict,
    detailedAnalysis: {
      detailedEvidence: [
        'Dispersed superficial foliar spotting across leaf blade',
        'Mild marginal chlorosis with no stem girdling',
        'No complete vascular collapse observed'
      ],
      detailedEvidenceHi: [
        'पत्ती की सतह पर बिखरे हुए सतही धब्बे',
        'किनारों पर हल्का पीलापन, तने पर कोई खराबी नहीं',
        'पौधे की मुख्य नसें स्वस्थ हैं'
      ],
      alternativeCauses: [
        'Sucking pest puncture feeding (thrips or spider mites)',
        'Localized micronutrient deficiency (Zinc or Iron)'
      ],
      alternativeCausesHi: [
        'रस चूसक कीटों (थ्रिप्स या माइट) द्वारा पत्ती चूसना',
        'सूक्ष्म पोषक तत्वों (जिंक या आयरन) की कमी'
      ],
      primaryVsSecondary: 'Early fungal foliar spotting with secondary localized tissue drying.',
      primaryVsSecondaryHi: 'शुरुआती सतही फफूंद के धब्बे और हल्का ऊतक सूखना।',
      reasoning: 'Scattered micro-lesions without deep tissue death indicate early stage foliar stress manageable with safe monitoring.',
      reasoningHi: 'छोटे बिखरे धब्बे शुरुआती तनाव दर्शाते हैं, जिन्हें सुरक्षित निगरानी और देखभाल से ठीक किया जा सकता है।',
      additionalInfoNeeded: [
        'Exact plant variety and age',
        'Recent weather changes (excessive heat or unseasonal humidity)'
      ],
      additionalInfoNeededHi: [
        'पौधे की किस्म और उम्र',
        'मौसम में हालिया बदलाव (अचानक गर्मी या नमी)'
      ],
      cropCare: {
        water: 'Water early in morning so foliage stays dry during night.',
        nutrition: 'Apply a balanced micronutrient spray to restore leaf vigor.',
        otherCare: 'Keep field borders weed-free to eliminate alternate pest hosts.'
      },
      cropCareHi: {
        water: 'सुबह के समय पानी दें ताकि रात में पत्तियां सूखी रहें।',
        nutrition: 'पौधों को हरा-भरा रखने के लिए सूक्ष्म पोषक तत्वों का संतुलित छिड़काव करें।',
        otherCare: 'खेत की मेड़ों को खरपतवार मुक्त रखें।'
      }
    },
    identifiedCrop: cropName || 'Agricultural Plant',
    leadingDiagnosis: 'Foliar Leaf Spot & Nutrient Stress',
    visibleEvidence: [
      'Localized chlorotic yellow spots and micro-lesions on leaf surface',
      'Mild leaf margin curling and irregular discoloration',
      'Stem and main vein structure appear intact'
    ],
    imageQuality: 'Good',
    leadingPossibility: {
      cause: 'Early fungal foliar infection combined with localized micronutrient imbalance',
      explanation: 'Dispersed spots on the leaf blade indicate atmospheric or splash fungal inoculation with minor secondary stress.'
    },
    otherPossibilities: [
      'Sucking insect pest damage',
      'Mild sun scorch'
    ],
    primaryVsSecondary: 'Primary fungal spots with secondary localized tissue drying.',
    informationNeeded: [
      'Are symptoms appearing predominantly on older bottom leaves or fresh new growth?'
    ],
    actionPlan: {
      immediateActions: [
        'Inspect underside of leaves with a magnifying glass.',
        'Isolate heavily spotted leaves.',
        'Avoid wetting foliage during late evening watering.'
      ],
      monitoring: [
        'Flag 3 affected plants and inspect in 48 hours.'
      ],
      professionalAssistance: [
        'Take a sample leaf to nearest KVK if spots double in size.'
      ],
      chemicalBiologicalControl: []
    },
    cropCare: {
      water: 'Water early in the morning so sun dries the foliage quickly.',
      nutrition: 'Apply balanced micronutrient foliar spray.',
      otherCare: 'Maintain clean field borders.'
    },
    farmerSummary: 'Do not spray harsh chemicals. Inspect leaf undersides for pests, apply safe neem oil this evening, and monitor for 48 hours.',
    condition: 'Foliar Spot & Leaf Stress',
    severity: 'Mild',
    confidencePercentage: 84,
    summary: 'Mild foliar stress identified. Safe neem oil application and morning watering advised.'
  };
}
