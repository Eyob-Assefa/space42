import Link from 'next/link';
import Image from 'next/image';

const flashCards = [
  // UPDATE: Replaced icons with image paths. 
  // Make sure these images exist in your /public/assets folder!
  { 
    title: "Missions", 
    image: "/assets/missons.png", // Ensure this file exists
    link: "/missions", 
    desc: "Our current orbital projects." 
  },
  { 
    title: "Achievements", 
    image: "/assets/achievment.png", // Using existing asset as placeholder
    link: "/achievements", 
    desc: "Milestones in space tech." 
  },
  { 
    title: "Testimony", 
    image: "/assets/testimon.png", // Using existing asset as placeholder
    link: "/testimony", 
    desc: "Voices from the station." 
  },
  { 
    title: "Opportunities", 
    image: "/assets/opps.png", // Ensure this file exists
    link: "/jobs", 
    desc: "Your seat is waiting." 
  },
];

export default function WhySpace42() {
  return (
    <main className="min-h-screen bg-transparent text-white overflow-y-auto custom-scrollbar">
      
      {/* 1. Header Navigation */}
      {/* Positioned top-left. The global header (if fixed) should hide its logo on this page. */}
      <nav className="fixed top-0 left-0 p-8 z-50 flex items-center backdrop-blur-none">
        <Link href="/" className="group flex items-center gap-3 font-black tracking-tighter text-xl md:text-2xl bg-black/40 px-6 py-3 rounded-full border border-white/10 hover:border-blue-500 hover:bg-black/60 transition-all">
          <span className="text-blue-500 group-hover:-translate-x-1 transition-transform">←</span> 
          <span>ABANDON MISSION</span>
        </Link>
      </nav>

      {/* 2. Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-[120px] font-black leading-none tracking-tighter animate-pulse drop-shadow-[0_0_50px_rgba(59,130,246,0.5)]">
          BEYOND <br/> <span className="text-blue-500 text-[140px]">LIMITS.</span>
        </h1>
        <p className="mt-6 text-2xl font-light tracking-[0.3em] text-blue-200 uppercase">
          Humanity's Next Command Center
        </p>
      </section>

      {/* 3. Visual Feature Section */}
      <section className="max-w-7xl mx-auto py-24 px-6 space-y-32">
        
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 glass-card p-2 overflow-hidden rounded-3xl h-[400px] relative group">
            <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-transparent transition-all z-10"/>
            <Image src="/assets/AI.png" alt="Neural Net" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-5xl font-black">AI Orchestration</h2>
            <p className="text-2xl text-gray-400 font-light">We don't just process data; we synchronize 
            <span className="text-white font-medium"> geospatial intelligence </span> 
            with satellite communications using RAG-based neural architectures to map the future of our planet.</p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="flex-1 glass-card p-2 overflow-hidden rounded-3xl h-[400px] relative group">
             <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-transparent transition-all z-10"/>
            <Image src="/assets/planet.png" alt="Deep Space" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-5xl font-black">Planet-Scale Intelligence</h2>
            <p className="text-2xl text-gray-400 font-light">At Space42, we don't just look at the stars; we listen to the Earth. We are merging satellite communications with geospatial AI to create a living map of our world.</p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 glass-card p-2 overflow-hidden rounded-3xl h-[400px] relative group">
             <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-transparent transition-all z-10"/>
            <Image src="/assets/teams.png" alt="Future Mission" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-5xl font-black">Aspiring Team</h2>
            <p className="text-2xl text-gray-400 font-light">We are a collective of architects, dreamers, and engineers who refused to accept the standard orbit. We don't just build for the current market; we build for the civilizations that don't exist yet.</p>
          </div>
        </div>

      </section>

      {/* 4. Bottom Flash Cards Section (UPDATED) */}
      <section className="max-w-7xl mx-auto py-32 px-6">
        <h2 className="text-3xl font-black mb-12 tracking-widest text-center uppercase text-blue-400">Expand Navigation</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashCards.map((card, i) => (
            <Link href={card.link} key={i} className="group">
              {/* Changed height to h-80 for better aspect ratio with images */}
              <div className="relative h-80 rounded-3xl overflow-hidden glass-card border border-white/10 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                
                {/* Background Image */}
                <Image 
                  src={card.image} 
                  alt={card.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay (Dark at bottom for text readability) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c162d] via-[#0c162d]/50 to-transparent opacity-90" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                {/* Optional: Top Right decorative arrow */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-4 h-4 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </section>
      
      <div className="h-32" />
    </main>
  );
}