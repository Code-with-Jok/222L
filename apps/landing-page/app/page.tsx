import HeroBackground from "@/components/HeroBackground";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <HeroBackground />
      <Header />
      <HeroSection />
    </div>
  );
}
