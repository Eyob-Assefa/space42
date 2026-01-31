import Link from 'next/link';
import Image from 'next/image';

const flashCards = [
  { title: "Missions", icon: "🚀", link: "/missions", desc: "Our current orbital projects." },
  { title: "Achievements", icon: "🏆", link: "/achievements", desc: "Milestones in space tech." },
  { title: "Testimony", icon: "💬", link: "/testimony", desc: "Voices from the station." },
  { title: "Opportunities", icon: "🛰️", link: "/jobs", desc: "Your seat is waiting." },
];

export default function WhySpace42() {
  return (
    <main className="min-h-screen bg-transparent text-white overflow-y-auto custom-scrollbar">
      {/* 1. Header Navigation */}
      <nav className="fixed top-0 w-full p-8 z-50 flex justify-between items-center backdrop-blur-md bg-black/10">
        <Link href="/" className="group flex items-center gap-2 font-black tracking-tighter text-2xl">
          <span className="text-blue-500 group-hover:scale-110 transition-transform">←</span> ABANDON MISSION
        </Link>
      </nav>

      {/* 2. Hero Section: Large Text & Visual Focus */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-[120px] font-black leading-none tracking-tighter animate-pulse">
          BEYOND <br/> <span className="text-blue-500 text-[140px]">LIMITS.</span>
        </h1>
        <p className="mt-6 text-2xl font-light tracking-[0.3em] text-blue-200 uppercase">
          Humanity's Next Command Center
        </p>
      </section>

      {/* 3. Visual Feature Section (Less Words, More Impact) */}
      <section className="max-w-7xl mx-auto py-24 px-6 space-y-32">
        
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 glass-card p-2 overflow-hidden rounded-3xl h-[400px] relative">
            <Image src="/assets/why-1.jpg" alt="Neural Net" fill className="object-cover opacity-80" />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-5xl font-black">AI Orchestration</h2>
            <p className="text-xl text-gray-400 font-light">We don't just match resumes; we synchronize destinies using RAG-based neural architectures.</p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1 glass-card p-2 overflow-hidden rounded-3xl h-[400px] relative">
            <Image src="/assets/why-2.jpg" alt="Deep Space" fill className="object-cover opacity-80" />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-5xl font-black">Orbital Culture</h2>
            <p className="text-xl text-gray-400 font-light">Work from anywhere in the galaxy. Our digital headquarters is designed for total immersion.</p>
          </div>
        </div>
      </section>

      {/* 4. Bottom Flash Cards Section */}
      <section className="max-w-7xl mx-auto py-32 px-6">
        <h2 className="text-3xl font-black mb-12 tracking-widest text-center uppercase text-blue-400">Expand Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashCards.map((card, i) => (
            <Link href={card.link} key={i} className="group">
              <div className="glass-card p-8 h-64 flex flex-col justify-between hover:border-blue-500 transition-all hover:-translate-y-2 cursor-pointer bg-white/5 hover:bg-white/10">
                <span className="text-4xl">{card.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors">{card.title}</h3>
                  <p className="text-sm text-gray-400 mt-2">{card.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Padding for ChatBot overlap */}
      <div className="h-32" />
    </main>
  );
}