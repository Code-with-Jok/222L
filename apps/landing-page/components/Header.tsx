"use client";

import imgLogo from "@/public/vercel.svg";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <nav className="fixed top-2 sm:top-6 left-1/2 -translate-x-1/2 w-11/12 sm:w-10/12 max-w-7xl z-nav flex items-center justify-between px-6 sm:px-10 py-3 sm:py-4 glass-nav rounded-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center p-2 icon-glow-orange">
          <Image
            width={100}
            height={100}
            src={imgLogo.src}
            alt="Logo"
            className="w-full! h-full! invert opacity-100"
          />
        </div>
        <span className="text-text-primary font-display font-black text-base uppercase tracking-widest hidden sm:block">
          Roadmap <span className="text-brand-primary">Hub</span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-10">
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="#"
            className="text-text-muted hover:text-text-primary text-base font-body font-medium uppercase tracking-wide transition-all duration-base"
          >
            Explore
          </Link>
          <Link
            href="#"
            className="text-text-muted hover:text-text-primary text-base font-body font-medium uppercase tracking-wide transition-all duration-base"
          >
            Curations
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button className="btn-ghost px-6 py-2.5 rounded-lg text-base font-body font-medium uppercase tracking-wide">
            Sign In
          </button>
          <button className="btn-primary px-8 py-3 rounded-full text-base font-body font-black uppercase tracking-wide active:scale-95">
            Join Now
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
