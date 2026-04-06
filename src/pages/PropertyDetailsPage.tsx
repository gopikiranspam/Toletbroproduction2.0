import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../firebase';
import { Property, Owner } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Share2, 
  Heart, 
  Home,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Calendar,
  User,
  Building2,
  Compass,
  Eye,
  QrCode
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { isDNDActive } from '../utils/privacy';
import { useLocation } from '../hooks/useLocation';
import { SEO } from '../components/SEO';
import { PropertyCard } from '../components/PropertyCard';

export const PropertyDetailsPage: React.FC = () => {
  const { propertySlugId } = useParams<{ propertySlugId: string }>();
  const [searchParams] = useSearchParams();
  const { user, openAuth, toggleFavorite: toggleFavoriteInContext } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [warningType, setWarningType] = useState<'DND' | 'ONLY_MESSAGE' | 'DISCLOSURE' | null>(null);
  const userLocation = useLocation();
  const nearbyToletsScrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (nearbyToletsScrollRef.current) {
      const scrollAmount = 400;
      nearbyToletsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  const isFavorite = property ? user?.favorites?.includes(property.id) : false;

  const dndActive = owner ? isDNDActive(owner.privacy) : false;

  const distance = useMemo(() => {
    if (!userLocation.lat || !userLocation.lng || !property?.lat || !property?.lng) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (property.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (property.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(property.lat * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(1);
  }, [userLocation.lat, userLocation.lng, property?.lat, property?.lng]);

  useEffect(() => {
    if (propertySlugId) {
      const idMatch = propertySlugId.match(/(prop-.*)$/);
      const id = idMatch ? idMatch[1] : propertySlugId;
      
      const fetchData = async () => {
        setLoading(true);
        try {
          const p = await api.getPropertyById(id);
          if (p) {
            setProperty(p);
            
            // Record view
            api.incrementPropertyStat(id, 'views');
            
            // Record scan if source is QR
            if (searchParams.get('source') === 'qr') {
              api.incrementPropertyStat(id, 'scans');
            }

            const o = await api.getOwnerById(p.ownerId);
            if (o) setOwner(o);

            // Fetch nearby properties
            if (p.lat && p.lng) {
              const nearby = await api.getNearbyProperties(p.lat, p.lng, 5);
              setNearbyProperties(nearby.filter(item => item.id !== p.id).slice(0, 6));
            }
          }
        } catch (error) {
          console.error("Error fetching property details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [propertySlugId, searchParams]);

  const handleShare = async () => {
    if (!property) return;
    
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        api.incrementPropertyStat(property.id, 'shares');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
        api.incrementPropertyStat(property.id, 'shares');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!property) return;
    if (!user) {
      openAuth();
      return;
    }

    await toggleFavoriteInContext(property.id);
  };

  const handleContactClick = (type: 'call' | 'message') => {
    if (!property) return;
    
    const contactPhone = owner?.phone || property.ownerPhone;
    if (!contactPhone) return;
    
    // Check for DND - Only block calls if DND is active
    if (type === 'call' && dndActive) {
      setWarningType('DND');
      setShowPrivacyWarning(true);
      return;
    }

    // Check for Only Message (if calling)
    if (type === 'call' && owner?.privacy?.onlyMessage) {
      setWarningType('ONLY_MESSAGE');
      setShowPrivacyWarning(true);
      return;
    }

    // Check for Disclosure
    if (owner?.privacy?.preDisclosure?.enabled && !disclosureAccepted) {
      setWarningType('DISCLOSURE');
      setShowPrivacyWarning(true);
      return;
    }

    // If all clear, proceed
    api.incrementPropertyStat(property.id, type === 'call' ? 'callClicks' : 'messageClicks');
    
    if (type === 'call') {
      window.location.href = `tel:${contactPhone}`;
    } else {
      window.open(`https://wa.me/${contactPhone.replace(/\D/g, '')}`, '_blank');
    }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
      <p className="font-medium text-[var(--text-secondary)]/60">Loading property details...</p>
    </div>
  );

  if (!property) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)]">
      <div className="rounded-full bg-red-500/10 p-6 text-red-500">
        <Info size={48} />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Property not found</h2>
      <p className="text-[var(--text-secondary)]/60">The property you're looking for might have been removed.</p>
    </div>
  );

  const allImages = property.images && property.images.length > 0 ? property.images : [property.imageUrl];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    "name": property.title,
    "description": property.description,
    "image": property.images?.[0] || property.imageUrl,
    "url": window.location.href,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": property.locality || property.area,
      "addressLocality": property.city,
      "addressRegion": property.state || "Telangana",
      "postalCode": property.pincode || property.zipCode,
      "addressCountry": "IN"
    },
    "numberOfRooms": property.beds || parseInt(property.bhkType) || 1,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.sqft,
      "unitCode": "FTK"
    },
    "amenityFeature": (property.amenities || []).map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    })),
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": window.location.href,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": property.price,
        "priceCurrency": "INR",
        "unitCode": "MON"
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 md:py-12 pb-32 md:pb-12">
      <SEO 
        title={`${property.bhkType} ${property.type} for Rent in ${property.area}, ${property.city}`}
        description={`${property.bhkType} ${property.type} for rent in ${property.area}, ${property.city}. Rent: ₹${property.price}. Direct from owner, no broker. ${property.description.substring(0, 100)}...`}
        ogImage={property.images?.[0] || property.imageUrl}
        ogType="article"
        schema={structuredData}
      />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column: Images & Details */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="relative mb-4">
            {/* Mobile Scrollable View - Modern Rounded Gallery */}
            <div className="relative md:hidden mb-6">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
                <div 
                  className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
                  onScroll={(e) => {
                    const scrollLeft = (e.target as HTMLDivElement).scrollLeft;
                    const width = (e.target as HTMLDivElement).clientWidth;
                    const index = Math.round(scrollLeft / width);
                    if (index !== currentImageIndex) setCurrentImageIndex(index);
                  }}
                >
                  {allImages.map((img, idx) => (
                    <div key={idx} className="min-w-full snap-center aspect-[4/3] relative">
                      <img 
                        src={img || null} 
                        alt={`${property.title} - ${idx + 1}`}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Gallery Overlays */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                {allImages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      currentImageIndex === idx ? 'w-4 bg-brand' : 'w-1 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={handleShare}
                  className="rounded-full bg-black/40 p-2.5 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-90"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={handleToggleFavorite}
                  className={`rounded-full bg-black/40 p-2.5 backdrop-blur-md border border-white/10 transition-transform active:scale-90 ${isFavorite ? 'text-brand' : 'text-white'}`}
                >
                  <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Desktop Animated View */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative hidden md:block aspect-video overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentImageIndex}
                  src={allImages[currentImageIndex] || null} 
                  alt={`${property.title} - ${currentImageIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-brand hover:text-black opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-all hover:bg-brand hover:text-black opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-6 right-6 rounded-full bg-black/50 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                {currentImageIndex + 1} / {allImages.length}
              </div>

              <div className="absolute top-6 right-6 flex gap-3">
                <button 
                  onClick={handleShare}
                  className="rounded-full bg-black/50 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <Share2 size={20} />
                </button>
                <button 
                  onClick={handleToggleFavorite}
                  className={`rounded-full bg-black/50 p-3 backdrop-blur-md transition-colors hover:bg-white/20 ${isFavorite ? 'text-brand' : 'text-white'}`}
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Thumbnail Strip - Hidden on Mobile */}
          {allImages.length > 1 && (
            <div className="mb-8 hidden md:flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    currentImageIndex === idx ? 'border-brand' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img || null} alt={`${property.title} - view ${idx + 1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          <div className="mb-4 md:mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="hidden md:inline-block rounded-full bg-brand/10 px-4 py-1 text-xs font-bold text-brand uppercase tracking-widest">
                {property.category} • {property.type}
              </span>
              <span className="hidden md:inline-block text-sm text-white/40">ID: {property.id}</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-5xl">{property.bhkType} {property.type}</h1>
            
              <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-[var(--border)] pb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                <Eye size={14} className="text-brand" />
                <span>{property.views || 0} Views</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                <Heart size={14} className="text-brand" />
                <span>{property.favoritesCount || 0} Favorites</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)]">
                <QrCode size={14} className="text-brand" />
                <span>{(property.scans || 0) + (property.internalScans || 0)} Scans</span>
              </div>
            </div>

            {property.locality && (
              <div className="mb-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  {property.locality}, {property.city}
                  <span className="hidden md:inline">, {property.state} - {property.pincode || property.zipCode}</span>
                </p>
                <p className="mt-1 text-[10px] font-bold text-[var(--text-secondary)]/40 md:hidden uppercase tracking-widest">ID: {property.id}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {property.lat && property.lng && (
                <div className="flex w-full md:w-auto items-center gap-3">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-black shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Compass size={18} />
                    <span>Get Directions</span>
                  </a>
                  {distance && (
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider bg-brand/10 px-2 py-1 rounded-md">
                      {distance} km away
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Primary Pricing Details */}
          <div className="mb-6 block md:hidden">
            <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-brand/10 blur-2xl" />
              
              <div className="relative mb-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">
                  {property.category === 'Rent' ? 'Monthly Rent' : 'Expected Price'}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-brand">₹{property.price.toLocaleString()}</p>
                  {property.category === 'Rent' && property.maintenance > 0 && (
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium">+ ₹{property.maintenance} Maint.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                {property.category === 'Rent' ? (
                  <>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">Security Deposit</p>
                      <p className="text-base font-bold text-[var(--text-primary)]">₹{property.deposit?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">Maintenance</p>
                      <p className="text-base font-bold text-[var(--text-primary)]">₹{property.maintenance?.toLocaleString() || '0'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">Negotiable</p>
                      <p className="text-base font-bold text-[var(--text-primary)]">{property.priceNegotiable ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-0.5">Loan Available</p>
                      <p className="text-base font-bold text-[var(--text-primary)]">{property.loanAvailable ? 'Yes' : 'No'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-4 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 md:grid-cols-4 md:gap-6 md:rounded-3xl md:p-8">
            <div className="text-center">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand md:mb-2 md:h-12 md:w-12 md:rounded-2xl">
                <Bed size={20} className="md:hidden" />
                <Bed size={24} className="hidden md:block" />
              </div>
              <p className="text-sm font-bold md:text-xl text-[var(--text-primary)]">{property.bhkType || `${property.beds} BHK`}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-secondary)] md:text-xs">BHK</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand md:mb-2 md:h-12 md:w-12 md:rounded-2xl">
                <Bath size={20} className="md:hidden" />
                <Bath size={24} className="hidden md:block" />
              </div>
              <p className="text-sm font-bold md:text-xl text-[var(--text-primary)]">{property.bathrooms || property.baths}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-secondary)] md:text-xs">Baths</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand md:mb-2 md:h-12 md:w-12 md:rounded-2xl">
                <Maximize size={20} className="md:hidden" />
                <Maximize size={24} className="hidden md:block" />
              </div>
              <p className="text-sm font-bold md:text-xl text-[var(--text-primary)]">{property.sqft}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-secondary)] md:text-xs">Sq Ft</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand md:mb-2 md:h-12 md:w-12 md:rounded-2xl">
                <Home size={20} className="md:hidden" />
                <Home size={24} className="hidden md:block" />
              </div>
              <p className="text-sm font-bold md:text-xl text-[var(--text-primary)] line-clamp-1">{property.furnishing.split('-')[0]}</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-secondary)] md:text-xs">Furnish</p>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-8">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-[var(--text-primary)]">
                <Building2 size={20} className="text-brand" />
                Property Specifications
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-secondary)]">Floor Number</span>
                  <span className="font-bold text-[var(--text-primary)]">{property.floorNumber} of {property.totalFloors}</span>
                </li>
                <li className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-secondary)]">Preferred Tenant</span>
                  <span className="font-bold text-[var(--text-primary)]">{property.preferredTenant}</span>
                </li>
                <li className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-secondary)]">Available From</span>
                  <span className="font-bold text-[var(--text-primary)]">{property.availableFrom}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Listed By</span>
                  <span className="font-bold text-[var(--text-primary)]">{property.userType || 'Owner'}</span>
                </li>
              </ul>
            </div>

          <div className="mb-6 md:mb-12 md:hidden">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Nearby Tolets</h2>
              <span className="text-[10px] md:text-xs font-bold text-brand uppercase tracking-widest">Similar Properties</span>
            </div>
            {nearbyProperties.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                {nearbyProperties.map((nearby) => (
                  <div key={nearby.id} className="min-w-[280px] md:min-w-[320px]">
                    <PropertyCard property={nearby} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]/40">No nearby properties found.</p>
            )}
          </div>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="mb-3 md:mb-4 text-xs md:text-lg font-bold uppercase tracking-widest text-[var(--text-secondary)]/50">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">{property.description}</p>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="mb-3 md:mb-4 text-xs md:text-lg font-bold uppercase tracking-widest text-[var(--text-secondary)]/50">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {(property.amenities || []).length > 0 ? (
                property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2">
                    <CheckCircle2 size={14} className="text-brand" />
                    <span className="text-xs font-medium text-[var(--text-primary)]/80">{amenity}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-secondary)]/40">No specific amenities listed.</p>
              )}
            </div>
          </div>

          <div className="mb-6 md:mb-12">
            <h2 className="mb-3 md:mb-4 text-xs md:text-lg font-bold uppercase tracking-widest text-[var(--text-secondary)]/50">Nearby Facilities</h2>
            <div className="flex flex-wrap gap-2">
              {(property.nearbyFacilities || []).length > 0 ? (
                property.nearbyFacilities.map((facility, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2">
                    <MapPin size={14} className="text-brand" />
                    <span className="text-xs font-medium text-[var(--text-primary)]/80">{facility}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-secondary)]/40">No nearby facilities listed.</p>
              )}
            </div>
          </div>

          {/* Desktop Only: Nearby Tolets moved here */}
          <div className="mb-6 md:mb-12 hidden md:block">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">Nearby Tolets</h2>
                <span className="text-[10px] md:text-xs font-bold text-brand uppercase tracking-widest">Similar Properties</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => scroll('left')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            {nearbyProperties.length > 0 ? (
              <div 
                ref={nearbyToletsScrollRef}
                className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth"
              >
                {nearbyProperties.map((nearby) => (
                  <div key={nearby.id} className="min-w-[280px] md:min-w-[320px]">
                    <PropertyCard property={nearby} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]/40">No nearby properties found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Contact */}
        <div className="lg:col-span-1" id="contact-section">
          <div className="sticky top-32 space-y-6 md:space-y-8">
            <div className="rounded-3xl md:rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-6 md:p-8 shadow-2xl">
              <div className="mb-6 md:mb-8 hidden md:block">
                <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]/50">
                  {property.category === 'Rent' ? 'Monthly Rent' : 'Expected Price'}
                </p>
                <p className="text-4xl font-bold text-brand">₹{property.price.toLocaleString()}</p>
                {property.category === 'Rent' && property.maintenance > 0 && (
                  <p className="mt-1 text-xs text-[var(--text-secondary)]/40">+ ₹{property.maintenance} Maintenance</p>
                )}
              </div>

              <div className="mb-8 space-y-4">
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => handleContactClick('call')}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-brand py-4 font-bold text-black transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <Phone size={20} />
                    <span>Call Owner</span>
                  </button>
                  
                  <button 
                    onClick={() => handleContactClick('message')}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-4 font-bold text-[var(--text-primary)] transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    <MessageSquare size={20} />
                    <span>Chat on WhatsApp</span>
                  </button>
                </div>
              </div>

              {(owner || property.ownerName) && (
                <div className="border-t border-[var(--border)] pt-8">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]/50">Listed By</p>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-xl">
                      {(owner?.name || property.ownerName || 'O').charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{owner?.name || property.ownerName}</p>
                      <p className="text-xs text-[var(--text-secondary)]/40">Verified {property.userType}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[2.5rem] border border-[var(--border)] bg-brand/5 p-8">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                <Info size={18} className="text-brand" />
                Safety Tips
              </h3>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>Never pay in advance without visiting the property.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>Verify property documents in person with the owner.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>Meet the owner in a public place for the first time.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-[var(--border)] bg-[var(--navbar-bg)] p-4 backdrop-blur-xl md:hidden">
        <div className="flex gap-3">
          <button 
            onClick={() => handleContactClick('call')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-sm font-bold text-black active:scale-95"
          >
            <Phone size={18} />
            <span>Call</span>
          </button>
          <button 
            onClick={() => handleContactClick('message')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-4 text-sm font-bold text-[var(--text-primary)] active:scale-95"
          >
            <MessageSquare size={18} />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Privacy Warning Modal */}
      <AnimatePresence>
        {showPrivacyWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyWarning(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-2xl"
            >
              <div className="mb-6 flex justify-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                  warningType === 'DND' ? 'bg-red-500/10 text-red-500' : 
                  warningType === 'ONLY_MESSAGE' ? 'bg-indigo-500/10 text-indigo-500' : 
                  'bg-brand/10 text-brand'
                }`}>
                  {warningType === 'DND' && <Calendar size={32} />}
                  {warningType === 'ONLY_MESSAGE' && <MessageSquare size={32} />}
                  {warningType === 'DISCLOSURE' && <Info size={32} />}
                </div>
              </div>

              <h3 className="mb-2 text-center text-xl font-bold text-[var(--text-primary)]">
                {warningType === 'DND' && 'Owner is Busy'}
                {warningType === 'ONLY_MESSAGE' && 'Messages Only'}
                {warningType === 'DISCLOSURE' && 'Owner Preferences'}
              </h3>

              <div className="mb-8 text-center text-sm text-[var(--text-secondary)]">
                {warningType === 'DND' && (
                  <div className="space-y-3">
                    <p className="text-base font-bold text-red-500">
                      Owner is not accepting calls due to "{owner?.privacy?.doNotDisturb?.reason}"
                    </p>
                    <p>Please try again some other time or leave a WhatsApp message.</p>
                    {owner?.privacy?.doNotDisturb?.mode === 'SCHEDULED' && (
                      <p className="text-[10px] italic opacity-50">
                        Scheduled until {owner?.privacy?.doNotDisturb?.endTime}
                      </p>
                    )}
                  </div>
                )}
                {warningType === 'ONLY_MESSAGE' && (
                  <p>The owner is currently not accepting calls. Please reach out via WhatsApp message instead.</p>
                )}
                {warningType === 'DISCLOSURE' && (
                  <div className="space-y-4 text-left">
                    <p className="font-medium text-brand leading-relaxed">
                      {owner?.privacy?.preDisclosure?.message || "Please agree to the following terms before contacting:"}
                    </p>
                    {owner?.privacy?.preDisclosure?.options && owner.privacy.preDisclosure.options.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {owner.privacy.preDisclosure.options.map((opt: string) => (
                          <span key={opt} className="rounded-lg bg-[var(--bg)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-secondary)] border border-[var(--border)]">
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {warningType === 'DISCLOSURE' ? (
                  <button 
                    onClick={() => {
                      setDisclosureAccepted(true);
                      setShowPrivacyWarning(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-black transition-transform active:scale-95"
                  >
                    <CheckCircle2 size={18} />
                    <span>Accept & Continue</span>
                  </button>
                ) : null}
                
                <button 
                  onClick={() => setShowPrivacyWarning(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg)] py-4 font-bold text-[var(--text-primary)] transition-transform active:scale-95"
                >
                  <span>{warningType === 'DISCLOSURE' ? 'Cancel' : 'Close'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

