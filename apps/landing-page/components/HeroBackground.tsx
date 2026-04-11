import imgHero from "@/public/roadmap-hero.webp";
import Image from "next/image";

const HeroBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-background bg-background overflow-hidden">
      <Image
        src={imgHero.src}
        alt="Hero Background"
        className="w-full h-full object-cover scale-105 pointer-events-none"
        fill
      />
    </div>
  );
};

export default HeroBackground;
