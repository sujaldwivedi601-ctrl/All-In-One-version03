import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ShoppingBag, 
  Recycle, 
  MapPin, 
  Phone, 
  Filter, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  X,
  Lock,
  Camera,
  Upload,
  Image as ImageIcon,
  Wand2,
  Trash2,
  Check,
  Tag,
  AlertCircle,
  Database,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { MarketplaceListing, FarmerProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';

interface MarketplaceProps {
  profile: FarmerProfile | null;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  idToken: string | null;
}

const PRODUCE_IMAGE_PRESETS = [
  { label: '🌾 Straw Bales', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', category: 'Waste Exchange' },
  { label: '🚜 Tractor & Implements', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', category: 'Equipment' },
  { label: '💩 Organic Manure', url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80', category: 'Waste Exchange' },
  { label: '🌾 Wheat Harvest', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80', category: 'Produce' },
  { label: '🍚 Rice / Paddy', url: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80', category: 'Produce' },
  { label: '🍅 Fresh Vegetables', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', category: 'Produce' },
  { label: '🌱 Seeds & Saplings', url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80', category: 'Seeds & Inputs' },
  { label: '💧 Drip & Irrigation', url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80', category: 'Equipment' },
];

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  profile, 
  isLoggedIn, 
  onRequireLogin, 
  idToken 
}) => {
  const { user, getIdToken } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [distanceFilter, setDistanceFilter] = useState<string>('50');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [contactModalItem, setContactModalItem] = useState<MarketplaceListing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Listing Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Produce' | 'Equipment' | 'Waste Exchange' | 'Seeds & Inputs'>('Waste Exchange');
  const [newPrice, setNewPrice] = useState('');
  const [newUnit, setNewUnit] = useState('per Quintal');
  const [newQuantity, setNewQuantity] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState(profile?.phone || '');
  
  // Image state
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [isMatchingAIImage, setIsMatchingAIImage] = useState<boolean>(false);
  const [aiMatchSuccessNotice, setAiMatchSuccessNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync phone from profile if it becomes available
  useEffect(() => {
    if (profile?.phone && !newSellerPhone) {
      setNewSellerPhone(profile.phone);
    }
  }, [profile]);

  // Connect and load all products directly from Firestore Database with real-time sync
  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, 'marketplace_listings');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const fetched: MarketplaceListing[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetched.push({
            id: docSnap.id,
            title: data.title || 'Untitled Produce',
            category: data.category || 'Produce',
            sellerName: data.sellerName || 'Local Farmer',
            sellerPhone: data.sellerPhone || '',
            sellerVillage: data.sellerVillage || 'Local Village',
            distanceKm: typeof data.distanceKm === 'number' ? data.distanceKm : 5,
            price: data.price || 'Negotiable',
            quantity: data.quantity || '1 Lot',
            imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
            tags: Array.isArray(data.tags) ? data.tags : ['Verified Farmer'],
            description: data.description || '',
            ownerId: data.ownerId || '',
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });

        // Sort by newest first
        fetched.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        setListings(fetched);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore marketplace onSnapshot error:', error);
        // Fallback fetch from API route
        fetch('/api/marketplace')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.listings) {
              setListings(data.listings);
            }
          })
          .catch((err) => console.warn('API fallback error:', err))
          .finally(() => setLoading(false));

        handleFirestoreError(error, OperationType.GET, 'marketplace_listings');
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter listings by Category, Distance, and Search term
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Distance filter
      if (distanceFilter !== 'all' && typeof item.distanceKm === 'number' && item.distanceKm > Number(distanceFilter)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesSeller = (item.sellerName || '').toLowerCase().includes(q);
        const matchesVillage = (item.sellerVillage || '').toLowerCase().includes(q);
        const matchesTag = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesSeller && !matchesVillage && !matchesTag) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [listings, selectedCategory, distanceFilter, searchQuery]);

  // Handle local image file upload (camera or gallery) with client-side downscaling
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        // Compress using Canvas to stay safely under Firestore limits
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setNewImageUrl(compressed);
          } else {
            setNewImageUrl(rawData);
          }
          setAiMatchSuccessNotice('Custom image uploaded and optimized');
          setTimeout(() => setAiMatchSuccessNotice(null), 3000);
        };
        img.onerror = () => {
          setNewImageUrl(rawData);
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Auto-Match Image using Gemini & Produce Classification
  const handleAIMatchImage = async () => {
    if (!newTitle.trim()) {
      alert('Please enter a listing title first (e.g., "Wheat Straw Bales" or "Swaraj Tractor") so our AI model can match your produce!');
      return;
    }

    setIsMatchingAIImage(true);
    setAiMatchSuccessNotice(null);
    try {
      const res = await fetch('/api/marketplace/ai-match-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          description: newDescription,
        }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setNewImageUrl(data.imageUrl);
        setAiMatchSuccessNotice(`AI model matched: ${data.label || 'Optimal produce image'}`);
        setTimeout(() => setAiMatchSuccessNotice(null), 4000);
      }
    } catch (err) {
      console.warn('AI image matching fallback:', err);
    } finally {
      setIsMatchingAIImage(false);
    }
  };

  // Add new product directly to Firestore Database
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    setIsSubmitting(true);
    const docId = 'm-' + Date.now();
    try {
      let finalImageUrl = newImageUrl;
      if (!finalImageUrl) {
        if (newCategory === 'Equipment') {
          finalImageUrl = 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80';
        } else if (newCategory === 'Produce') {
          finalImageUrl = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
        } else if (newCategory === 'Seeds & Inputs') {
          finalImageUrl = 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80';
        } else {
          finalImageUrl = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
        }
      }

      const cleanPhone = newSellerPhone.trim();
      const currentUid = auth.currentUser?.uid || user?.uid || '';

      const newListingData: Record<string, any> = {
        title: newTitle.trim(),
        category: newCategory,
        price: `${newPrice} ${newUnit}`.trim(),
        quantity: newQuantity.trim() || '1 Lot',
        description: newDescription.trim() || 'Direct farmer listing',
        imageUrl: finalImageUrl,
        sellerName: profile?.name || user?.displayName || 'Local Farmer',
        sellerPhone: cleanPhone,
        sellerVillage: profile?.village || 'Local Area',
        distanceKm: Math.floor(Math.random() * 8) + 1,
        tags: ['Verified Farmer', newCategory],
        createdAt: new Date().toISOString(),
      };

      if (currentUid) {
        newListingData.ownerId = currentUid;
      }

      // Save directly to Firestore collection
      try {
        await setDoc(doc(db, 'marketplace_listings', docId), newListingData);
      } catch (clientErr) {
        console.warn('Direct client setDoc failed, routing through /api/marketplace fallback:', clientErr);
        const token = (await getIdToken()) || idToken;
        const res = await fetch('/api/marketplace', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            docId,
            listing: newListingData,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to persist listing in database');
        }
      }

      // Optimistically insert into local state so farmer immediately sees their item
      setListings((prev) => {
        const exists = prev.some((p) => p.id === docId);
        if (exists) return prev;
        const newlyCreated: MarketplaceListing = {
          id: docId,
          title: newListingData.title,
          category: newListingData.category,
          price: newListingData.price,
          quantity: newListingData.quantity,
          description: newListingData.description,
          imageUrl: newListingData.imageUrl,
          sellerName: newListingData.sellerName,
          sellerPhone: newListingData.sellerPhone,
          sellerVillage: newListingData.sellerVillage,
          distanceKm: newListingData.distanceKm,
          tags: newListingData.tags,
          ownerId: newListingData.ownerId,
          createdAt: newListingData.createdAt,
        };
        return [newlyCreated, ...prev];
      });

      // If user is currently filtering by a specific category that differs, reset to 'All' so they see their crop
      setSelectedCategory('All');

      // Save phone number to farmer profile if present
      if (cleanPhone) {
        try {
          const token = (await getIdToken()) || idToken;
          if (token) {
            await fetch('/api/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ phone: cleanPhone }),
            });
          }
        } catch {
          // non-blocking
        }
      }

      setShowNewModal(false);
      setNewTitle('');
      setNewPrice('');
      setNewQuantity('');
      setNewDescription('');
      setNewImageUrl('');
    } catch (err) {
      console.error('Failed to create listing in database:', err);
      handleFirestoreError(err, OperationType.CREATE, `marketplace_listings/${docId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product from Firestore database
  const handleDeleteListing = async (listingId: string, ownerId?: string) => {
    const currentUid = auth.currentUser?.uid || user?.uid;
    if (ownerId && currentUid && ownerId !== currentUid) {
      alert('You can only remove products you have listed.');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this product from the marketplace database?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'marketplace_listings', listingId));
    } catch (err) {
      console.error('Delete product error:', err);
      handleFirestoreError(err, OperationType.DELETE, `marketplace_listings/${listingId}`);
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8 max-w-full overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Direct Farmer-to-Farmer Trade</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Loaded from Database ({listings.length} items)</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-['Outfit']">
              Marketplace & Residue Exchange
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {isHindi
                ? 'पराली, भूसा, खाद का सीधा लेन-देन, कृषि यंत्र व ट्रैक्टर किराए पर लें और साथी किसानों से बिना बिचौलियों के सीधा व्यापार करें।'
                : 'Exchange crop residue (straw, stubble, manure), rent machinery, and sell harvest directly loaded from the Firestore database.'}
            </p>
          </div>

          <button
            onClick={() => {
              if (!isLoggedIn) {
                onRequireLogin();
              } else {
                setShowNewModal(true);
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isHindi ? 'नया उत्पाद बेचें (Post Listing)' : 'Post Farmer Listing'}</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Waste Exchange', 'Equipment', 'Produce', 'Seeds & Inputs'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat === 'Waste Exchange' ? '♻️ Residue' : cat === 'Equipment' ? '🚜 Equipment' : cat === 'Produce' ? '🌾 Produce' : cat === 'Seeds & Inputs' ? '🌱 Seeds' : 'All Items'}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search straw, tractor, harvest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-600 bg-stone-50"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 border border-stone-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <div className="text-sm font-bold text-stone-800">Loading products from Firestore database...</div>
          <div className="text-xs text-stone-500">Connecting to cloud agricultural repository</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredListings.length === 0 && (
        <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No products found in database</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All' 
              ? 'No products match your current search or filter criteria. Try selecting another category or clearing search.'
              : 'There are no active product listings in the database yet. Be the first farmer to post!'}
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Listings Grid: 1 col on mobile, 2 cols on tablet, 3-4 cols on laptop */}
      {!loading && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((item) => {
            const isOwner = Boolean(user?.uid && item.ownerId && item.ownerId === user.uid);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group relative"
              >
                <div>
                  {/* Product Photo */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white">
                        {item.category}
                      </span>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDeleteListing(item.id, item.ownerId)}
                        title="Delete your listing"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.distanceKm && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-stone-800 flex items-center gap-1 shadow-xs">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{item.distanceKm} km away</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-base font-extrabold text-stone-900 font-['Outfit'] line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-black text-emerald-800 font-['Outfit']">
                        {item.price}
                      </div>
                      <span className="text-xs text-stone-500 font-semibold">{item.quantity}</span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Seller Contact Footer */}
                <div className="p-4 pt-0">
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-800 truncate">{item.sellerName}</div>
                      <div className="text-[10px] text-stone-500 truncate">{item.sellerVillage || 'Nearby Area'}</div>
                    </div>

                    <button
                      onClick={() => setContactModalItem(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* POST FARMER LISTING MODAL WITH IMAGE UPLOAD & AI PREFERENCES */}
      {/* ------------------------------------------------------------- */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-auto max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Plus className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 font-['Outfit']">Post Marketplace Listing</h3>
                  <p className="text-xs text-stone-500">Saved directly into the live Firestore database</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 pt-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Listing Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dry Wheat Straw Bales, Swaraj Tractor Rental"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Waste Exchange', 'Equipment', 'Produce', 'Seeds & Inputs'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        newCategory === cat
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-800'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {cat === 'Waste Exchange' ? '♻️ Residue' : cat === 'Equipment' ? '🚜 Equipment' : cat === 'Produce' ? '🌾 Produce' : '🌱 Seeds'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹1.5 or ₹850"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden bg-white"
                  >
                    <option value="per kg">per kg</option>
                    <option value="per Quintal">per Quintal</option>
                    <option value="per Trolley">per Trolley</option>
                    <option value="per Hour">per Hour (Rental)</option>
                    <option value="per Acre">per Acre (Rental)</option>
                    <option value="Total Lot">Total Lot</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Available Quantity</label>
                <input
                  type="text"
                  placeholder="e.g. 50 Quintals, 3 Trolleys, Available daily"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contact Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 98250 12345 (Farmers will call or WhatsApp this number)"
                  value={newSellerPhone}
                  onChange={(e) => setNewSellerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description & Details</label>
                <textarea
                  rows={2}
                  placeholder="Moisture condition, quality, loading availability, location specifics..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Image Selection / AI Matching / Camera Upload */}
              <div className="space-y-2 pt-1 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">Product Photograph</label>
                  <button
                    type="button"
                    onClick={handleAIMatchImage}
                    disabled={isMatchingAIImage || !newTitle.trim()}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isMatchingAIImage ? 'Matching photo...' : '✨ AI Auto-Match Photo'}</span>
                  </button>
                </div>

                {/* Upload or Preset Grid */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl border border-dashed border-stone-300 hover:border-emerald-600 text-stone-600 hover:text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-stone-50"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo or Upload</span>
                    </button>
                  </div>

                  {/* AI success notice */}
                  {aiMatchSuccessNotice && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{aiMatchSuccessNotice}</span>
                    </div>
                  )}

                  {/* Preview Selected Image */}
                  {newImageUrl && (
                    <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                      <img src={newImageUrl} alt="Product preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('')}
                        className="absolute top-2 right-2 p-1 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Quick Preset Selector */}
                  {!newImageUrl && (
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 mb-1 uppercase tracking-wider">
                        Or pick a standard preset:
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {PRODUCE_IMAGE_PRESETS.filter((p) => p.category === newCategory || newCategory === 'Waste Exchange').slice(0, 4).map((preset) => (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() => setNewImageUrl(preset.url)}
                            className="p-1 rounded-lg border border-stone-200 hover:border-emerald-600 bg-white text-[10px] font-bold text-stone-700 text-center truncate cursor-pointer hover:bg-emerald-50"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>Publish to Database</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SELLER CONTACT MODAL WITH ONE-CLICK CALL & WHATSAPP */}
      {/* ------------------------------------------------------------- */}
      {contactModalItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Phone className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 font-['Outfit']">Seller Contact</h3>
                  <div className="text-[11px] text-stone-500">{contactModalItem.title}</div>
                </div>
              </div>
              <button
                onClick={() => setContactModalItem(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seller profile card */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Farmer / Seller:</span>
                <span className="font-extrabold text-stone-900">{contactModalItem.sellerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Village / Block:</span>
                <span className="font-bold text-stone-800">{contactModalItem.sellerVillage || 'Nearby Area'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Rate:</span>
                <span className="font-black text-emerald-800">{contactModalItem.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-semibold">Quantity:</span>
                <span className="font-bold text-stone-800">{contactModalItem.quantity}</span>
              </div>
            </div>

            {/* Direct Connect Options */}
            {contactModalItem.sellerPhone ? (
              <div className="space-y-2">
                <a
                  href={`tel:${contactModalItem.sellerPhone.replace(/[^0-9+]/g, '')}`}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call {contactModalItem.sellerPhone}</span>
                </a>

                <a
                  href={`https://wa.me/${contactModalItem.sellerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${contactModalItem.sellerName}, I am contacting you regarding your "${contactModalItem.title}" listing on E-Farmer.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <span>💬 Chat on WhatsApp</span>
                </a>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-center space-y-1">
                <AlertCircle className="w-5 h-5 text-amber-700 mx-auto" />
                <div className="font-bold">No Contact Phone Attached</div>
                <div className="text-[11px] text-amber-800">The seller has not provided a phone number for this listing yet.</div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
