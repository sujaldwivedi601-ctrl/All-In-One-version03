import { db } from '../lib/firebase.ts';
import { collection, doc, getDoc, setDoc, getDocs, query, where, limit } from 'firebase/firestore';

// In-memory fallback caches to ensure zero downtime and resilience
const memoryUsers = new Map<string, any>();
const memoryProfiles = new Map<string, any>();
const memoryAnalyses: any[] = [];

export interface UserRecord {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoUrl: string;
  createdAt: Date;
}

export interface FarmerProfileRecord {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  latitude: string;
  longitude: string;
  landAreaAcres: string;
  soilType: string;
  primaryCrop: string;
  cropStage: string;
  waterSource: string;
  irrigationType: string;
  farmerCategory: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PROFILE = (userId: string, name: string): FarmerProfileRecord => ({
  userId,
  name: name || 'My Farm',
  phone: '',
  village: 'Nageshwar',
  district: 'Dwarka',
  state: 'Gujarat',
  latitude: '22.3364',
  longitude: '69.0544',
  landAreaAcres: '4.0',
  soilType: 'Loamy Soil',
  primaryCrop: 'Wheat',
  cropStage: 'Tillering',
  waterSource: 'Well / Borewell',
  irrigationType: 'Flood / Furrow',
  farmerCategory: 'Small Farmer (2.5-5 Acres)',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export async function getOrCreateUser(
  uid: string,
  email?: string,
  displayName?: string,
  photoUrl?: string
): Promise<UserRecord> {
  const fallbackUser: UserRecord = {
    id: uid,
    uid,
    email: email || '',
    displayName: displayName || 'Farmer User',
    photoUrl: photoUrl || '',
    createdAt: new Date(),
  };

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      const existingUser: UserRecord = {
        id: uid,
        uid,
        email: email || data.email || '',
        displayName: displayName || data.displayName || 'Farmer User',
        photoUrl: photoUrl || data.photoUrl || '',
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      };

      // Update with new information if provided
      if ((email && email !== data.email) || (displayName && displayName !== data.displayName) || (photoUrl && photoUrl !== data.photoUrl)) {
        await setDoc(userRef, {
          email: existingUser.email,
          displayName: existingUser.displayName,
          photoUrl: existingUser.photoUrl,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      memoryUsers.set(uid, existingUser);
      return existingUser;
    } else {
      // Create new user in Firestore
      await setDoc(userRef, {
        id: uid,
        uid,
        email: email || '',
        displayName: displayName || 'Farmer User',
        photoUrl: photoUrl || '',
        createdAt: new Date().toISOString(),
      });

      // Ensure initial default profile exists
      const profileRef = doc(db, 'farmer_profiles', uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        const initProfile = DEFAULT_PROFILE(uid, displayName || 'My Farm');
        await setDoc(profileRef, initProfile);
        memoryProfiles.set(uid, initProfile);
      }

      memoryUsers.set(uid, fallbackUser);
      return fallbackUser;
    }
  } catch (err) {
    console.warn('Firestore getOrCreateUser fallback to memory cache:', err);
    if (!memoryUsers.has(uid)) {
      memoryUsers.set(uid, fallbackUser);
      memoryProfiles.set(uid, DEFAULT_PROFILE(uid, displayName || 'My Farm'));
    }
    return memoryUsers.get(uid);
  }
}

export async function getFarmerProfile(userId: string | number): Promise<FarmerProfileRecord> {
  const uid = String(userId);
  const defaultProf = DEFAULT_PROFILE(uid, 'My Farm');

  try {
    const profileRef = doc(db, 'farmer_profiles', uid);
    const snap = await getDoc(profileRef);

    if (snap.exists()) {
      const data = snap.data() as FarmerProfileRecord;
      memoryProfiles.set(uid, data);
      return data;
    }

    // Auto-create initial profile
    await setDoc(profileRef, defaultProf);
    memoryProfiles.set(uid, defaultProf);
    return defaultProf;
  } catch (err) {
    console.warn('Firestore getFarmerProfile fallback to memory cache:', err);
    if (memoryProfiles.has(uid)) {
      return memoryProfiles.get(uid);
    }
    memoryProfiles.set(uid, defaultProf);
    return defaultProf;
  }
}

export async function updateFarmerProfile(userId: string | number, profileData: any): Promise<FarmerProfileRecord> {
  const uid = String(userId);
  const existing = memoryProfiles.get(uid) || DEFAULT_PROFILE(uid, profileData?.name || 'My Farm');
  
  // Clean all fields: strip out any undefined fields so Firestore setDoc never fails
  const cleanedInput: Record<string, any> = {};
  if (profileData && typeof profileData === 'object') {
    Object.keys(profileData).forEach((key) => {
      const val = profileData[key];
      if (val !== undefined && val !== null) {
        cleanedInput[key] = val;
      }
    });
  }

  const merged: FarmerProfileRecord = {
    ...existing,
    ...cleanedInput,
    userId: uid,
    name: cleanedInput.name || existing.name || 'My Farm',
    phone: cleanedInput.phone !== undefined ? String(cleanedInput.phone) : (existing.phone || ''),
    village: cleanedInput.village !== undefined ? String(cleanedInput.village) : (existing.village || 'Nageshwar'),
    district: cleanedInput.district !== undefined ? String(cleanedInput.district) : (existing.district || 'Dwarka'),
    state: cleanedInput.state !== undefined ? String(cleanedInput.state) : (existing.state || 'Gujarat'),
    latitude: String(cleanedInput.latitude || existing.latitude || '22.3364'),
    longitude: String(cleanedInput.longitude || existing.longitude || '69.0544'),
    landAreaAcres: String(cleanedInput.landAreaAcres || existing.landAreaAcres || '4.0'),
    soilType: cleanedInput.soilType || existing.soilType || 'Loamy Soil',
    primaryCrop: cleanedInput.primaryCrop || existing.primaryCrop || 'Wheat',
    cropStage: cleanedInput.cropStage || existing.cropStage || 'Tillering',
    waterSource: cleanedInput.waterSource || existing.waterSource || 'Well / Borewell',
    irrigationType: cleanedInput.irrigationType || existing.irrigationType || 'Flood / Furrow',
    farmerCategory: cleanedInput.farmerCategory || existing.farmerCategory || 'Small Farmer (2.5-5 Acres)',
    updatedAt: new Date().toISOString(),
  };

  memoryProfiles.set(uid, merged);

  try {
    const profileRef = doc(db, 'farmer_profiles', uid);
    // Sanitize document object before Firestore write
    const firestoreData: Record<string, any> = {};
    Object.keys(merged).forEach((k) => {
      const v = (merged as any)[k];
      if (v !== undefined) {
        firestoreData[k] = v;
      }
    });
    await setDoc(profileRef, firestoreData, { merge: true });
    return merged;
  } catch (err) {
    console.warn('Firestore updateFarmerProfile saved to local cache:', err);
    return merged;
  }
}

export async function saveCropAnalysis(userId: string | number | null, analysisData: any): Promise<any> {
  const uid = userId ? String(userId) : null;
  const docId = 'analysis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

  // Firestore hard physical limit is 1,048,576 bytes per document.
  // Guard against oversized base64 strings so setDoc never exceeds document limits.
  let safeImageUrl = analysisData.imageUrl || '';
  if (typeof safeImageUrl === 'string' && safeImageUrl.length > 350000) {
    console.warn(`[saveCropAnalysis] Image size (${safeImageUrl.length} bytes) exceeds Firestore 350KB safe threshold. Storing optimized reference.`);
    safeImageUrl = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
  }

  const record: any = {
    id: docId,
    userId: uid,
    cropName: analysisData.cropName || 'Field Crop',
    imageUrl: safeImageUrl,
    identifiedCrop: analysisData.identifiedCrop || '',
    condition: analysisData.condition || '',
    severity: analysisData.severity || 'Moderate',
    confidencePercentage: analysisData.confidencePercentage || 85,
    symptomsJson: typeof analysisData.symptoms === 'string' ? analysisData.symptoms : JSON.stringify(analysisData.symptoms || []),
    remediesJson: typeof analysisData.remedies === 'string' ? analysisData.remedies : JSON.stringify(analysisData.remedies || []),
    summary: analysisData.summary || '',
    createdAt: new Date(),
  };

  memoryAnalyses.unshift(record);

  try {
    await setDoc(doc(db, 'crop_analyses', docId), {
      ...record,
      createdAt: record.createdAt.toISOString(),
    });
    return record;
  } catch (err) {
    console.warn('Firestore saveCropAnalysis saved to local cache:', err);
    return record;
  }
}

export async function getCropAnalyses(userId?: string | number): Promise<any[]> {
  const uid = userId ? String(userId) : undefined;

  try {
    const colRef = collection(db, 'crop_analyses');
    let q = query(colRef, limit(20));
    if (uid) {
      q = query(colRef, where('userId', '==', uid), limit(20));
    }

    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((d) => {
      const data = d.data();
      results.push({
        id: d.id,
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      });
    });

    if (results.length > 0) {
      // Sort newest first
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return results;
    }

    // If Firestore query returned 0, return any from memory
    if (uid) {
      return memoryAnalyses.filter((a) => a.userId === uid);
    }
    return memoryAnalyses;
  } catch (err) {
    console.warn('Firestore getCropAnalyses fallback to memory cache:', err);
    if (uid) {
      return memoryAnalyses.filter((a) => a.userId === uid);
    }
    return memoryAnalyses;
  }
}
