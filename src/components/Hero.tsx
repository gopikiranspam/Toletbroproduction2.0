import React from 'react';
import { Search, MapPin, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

export const Hero: React.FC = () => {
  return (
    <section className="relative flex min-h-[30vh] md:min-h-[50vh] items-center justify-center overflow-hidden px-6 pt-6 md:pt-10 pb-8 md:pb-16">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600607687940-4e524cb35a3a?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Home"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover opacity-30 dark:opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/20 to-[var(--bg)]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-6xl text-[var(--text-primary)] leading-[1.2]">
            Find the nearest, <br />
            <span className="text-brand italic serif">rent house</span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-[11px] leading-relaxed md:text-base text-[var(--text-secondary)] opacity-90">
            We invented smart tolet boards to eliminates fake and broker listings
          </p>
        </motion.div>
      </div>
    </section>
  );
};
