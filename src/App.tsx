/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchSection } from './components/SearchSection';
import { PropertyCard } from './components/PropertyCard';
import { FilterBar } from './components/FilterBar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { MobileTabs } from './components/MobileTabs';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2, MapPin, Sparkles, Compass, ChevronRight, ChevronLeft } from 'lucide-react';
import { Property } from './types';
import { api, testConnection } from './services/api';
import { mapsService } from './services/mapsService';
import { FilterModal, FilterState, SortOption } from './components/FilterModal';
import { SlidersHorizontal, AlertCircle } from 'lucide-react';
import { useRef } from 'react';

// Pages
import { QRSetupPage } from './pages/QRSetupPage';
import { OwnerListingsPage } from './pages/OwnerListingsPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { SearchPage } from './pages/SearchPage';
import { OwnerQRDashboard } from './pages/OwnerQRDashboard';
import { AdminQRPanel } from './pages/AdminQRPanel';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ScannerPage } from './pages/ScannerPage';
import { QRResolverPage } from './pages/QRResolverPage';
import { ListProperty } from './pages/ListProperty';
import { Dashboard } from './pages/Dashboard';
import { FavoritesPage } from './pages/FavoritesPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from './components/SEO';
import { LegalPage } from './pages/LegalPage';
import { AboutUsPage } from './pages/AboutUsPage';

const HomePage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [viewAllNearby, setViewAllNearby] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    rentRange: [0, 200000],
    distanceRange: 50,
    bhkTypes: [],
    propertyTypes: ['All'],
    locality: '',
    sortBy: 'recommended'
  });

  const { user } = useAuth();
  const nearbyScrollRef = useRef<HTMLDivElement>(null);
  const recommendedScrollRef = useRef<HTMLDivElement>(null);
  const suggestedScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'OWNER') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Test connection first
        console.log("Testing Firestore connection...");
        await testConnection();
        console.log("Connection successful. Fetching properties...");
        
        const data = await api.getProperties();
        console.log(`Fetched ${data.length} properties.`);
        setProperties(data);
        
        // Try to get nearby properties on load
        try {
          // Use a timeout to not block the initial render
          setTimeout(async () => {
            try {
              const pos = await mapsService.getCurrentLocation();
              const nearby = await api.getNearbyProperties(pos.coords.latitude, pos.coords.longitude, 50);
              setNearbyProperties(nearby);
            } catch (err) {
              console.log("Initial nearby search failed:", err);
            }
          }, 1000);
        } catch (err) {
          console.log("Initial nearby search setup failed:", err);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
        if (err instanceof Error && err.message.includes('offline')) {
          setConnectionError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNearbySearch = async (radius?: number) => {
    setNearbyLoading(true);
    const searchRadius = radius || 50;
    try {
      const pos = await mapsService.getCurrentLocation();
      const nearby = await api.getNearbyProperties(pos.coords.latitude, pos.coords.longitude, searchRadius);
      setNearbyProperties(nearby);
      
      if (nearby.length > 0) {
        // Use a small delay to ensure the section is rendered before scrolling
        setTimeout(() => {
          const element = document.getElementById('nearby-section');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        alert(`No properties found within ${searchRadius}km of your location.`);
      }
    } catch (err) {
      console.error("Nearby search failed:", err);
      alert("Could not get your location. Please ensure GPS is enabled and permissions are granted.");
    } finally {
      setNearbyLoading(false);
    }
  };

  const suggestedProperties = useMemo(() => {
    return properties.filter(p => p.isFeatured).slice(0, 6);
  }, [properties]);

  const filteredNearbyProperties = useMemo(() => {
    let result = [...nearbyProperties];

    // Apply Filters
    result = result.filter(p => {
      const rent = p.rent || 0;
      const matchesRent = rent >= filters.rentRange[0] && rent <= filters.rentRange[1];
      const matchesBHK = filters.bhkTypes.length === 0 || filters.bhkTypes.includes(p.bhkType as any);
      const matchesType = filters.propertyTypes.includes('All') || filters.propertyTypes.includes(p.type as any);
      const matchesLocality = !filters.locality || 
        p.area.toLowerCase().includes(filters.locality.toLowerCase()) ||
        p.city.toLowerCase().includes(filters.locality.toLowerCase());
      
      return matchesRent && matchesBHK && matchesType && matchesLocality;
    });

    // Apply Sorting
    switch (filters.sortBy) {
      case 'price-low-high':
        result.sort((a, b) => (a.rent || 0) - (b.rent || 0));
        break;
      case 'price-high-low':
        result.sort((a, b) => (b.rent || 0) - (a.rent || 0));
        break;
      case 'distance':
        // Assuming distance is available, if not sort by ID or something
        // For now, let's assume api returns distance
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'recommended':
      default:
        // No specific sort for recommended, keep as is
        break;
    }

    return result;
  }, [nearbyProperties, filters]);

  const recommendedProperties = useMemo(() => {
    // Properties in other locations (not Hyderabad if nearby is Hyderabad)
    // For now just random ones not in nearby
    const nearbyIds = new Set(nearbyProperties.map(p => p.id));
    return properties.filter(p => !nearbyIds.has(p.id)).slice(0, 6);
  }, [properties, nearbyProperties]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-brand" />
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Loading Masterpieces...</p>
        </div>
      </div>
    );
  }

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "TOLETBRO",
    "legalName": "ToletBro Technologies",
    "url": "https://toletbro.com",
    "logo": "https://toletbro.com/favicon.svg",
    "description": "Find houses for rent near you without broker. We invented smart tolet boards, Just Scan QR to view all nearby To-Let properties instantly.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot No.34, Central Bank Colony, LB Nagar",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "postalCode": "500074",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-8500482405",
      "contactType": "customer service",
      "email": "support@toletbro.com"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "17.3850",
      "longitude": "78.4867"
    }
  };

  return (
    <main className="pb-20 md:pb-0">
      <SEO 
        title="TOLETBRO | Smart Tolet Boards & Direct Rentals in Hyderabad"
        description="Find houses for rent near you without broker. We invented smart tolet boards, Just Scan QR to view all nearby To-Let properties instantly."
        canonical={window.location.origin}
        schema={homeSchema}
      />
      
      {connectionError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3">
          <div className="mx-auto max-w-7xl flex items-center gap-3 text-red-500">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">
              Could not connect to the database. Please ensure Firebase is correctly set up.
            </p>
          </div>
        </div>
      )}

      <Hero />
      <SearchSection onNearbySearch={handleNearbySearch} isNearbyLoading={nearbyLoading} />

      <div className="mx-auto max-w-7xl px-6 py-20 space-y-24">
        {/* Nearby Properties Section */}
        {nearbyProperties.length > 0 && (
          <section id="nearby-section" className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between md:justify-start gap-2 text-brand">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Local Discovery</span>
                  </div>
                  {/* Mobile View All Button */}
                  <button 
                    onClick={() => setViewAllNearby(!viewAllNearby)}
                    className="flex md:hidden items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand hover:underline"
                  >
                    {viewAllNearby ? 'Less' : 'View All'}
                    <ChevronRight size={12} className={viewAllNearby ? 'rotate-90' : ''} />
                  </button>
                </div>
                <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-[var(--text-primary)]">
                  Properties <span className="text-brand">Nearby</span> You
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Exclusive listings within 50km of your current location.</p>
                
                {/* Mobile Filter Button - Placed after text, aligned to right */}
                <div className="mt-4 flex md:hidden justify-end">
                  <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-5 py-2.5 text-xs font-bold text-brand transition-all active:scale-95 shadow-xl shadow-brand/10"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-3">
                {/* Desktop Scroll Buttons */}
                <div className="hidden md:flex items-center gap-2 mr-4">
                  <button 
                    onClick={() => scroll(nearbyScrollRef, 'left')}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => scroll(nearbyScrollRef, 'right')}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                {/* Desktop Filter Button */}
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="hidden md:flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] transition-all hover:border-brand/50"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
                {/* Desktop View All Button */}
                <button 
                  onClick={() => setViewAllNearby(!viewAllNearby)}
                  className="hidden md:flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition-all hover:bg-brand/20"
                >
                  {viewAllNearby ? 'Show Less' : 'View All'}
                  <ChevronRight size={16} className={viewAllNearby ? 'rotate-90' : ''} />
                </button>
              </div>
            </div>

            {viewAllNearby ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {filteredNearbyProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div 
                ref={nearbyScrollRef}
                className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0 scroll-smooth"
              >
                {filteredNearbyProperties.map((property) => (
                  <div key={property.id} className="w-[280px] flex-shrink-0 md:w-[320px]">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}
            
            {filteredNearbyProperties.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-[var(--text-secondary)]">No properties match your current filters.</p>
                <button 
                  onClick={() => setFilters({
                    rentRange: [0, 200000],
                    distanceRange: 50,
                    bhkTypes: [],
                    propertyTypes: ['All'],
                    locality: '',
                    sortBy: 'recommended'
                  })}
                  className="mt-4 text-xs font-bold text-brand hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        )}

        {/* Recommended Properties Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-brand">
                <Compass size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Global Reach</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-[var(--text-primary)]">
                Recommended <span className="text-brand">Locations</span>
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Explore premium properties in other prestigious areas.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Desktop Scroll Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={() => scroll(recommendedScrollRef, 'left')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll(recommendedScrollRef, 'right')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              {/* Desktop View All Button */}
              <button 
                onClick={() => navigate('/search/all')}
                className="hidden md:flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition-all hover:bg-brand/20"
              >
                View All
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div 
            ref={recommendedScrollRef}
            className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0 scroll-smooth"
          >
            {recommendedProperties.map((property) => (
              <div key={property.id} className="w-[280px] flex-shrink-0 md:w-[320px]">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>

        {/* Suggested Properties Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-brand">
                <Sparkles size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Curated for You</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl text-[var(--text-primary)]">
                Suggested <span className="text-brand">Masterpieces</span>
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Hand-picked luxury properties matching your sophisticated taste.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Desktop Scroll Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <button 
                  onClick={() => scroll(suggestedScrollRef, 'left')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll(suggestedScrollRef, 'right')}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-all hover:border-brand hover:text-brand"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              {/* Desktop View All Button */}
              <button 
                onClick={() => navigate('/search/featured')}
                className="hidden md:flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-2 text-xs font-bold text-brand transition-all hover:bg-brand/20"
              >
                View All
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div 
            ref={suggestedScrollRef}
            className="no-scrollbar -mx-6 flex gap-6 overflow-x-auto px-6 pb-4 md:mx-0 md:px-0 scroll-smooth"
          >
            {suggestedProperties.map((property) => (
              <div key={property.id} className="w-[280px] flex-shrink-0 md:w-[320px]">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-8 py-16 text-black md:px-12 md:py-20">
            <div className="relative z-10 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">
                  Ready to find your <br /> next masterpiece?
                </h2>
                <p className="mb-10 text-base font-medium opacity-70 md:text-lg">
                  Our expert agents are ready to guide you through the exclusive world of luxury real estate.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="rounded-2xl bg-black px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-105">
                    Contact an Agent
                  </button>
                  <button 
                    onClick={() => navigate('/list-property')}
                    className="rounded-2xl border-2 border-black/10 px-8 py-4 text-sm font-bold transition-transform hover:scale-105"
                  >
                    List Your Property
                  </button>
                </div>
              </div>
              <div className="relative hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6199f7d009?auto=format&fit=crop&q=80&w=1000" 
                  alt="Luxury Interior"
                  referrerPolicy="no-referrer"
                  className="rounded-3xl shadow-2xl"
                />
              </div>
            </div>
            {/* Abstract background shapes */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-black/5 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          </div>
        </section>
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setIsFilterModalOpen(false);
          // If distance changed, we might want to re-trigger the search
          if (newFilters.distanceRange !== filters.distanceRange) {
            handleNearbySearch(newFilters.distanceRange);
          }
        }}
        initialFilters={filters}
      />
    </main>
  );
};

const AppLayout = () => {
  const { authModal, openAuth, closeAuth } = useAuth();

  useEffect(() => {
    // Silently request GPS permission on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => console.log("GPS permission granted"),
        () => console.log("GPS permission denied"),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] selection:bg-brand selection:text-black transition-colors duration-300">
      <Navbar onOpenAuth={() => openAuth('USER')} />
      
      <Outlet />

      <Footer />
      
      <MobileTabs onOpenAuth={() => openAuth('USER')} />
      
      <AnimatePresence>
        {authModal.isOpen && (
          <AuthModal 
            isOpen={authModal.isOpen} 
            onClose={closeAuth} 
            mode={authModal.mode}
          />
        )}
      </AnimatePresence>

      {/* Global hidden reCAPTCHA container */}
      <div id="recaptcha-container" className="recaptcha-container"></div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/scan/:qrId", element: <QRResolverPage /> },
      { path: "/link-qr/:qrId", element: <QRSetupPage /> },
      { path: "/owner-properties/:ownerId", element: <OwnerListingsPage /> },
      { path: "/property/:propertySlugId", element: <PropertyDetailsPage /> },
      { path: "/search/:city", element: <SearchPage /> },
      { path: "/search/:city/:area", element: <SearchPage /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/dashboard/qr", element: <OwnerQRDashboard /> },
      { path: "/favorites", element: <FavoritesPage /> },
      { path: "/admin/qr", element: <AdminQRPanel /> },
      { path: "/scan", element: <ScannerPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/privacy-controls", element: <PrivacyPage /> },
      { path: "/list-property", element: <ListProperty /> },
      { path: "/about-us", element: <AboutUsPage /> },
      { path: "/privacy-policy", element: <LegalPage type="privacy" /> },
      { path: "/terms-of-service", element: <LegalPage type="terms" /> },
      { path: "/refund-policy", element: <LegalPage type="refund" /> },
      { path: "/cancellation-policy", element: <LegalPage type="cancellation" /> },
      { path: "/shipping-policy", element: <LegalPage type="shipping" /> },
    ]
  }
]);

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
