import HeroBackground from "@/components/HeroBackground";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { prisma } from "@repo/db";

// export default function Home() {
//   return (
//     <div className="relative min-h-screen w-full overflow-x-hidden">
//       <HeroBackground />
//       <Header />
//       <HeroSection />
//     </div>
//   );
// }

export default async function Home() {
  const user = await prisma.user.findFirst();
  return <div>{user?.name ?? "No user added yet"}</div>;
}
