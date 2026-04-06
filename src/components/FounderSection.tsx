import React, { useState, useEffect } from 'react';
import { QrCode, Phone, MapPin, ShieldCheck, Zap, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const slides = [
  {
    type: 'FOUNDER',
    title: 'A Message from our Founder',
    content: '"I struggled to find a home too. Even with modern apps, I couldn\'t afford memberships just to get owner details, and I was tired of fake broker listings. I decided to introduce \'smart tolet boards\' which will help both owners and finders to avoid the brokers charges, fake listing and affordability."',
    author: 'Founder, ToLetBro',
    subtext: 'Connecting Hearts & Homes',
    icon: <Quote className="text-brand" size={32} />,
    color: 'bg-brand/10'
  },
  {
    type: 'FEATURE',
    title: 'Smart Tolet Boards',
    content: 'The physical board you trust, now with digital power. Look for the QR code on buildings to get instant details.',
    icon: <QrCode className="text-brand" size={32} />,
    color: 'bg-brand/10'
  },
  {
    type: 'FEATURE',
    title: 'Scan & Connect',
    content: 'Quickly scan the QR to see details, call the owner, and deal directly. No middlemen, no brokerage.',
    icon: <Phone className="text-brand" size={32} />,
    color: 'bg-blue-500/10'
  },
  {
    type: 'FEATURE',
    title: 'Find Nearby Tolets',
    content: 'Scan any Smart Board to instantly discover more verified tolets in the same neighborhood.',
    icon: <MapPin className="text-brand" size={32} />,
    color: 'bg-emerald-500/10'
  },
  {
    type: 'FEATURE',
    title: 'Zero Fake Listings',
    content: 'No more broker spam or outdated ads. Every board represents a real, available property verified on-site.',
    icon: <ShieldCheck className="text-brand" size={32} />,
    color: 'bg-purple-500/10'
  },
  {
    type: 'FEATURE',
    title: 'Absolutely Free',
    content: 'No memberships, no pay-to-view. Connecting owners and finders is always free on ToLetBro.',
    icon: <Zap className="text-brand" size={32} />,
    color: 'bg-orange-500/10'
  }
];

export const FounderSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="py-24 px-6 bg-[var(--bg)]">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[3rem] border border-[var(--border)] bg-[var(--card-bg)] p-8 md:p-16 shadow-2xl">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand/5 blur-[80px]"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl ${slides[currentSlide].color} shadow-inner`}>
                {slides[currentSlide].icon}
              </div>
              
              <h3 className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-brand">
                {slides[currentSlide].type === 'FOUNDER' ? 'Founder Note' : 'Feature Highlight'}
              </h3>
              
              <h2 className="mb-8 text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
                {slides[currentSlide].title}
              </h2>
              
              <p className={`mb-10 text-lg leading-relaxed text-[var(--text-secondary)] md:text-xl ${slides[currentSlide].type === 'FOUNDER' ? 'italic font-medium' : ''}`}>
                {slides[currentSlide].content}
              </p>
              
              {slides[currentSlide].author && (
                <div className="flex flex-col items-center">
                  <div className="mb-4 h-1 w-12 rounded-full bg-brand/30"></div>
                  <p className="font-bold text-[var(--text-primary)]">{slides[currentSlide].author}</p>
                  <p className="text-xs uppercase tracking-widest text-brand/60">{slides[currentSlide].subtext}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-center gap-8">
            <button 
              onClick={prevSlide}
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] transition-all hover:border-brand hover:bg-brand/5"
            >
              <ChevronLeft size={20} className="text-[var(--text-secondary)] transition-colors group-hover:text-brand" />
            </button>
            
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-brand' : 'w-2 bg-[var(--border)]'}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextSlide}
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] transition-all hover:border-brand hover:bg-brand/5"
            >
              <ChevronRight size={20} className="text-[var(--text-secondary)] transition-colors group-hover:text-brand" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
