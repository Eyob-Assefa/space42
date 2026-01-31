import Image from 'next/image';
import Link from 'next/link';

const navigationCards = [
  {
    title: "Explore Jobs",
    subtitle: "COMMAND CENTER",
    description: "Search for open roles and launch your application into orbit.",
    image: "/assets/jobs.png",
    link: "/jobs"
  },
  {
    title: "Why Space42",
    subtitle: "THE MISSION",
    description: "Navigate through our core values and the future of galactic recruitment.",
    image: "/assets/mission.jpg", 
    link: "/why-space42"
  },
  {
    title: "Life at Space42",
    subtitle: "STATION TOUR",
    description: "Experience our culture through an immersive virtual tour of the station.",
    image: "/assets/tour.png",
    link: "/tour"
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Hero Header */}
      <div className="text-center mb-16 animate-float">
        <h1 className="text-8xl font-black tracking-tighter text-white drop-shadow-[0_0_35px_rgba(59,130,246,0.6)]">
          Space42
        </h1>
        <p className="text-blue-400 tracking-[0.6em] font-medium uppercase mt-4 text-sm">
          Launch Your Career to New Heights
        </p>
      </div>

      {/* Interactive Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl w-full">
        {navigationCards.map((card, index) => (
          <Link href={card.link} key={index} className="group cursor-pointer">
            <div className="glass-card relative h-[450px] flex flex-col transition-all duration-500 hover:-translate-y-2">
              
              {/* Image Container (Top 2/3) */}
              <div className="relative h-2/3 w-full overflow-hidden">
                <Image 
                  src={card.image} 
                  alt={card.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Dark gradient to blend image into the card bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-transparent" />
              </div>

              {/* Content Container (Bottom 1/3) */}
              <div className="p-8 bg-[#0a0e27]/80 backdrop-blur-sm flex-1 flex flex-col justify-center">
                <span className="text-blue-500 text-[10px] font-bold tracking-[0.3em] mb-2 uppercase">
                  {card.subtitle}
                </span>
                <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed opacity-90 group-hover:opacity-100">
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}