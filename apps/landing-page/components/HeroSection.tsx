"use client";

import { motion } from "framer-motion";
import { Compass, Palette, Soup, Flame, ArrowRight } from "lucide-react";

const roadmapCards = [
  {
    title: "Web Engineering",
    desc: "Build scalable, modern digital architectures",
    accentClass: "text-brand-primary",
    iconClass: "text-brand-primary",
    icon: Compass,
    badge: "MOST POPULAR",
    floatDuration: 5,
    delay: 0.1,
  },
  {
    title: "Artistic Vision",
    desc: "Master the secrets of divine composition",
    accentClass: "text-brand-secondary",
    iconClass: "text-brand-secondary",
    icon: Palette,
    badge: "TRENDING",
    floatDuration: 6,
    delay: 0.2,
  },
  {
    title: "Culinary Arts",
    desc: "The science and soul of fine gastronomy",
    accentClass: "text-brand-primary",
    iconClass: "text-brand-primary",
    icon: Soup,
    badge: "NEW PATH",
    floatDuration: 7,
    delay: 0.3,
  },
];

const HeroSection = () => {
  return (
    <div className="relative z-content w-full min-h-screen pt-32 sm:pt-40 pb-20 flex flex-col items-center overflow-x-hidden">
      <div className="flex flex-col items-center text-center px-6 max-w-6xl w-full">
        <motion.h1
          className="font-display font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight mb-12 leading-tight sm:leading-snug drop-shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <span
            className="text-text-primary block sm:inline"
            style={{ textShadow: "var(--shadow-text-dreams)" }}
          >
            Achieve Your Dreams
          </span>{" "}
          <span className="text-brand-primary drop-shadow-lg headline-clarity headline-stroke block sm:inline">
            with Clarity
          </span>
        </motion.h1>

        <div className="w-full mt-0">
          <div className="flex flex-col items-center gap-6 mb-20">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-4 px-8 py-4 rounded-full badge-popular-roadmaps"
            >
              <Flame className="w-5 h-5 text-brand-primary fill-current icon-glow-orange" />
              <h2 className="font-display text-text-primary font-bold text-sm sm:text-lg uppercase tracking-widest">
                Popular Roadmaps
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-2 sm:px-4 items-stretch">
            {roadmapCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  delay: 0.2 + card.delay,
                  duration: 1,
                  ease: [0.16, 1, 0.3, 1],
                  y: {
                    duration: card.floatDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="glass-surface group relative p-8 rounded-2xl flex flex-col items-start text-left h-full"
              >
                {/* Visual Flair: Highlight adapted for light theme */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-slow" />
                </div>

                {/* Badge: Soft orange tint cream */}
                <div className="absolute top-6 right-6 px-4 py-2 badge rounded-full text-xs uppercase tracking-widest pointer-events-none">
                  {card.badge}
                </div>

                {/* Icon Container: Soft orange background tint */}
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl transition-transform duration-base group-hover:scale-110 group-hover:rotate-6 mb-8 icon-container-glow">
                  <card.icon
                    className={`w-8 h-8 ${card.iconClass}`}
                    strokeWidth={2.5}
                  />
                </div>

                <div className="flex flex-grow flex-col gap-4 mb-10">
                  <h3 className="font-display font-bold text-2xl tracking-tight text-text-primary group-hover:text-brand-primary transition-colors duration-fast">
                    {card.title}
                  </h3>
                  <p className="font-body text-text-muted text-sm leading-relaxed font-semibold">
                    {card.desc}
                  </p>
                </div>

                {/* Outline Primary Button */}
                <button className="mt-auto w-full flex items-center justify-between gap-4 px-6 py-4 border-[1.5px] border-brand-primary rounded-full text-[10px] font-body font-bold uppercase tracking-widest text-brand-primary bg-transparent transition-all duration-base hover:bg-brand-primary/8 hover:border-brand-primary-hover group/btn">
                  <span>Start Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-fast" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
