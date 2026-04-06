import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Target, Users, Mail, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export const AboutUsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white py-20 px-6 text-black">
      <SEO 
        title="About Us | TOLETBRO"
        description="The story behind TOLETBRO - Solving the struggle of finding direct rentals in metropolitan cities."
      />
      
      <div className="mx-auto max-w-4xl">
        <button 
          onClick={() => navigate(-1)}
          className="mb-12 flex items-center gap-2 text-sm font-bold hover:underline"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-20"
        >
          {/* Header */}
          <div className="border-b border-black pb-8">
            <h1 className="text-4xl font-bold tracking-tighter md:text-8xl">
              About <span className="italic">Us</span>
            </h1>
            <p className="mt-4 text-sm font-medium uppercase tracking-widest text-gray-500">Scan. See. Decide.</p>
          </div>

          {/* Desktop Version Content */}
          <div className="hidden md:block space-y-16">
            <section className="space-y-8">
              <p className="text-2xl font-medium leading-tight tracking-tight md:text-3xl">
                ToletBro is a modern property listing platform designed to simplify the way people find rental homes in metropolitan cities. Our mission is to make house hunting faster, smarter, and more transparent for both tenants and property owners.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-base leading-relaxed text-gray-800 md:text-lg">
                <div className="space-y-6">
                  <p>
                    The idea of ToletBro started from a real problem. While searching for rental houses nearby, we faced common challenges such as paying broker fees, dealing with platform charges, and making multiple calls just to get basic property details like rent, advance, and availability. In many cases, we had to visit properties physically without knowing if they met our requirements.
                  </p>
                  <p>
                    To solve this problem, we introduced <span className="font-bold text-black underline decoration-2 underline-offset-4">Smart To-Let Boards</span> powered by QR codes. With this system, tenants can scan a QR code placed outside a property and instantly access complete property details including images, rent, and specifications. This eliminates unnecessary calls and saves time for both tenants and owners.
                  </p>
                </div>
                <div className="space-y-6">
                  <p>
                    For tenants, ToletBro provides a faster and more efficient way to discover rental properties without repeated discussions. For property owners, it reduces unwanted calls and ensures that only serious and interested tenants reach out.
                  </p>
                  <p>
                    Unlike traditional platforms such as NoBroker, we do not position ourselves with misleading claims. We built ToletBro to genuinely support tenants who struggle to find rental homes in cities. Our platform operates with minimal charges, focusing on value rather than profit.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-black text-white rounded-[3rem] p-16 space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold tracking-tight italic">Our Vision</h2>
                <p className="text-2xl leading-relaxed opacity-90">
                  To transform traditional To-Let boards into smart digital tools that improve the rental experience for everyone.
                </p>
              </div>

              <div className="pt-12 border-t border-white/20 space-y-8">
                <h3 className="text-2xl font-bold uppercase tracking-widest text-brand">Our Products & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold">Smart Tolet Boards</h4>
                    <p className="text-sm opacity-80">Physical QR-enabled boards for property visibility. Just scan to view details.</p>
                    <p className="text-brand font-bold">₹499 - ₹999</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold">Promote Option</h4>
                    <p className="text-sm opacity-80">Featured listing services to increase property visibility to more tenants.</p>
                    <p className="text-brand font-bold">₹199 - ₹499</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold">Premium Features</h4>
                    <p className="text-sm opacity-80">Advanced dashboard tools, analytics, and priority support for owners.</p>
                    <p className="text-brand font-bold">₹99 - ₹299 / mo</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Mobile Version Content */}
          <div className="block md:hidden space-y-12">
            <section className="space-y-8 text-lg leading-relaxed">
              <p className="font-bold text-xl tracking-tight">
                Finding a rental house shouldn’t be stressful — but it often is.
              </p>
              
              <p className="text-gray-700">
                I personally struggled to find “tolets near me.” Every time, I had to call multiple owners, ask the same questions (rent, advance, availability), and visit houses just to see basic details. On top of that, broker fees and platform charges made it even worse.
              </p>

              <div className="py-8 border-y border-black/10">
                <p className="italic text-xl font-medium">
                  That’s when the idea of ToletBro was born.
                </p>
              </div>

              <p className="text-gray-700">
                We introduced <span className="font-bold text-black">Smart To-Let Boards with QR codes</span> — where tenants can simply scan and view full property details before calling. This saves time, reduces unnecessary calls, and connects only serious tenants with owners.
              </p>

              <div className="bg-gray-50 p-8 rounded-3xl space-y-8">
                <div className="space-y-4">
                  <p className="font-bold">
                    We don’t call ourselves “NoBroker” like others who still charge like brokers.
                  </p>
                  <p className="text-gray-600 text-sm">
                    We built this to help struggling tenants in metropolitan cities — with very minimal charges.
                  </p>
                </div>

                <div className="pt-8 border-t border-black/5 space-y-6">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-gray-400">Products & Services</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-sm">Smart Tolet Boards</p>
                        <p className="text-xs text-gray-500">Physical QR Boards</p>
                      </div>
                      <p className="text-brand font-bold text-sm">₹499+</p>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-sm">Promote Option</p>
                        <p className="text-xs text-gray-500">Featured Listings</p>
                      </div>
                      <p className="text-brand font-bold text-sm">₹199+</p>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-bold text-sm">Premium Features</p>
                        <p className="text-xs text-gray-500">Advanced Tools</p>
                      </div>
                      <p className="text-brand font-bold text-sm">₹99/mo</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-8">
                <p className="text-3xl font-bold tracking-tighter italic">Scan. See. Decide.</p>
                <p className="mt-4 font-bold">— ToletBro Team</p>
              </div>
            </section>
          </div>

          {/* Common Founder Section */}
          <section id="contact" className="pt-20 border-t border-black">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="space-y-6 flex-1">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Company & Founder</p>
                  <h3 className="text-3xl font-bold tracking-tight md:text-4xl">Gopikiran Cherukupally</h3>
                </div>
                
                <div className="space-y-4">
                  <a 
                    href="tel:+918500482405" 
                    className="flex items-center gap-3 text-lg font-medium hover:underline md:text-xl"
                  >
                    <Users size={24} />
                    <span>+91 8500482405</span>
                  </a>
                  <a 
                    href="mailto:support@toletbro.com" 
                    className="flex items-center gap-3 text-lg font-medium hover:underline md:text-xl"
                  >
                    <Mail size={24} />
                    <span>support@toletbro.com</span>
                  </a>
                </div>
              </div>
              
              <div className="hidden md:block w-px h-48 bg-black/10 self-center" />

              <div className="flex-1 space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Tagline</p>
                <p className="text-4xl font-bold tracking-tighter italic md:text-5xl">ToletBro – Scan. See. Decide.</p>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

