import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Maximize, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  X,
  Info,
  Navigation
} from 'lucide-react';
import { api } from '../services/api';
import { mapsService } from '../services/mapsService';
import { useAuth } from '../context/AuthContext';
import { 
  PropertyCategory, 
  BHKType, 
  PropertyType, 
  FurnishingType, 
  PreferredTenant, 
  UserType 
} from '../types';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];

const AMENITIES_LIST = [
  "Lift", "Parking", "Security", "Gated Community", "Children's Play Area", "Water Supply (Borewell / Corporation)"
];

const NEARBY_FACILITIES_LIST = [
  "School", "Hospital", "Metro", "Bus Stop", "Market"
];

export const ListProperty: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openAuth } = useAuth();
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: 'Rent' as PropertyCategory,
    bhkType: '2 BHK' as BHKType,
    type: 'Apartment' as PropertyType,
    furnishing: 'Semi-Furnished' as FurnishingType,
    locality: '',
    fullAddress: '',
    state: 'Maharashtra',
    city: '',
    pincode: '',
    rent: 0,
    deposit: 0,
    maintenance: 0,
    expectedPrice: 0,
    priceNegotiable: false,
    loanAvailable: false,
    sqft: 0,
    floorNumber: 0,
    totalFloors: 0,
    bathrooms: 1,
    preferredTenant: 'Anyone' as PreferredTenant,
    availableFrom: new Date().toISOString().split('T')[0],
    amenities: [] as string[],
    nearbyFacilities: [] as string[],
    userType: 'Owner' as UserType,
    description: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [fetchingAddress, setFetchingAddress] = useState(false);

  // Auto-generate description
  useEffect(() => {
    if (!isEditMode && formData.description.length < 10) {
      setFormData(prev => ({
        ...prev,
        description: generateDefaultDescription()
      }));
    }
  }, [formData.bhkType, formData.type, formData.locality, formData.city, formData.furnishing, formData.category]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      setIsEditMode(true);
      setPropertyId(editId);
      fetchPropertyData(editId);
    }
  }, [location.search]);

  const fetchPropertyData = async (id: string) => {
    setLoading(true);
    try {
      const property = await api.getPropertyById(id);
      if (property) {
        // Map property data to formData
        setFormData({
          category: property.category,
          bhkType: property.bhkType,
          type: property.type,
          furnishing: property.furnishing,
          locality: property.location.split(',')[0].trim(),
          city: property.location.split(',')[1]?.trim() || '',
          state: property.state || 'Maharashtra',
          pincode: property.pincode || '',
          fullAddress: property.fullAddress || '',
          rent: property.category === 'Rent' ? property.price : 0,
          deposit: property.deposit || 0,
          maintenance: property.maintenance || 0,
          expectedPrice: property.category === 'Sale' ? property.price : 0,
          priceNegotiable: property.priceNegotiable || false,
          loanAvailable: property.loanAvailable || false,
          sqft: property.sqft,
          floorNumber: property.floorNumber || 0,
          totalFloors: property.totalFloors || 0,
          bathrooms: property.baths,
          preferredTenant: property.preferredTenant || 'Anyone',
          availableFrom: property.availableFrom || new Date().toISOString().split('T')[0],
          amenities: property.amenities || [],
          nearbyFacilities: property.nearbyFacilities || [],
          userType: property.userType || 'Owner',
          description: property.description,
          lat: property.lat,
          lng: property.lng,
        });
        setExistingImages(property.images || []);
        setPreviews(property.images || []);
      }
    } catch (err) {
      console.error("Failed to fetch property for editing:", err);
      setError("Failed to load property data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAddress = async () => {
    setFetchingAddress(true);
    try {
      const pos = await mapsService.getCurrentLocation();
      const result = await mapsService.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      if (result) {
        setFormData(prev => ({
          ...prev,
          locality: result.locality || prev.locality,
          city: result.city || prev.city,
          state: result.state || prev.state,
          pincode: result.pincode || prev.pincode,
          fullAddress: result.fullAddress || prev.fullAddress,
          lat: result.lat,
          lng: result.lng
        }));
      }
    } catch (err: any) {
      console.error("Failed to fetch address:", err);
      if (err.code === 1) {
        setError("Location permission denied. Please allow location access in your browser settings.");
      } else if (err.code === 3) {
        setError("Location request timed out. Please try again or enter address manually.");
      } else {
        setError("Could not get your location. Please ensure GPS is enabled and you have a stable connection.");
      }
    } finally {
      setFetchingAddress(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? (Number(value) || 0) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setImages(prev => prev.filter((_, i) => i !== newIndex));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleItem = (list: 'amenities' | 'nearbyFacilities', item: string) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(item) 
        ? prev[list].filter(i => i !== item)
        : [...prev[list], item]
    }));
  };

  const generateDefaultTitle = () => {
    return `${formData.bhkType} ${formData.type} in ${formData.locality}, ${formData.city}`;
  };

  const generateDefaultDescription = () => {
    if (formData.category === 'Rent') {
      return `Beautiful ${formData.bhkType} ${formData.type} available for rent in ${formData.locality}, ${formData.city}. The property is ${formData.furnishing} and features ${formData.bathrooms} bathrooms. Built-up area is ${formData.sqft} sq ft. Located on floor ${formData.floorNumber} of ${formData.totalFloors}. Preferred tenants: ${formData.preferredTenant}. Available from ${formData.availableFrom}.`;
    } else {
      return `Excellent ${formData.bhkType} ${formData.type} for sale in ${formData.locality}, ${formData.city}. This ${formData.furnishing} property offers ${formData.sqft} sq ft of built-up area. It has ${formData.bathrooms} bathrooms and is situated on floor ${formData.floorNumber}. Loan facility is ${formData.loanAvailable ? 'available' : 'not available'}.`;
    }
  };

  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!formData.locality.trim()) return "Locality is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state) return "State is required";
    if (!formData.pincode.trim() || formData.pincode.length !== 6) return "Pincode must be 6 digits";
    if (formData.category === 'Rent' && formData.rent <= 0) return "Rent must be greater than 0";
    if (formData.category === 'Sale' && formData.expectedPrice <= 0) return "Expected price must be greater than 0";
    if (formData.sqft <= 0) return "Built-up area must be greater than 0";
    if (formData.bathrooms <= 0) return "Number of bathrooms must be at least 1";
    if (formData.category === 'Sale' && formData.amenities.length === 0) return "At least one amenity is required for sale";
    
    const wordCount = formData.description.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 50) return `Description must be at least 50 words (current: ${wordCount})`;
    
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setUploadProgress(10);
    setError(null);
    try {
      const beds = parseInt(formData.bhkType) || 1;
      const finalData = {
        ...formData,
        title: generateDefaultTitle(),
        slug: generateDefaultTitle().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        description: formData.description || generateDefaultDescription(),
        price: formData.category === 'Rent' ? formData.rent : formData.expectedPrice,
        location: `${formData.locality}, ${formData.city}`,
        beds,
        baths: formData.bathrooms,
        features: [...formData.amenities, ...formData.nearbyFacilities],
        ownerId: user.id,
        images: existingImages, // Keep existing images
      };

      setUploadProgress(30);
      if (isEditMode && propertyId) {
        await api.updateProperty(propertyId, { ...finalData, ownerName: user.name, ownerPhone: user.phone } as any, images);
      } else {
        await api.createProperty(finalData as any, images, user.name, user.phone);
      }
      setUploadProgress(100);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Failed to list property:", err);
      let message = "Failed to list property. ";
      try {
        const parsed = JSON.parse(err.message);
        message += parsed.error || "";
      } catch {
        message += err.message || "Please check your connection and try again.";
      }
      setError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const nextStage = () => setStage(prev => Math.min(prev + 1, 3));
  const prevStage = () => setStage(prev => Math.max(prev - 1, 1));

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Building2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">List Your Property</h2>
        <p className="mt-4 max-w-md text-lg text-[var(--text-secondary)]">
          Join thousands of owners who trust ToLetBro to find the perfect tenants and buyers.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button 
            onClick={() => openAuth('USER')}
            className="rounded-2xl bg-brand px-10 py-4 font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Login to Continue
          </button>
          <button 
            onClick={() => navigate('/')}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-10 py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-105 active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white shadow-xl shadow-green-500/20"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">Successfully Listed!</h2>
        <p className="mt-4 max-w-md text-lg text-[var(--text-secondary)]">
          Your property has been successfully {isEditMode ? 'updated' : 'listed'}. It is now visible to thousands of potential seekers.
        </p>
        <div className="mt-10">
          <button 
            onClick={() => navigate('/dashboard')}
            className="rounded-2xl bg-brand px-10 py-4 font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-[var(--text-primary)]">
          {isEditMode ? 'Edit Property' : 'List Your Property'}
        </h1>
        <p className="mt-4 text-[var(--text-secondary)]">
          {isEditMode ? 'Update your property details to keep them accurate.' : 'Reach thousands of potential tenants and buyers instantly.'}
        </p>
      </div>

      {/* Progress Bar - Sticky on Mobile */}
      <div className="sticky top-0 z-50 -mx-4 mb-12 bg-[var(--bg)] px-4 py-4 shadow-md md:static md:mx-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="flex items-center justify-between px-4">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  stage >= num ? 'border-brand bg-brand text-black' : 'border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)]'
                }`}>
                  {stage > num ? <CheckCircle2 size={20} /> : num}
                </div>
                <span className={`text-[10px] font-medium sm:text-xs ${stage >= num ? 'text-brand' : 'text-[var(--text-secondary)]'}`}>
                  {num === 1 ? 'Preliminary' : num === 2 ? 'Specs' : 'Final'}
                </span>
              </div>
              {num < 3 && (
                <div className={`h-0.5 flex-1 mx-4 transition-all ${stage > num ? 'bg-brand' : 'bg-[var(--border)]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 md:p-12">
        {loading && (
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>Uploading Property...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div 
                className="h-full bg-brand"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 text-red-500">
            <Info size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Property For */}
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Property For *</label>
                  <div className="flex gap-4">
                    {['Rent', 'Sale'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat as PropertyCategory }))}
                        className={`flex-1 rounded-2xl py-4 font-bold transition-all ${
                          formData.category === cat ? 'bg-brand text-black' : 'bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BHK Type */}
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">BHK Type *</label>
                  <select 
                    name="bhkType"
                    value={formData.bhkType}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  >
                    {['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Property Type *</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  >
                    {['Independent House', 'Apartment', 'Standalone Building', 'Hostel', 'Commercial'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Furnishing */}
                <div className="space-y-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Furnishing *</label>
                  <select 
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  >
                    {['Unfurnished', 'Semi-Furnished', 'Fully Furnished'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {formData.category === 'Rent' ? (
                  <>
                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Monthly Rent (₹) *</label>
                      <input 
                        type="number" 
                        name="rent"
                        value={formData.rent}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Security Deposit (₹)</label>
                      <input 
                        type="number" 
                        name="deposit"
                        value={formData.deposit}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Maintenance (₹)</label>
                      <input 
                        type="number" 
                        name="maintenance"
                        value={formData.maintenance}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3 md:col-span-3">
                    <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Expected Price (₹) *</label>
                    <input 
                      type="number" 
                      name="expectedPrice"
                      value={formData.expectedPrice}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Location Details */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Location Details *</h3>
                  <button
                    type="button"
                    onClick={handleFetchAddress}
                    disabled={fetchingAddress}
                    className="flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2 text-sm font-bold text-brand transition-all hover:bg-brand/20 disabled:opacity-50"
                  >
                    {fetchingAddress ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                    Fetch Current Address
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Locality</label>
                    <input 
                      type="text" 
                      name="locality"
                      placeholder="e.g. HSR Layout"
                      value={formData.locality}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">City</label>
                    <input 
                      type="text" 
                      name="city"
                      placeholder="e.g. Bangalore"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">State</label>
                    <select 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    >
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Pin Code</label>
                    <input 
                      type="text" 
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-xs font-bold uppercase text-[var(--text-secondary)]">Full Address</label>
                    <textarea 
                      name="fullAddress"
                      rows={3}
                      value={formData.fullAddress}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Upload Images</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[var(--border)] bg-[var(--bg)] p-12 transition-all hover:border-brand/50 hover:bg-brand/5"
                >
                  <Upload size={40} className="mb-4 text-brand" />
                  <p className="text-lg font-bold text-[var(--text-primary)]">Click to upload photos</p>
                  <p className="text-sm text-[var(--text-secondary)]">PNG, JPG or JPEG (Max 10 photos)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    multiple 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {previews.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
                    {previews.map((preview, index) => (
                      <div key={index} className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)]">
                        <img src={preview || null} alt={`Property preview ${index + 1}`} className="h-full w-full object-cover" />
                        <button 
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={nextStage}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-black shadow-lg shadow-brand/20 transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Built-up Area (sq ft) *</label>
                  <div className="relative">
                    <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input 
                      type="number" 
                      name="sqft"
                      value={formData.sqft}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Bathrooms *</label>
                  <div className="relative">
                    <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input 
                      type="number" 
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Floor Number *</label>
                  <input 
                    type="number" 
                    name="floorNumber"
                    value={formData.floorNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Floors</label>
                  <input 
                    type="number" 
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Preferred Tenant *</label>
                  <select 
                    name="preferredTenant"
                    value={formData.preferredTenant}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                  >
                    {['Family only', 'Bachelor', 'Office Only', 'Anyone'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Available From *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input 
                      type="date" 
                      name="availableFrom"
                      value={formData.availableFrom}
                      onChange={handleInputChange}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-12 pr-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={prevStage}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  onClick={nextStage}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-black shadow-lg shadow-brand/20 transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div
              key="stage3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {formData.category === 'Sale' && (
                <div className="grid grid-cols-1 gap-8 rounded-3xl border border-brand/20 bg-brand/5 p-8 md:grid-cols-2">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      name="priceNegotiable"
                      id="priceNegotiable"
                      checked={formData.priceNegotiable}
                      onChange={handleInputChange}
                      className="h-6 w-6 rounded border-[var(--border)] bg-[var(--bg)] text-brand focus:ring-brand"
                    />
                    <label htmlFor="priceNegotiable" className="font-bold text-[var(--text-primary)]">Price Negotiable?</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      name="loanAvailable"
                      id="loanAvailable"
                      checked={formData.loanAvailable}
                      onChange={handleInputChange}
                      className="h-6 w-6 rounded border-[var(--border)] bg-[var(--bg)] text-brand focus:ring-brand"
                    />
                    <label htmlFor="loanAvailable" className="font-bold text-[var(--text-primary)]">Loan Available?</label>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Amenities {formData.category === 'Sale' && '(Mandatory)'}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {AMENITIES_LIST.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleItem('amenities', item)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                        formData.amenities.includes(item) 
                          ? 'border-brand bg-brand/10 text-brand' 
                          : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                        formData.amenities.includes(item) ? 'bg-brand border-brand text-black' : 'border-[var(--border)]'
                      }`}>
                        {formData.amenities.includes(item) && <CheckCircle2 size={14} />}
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Nearby Facilities</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {NEARBY_FACILITIES_LIST.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleItem('nearbyFacilities', item)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                        formData.nearbyFacilities.includes(item) 
                          ? 'border-brand bg-brand/10 text-brand' 
                          : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded border ${
                        formData.nearbyFacilities.includes(item) ? 'bg-brand border-brand text-black' : 'border-[var(--border)]'
                      }`}>
                        {formData.nearbyFacilities.includes(item) && <CheckCircle2 size={14} />}
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Are you Owner or Agent? *</label>
                <div className="flex gap-4">
                  {['Owner', 'Agent'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, userType: type as UserType }))}
                      className={`flex-1 rounded-2xl py-4 font-bold transition-all ${
                        formData.userType === type ? 'bg-brand text-black' : 'bg-[var(--bg)] text-[var(--text-primary)] border border-[var(--border)]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">Property Description (Min 50 words) *</label>
                <textarea 
                  name="description"
                  rows={6}
                  placeholder={generateDefaultDescription()}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-[var(--text-primary)] focus:border-brand focus:outline-none"
                />
                <p className="text-xs text-[var(--text-secondary)]">
                  Word count: {formData.description.split(/\s+/).filter(w => w.length > 0).length} / 50
                </p>
              </div>

              <div className="flex justify-between">
                <button 
                  onClick={prevStage}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--text-primary)] shadow-lg transition-transform hover:scale-110 active:scale-95"
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-2xl bg-brand px-12 py-4 font-bold text-black shadow-lg shadow-brand/20 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  {isEditMode ? 'Update Property' : 'List Property'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
