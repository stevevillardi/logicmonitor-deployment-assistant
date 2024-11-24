import CollectorCalculator from './components/CollectorCalculator/index';
import { Footer } from './components/CollectorCalculator/components/Footer';
import { SpeedInsights } from "@vercel/speed-insights/next"
export default function Home() {
  return (
    <div className="min-h-screen bg-[#040F4B] flex flex-col">
      <main className="flex-grow p-8">
        <SpeedInsights />
        <CollectorCalculator />
      </main>
      <Footer />
    </div>
  );
}
