import { useState, useEffect } from 'react';
import logoFull from '../assets/logo-full.png';

const CarouselHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/api/placeholder/600/800', // Placeholder for hero image
      title: "We're building the future of AI jobs.",
      person: "Larry Lamouth",
      role: "Cyber Security Analyst",
      company: "Blackstone"
    },
    {
      id: 2,
      image: '/api/placeholder/600/800', // Placeholder for hero image  
      title: "Innovation starts with the right training.",
      person: "Sarah Chen",
      role: "AI Engineer",
      company: "Microsoft"
    },
    {
      id: 3,
      image: '/api/placeholder/600/800', // Placeholder for hero image
      title: "Your career transformation begins here.",
      person: "Marcus Johnson",
      role: "Data Scientist", 
      company: "Google"
    }
  ];

  const SLIDE_DURATION = 8000; // 8 seconds per slide

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (SLIDE_DURATION / 100));
        if (newProgress >= 100) {
          return 0;
        }
        return newProgress;
      });
    }, 100);

    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
      setProgress(0);
    }, SLIDE_DURATION);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideInterval);
    };
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  return (
    <div className="relative h-full bg-carbon-black flex flex-col">
      {/* Hero Image Container */}
      <div className="flex-1 relative overflow-hidden p-[60px]">
        {/* Background Image with Overlay */}
        <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-[4px_4px_20px_rgba(0,0,0,0.25)]">
          <img
            src={slides[currentSlide].image}
            alt="Hero"
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.8)' }}
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-carbon-black/20" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-10">
            {/* Main Headline */}
            <h1 className="text-white font-bold font-proxima text-3xl md:text-4xl lg:text-5xl leading-tight mb-6 max-w-[500px]">
              {slides[currentSlide].title}
            </h1>
            
            {/* Person Info */}
            <div className="text-white">
              <p className="font-bold font-proxima text-base leading-tight max-w-[250px]">
                {slides[currentSlide].person} {slides[currentSlide].role} {slides[currentSlide].company}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section with Progress Indicators and Logo */}
      <div className="flex justify-between items-end p-10">
        {/* Progress Bar Breadcrumbs */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative h-2 w-16 bg-white/30 rounded-full overflow-hidden cursor-pointer hover:bg-white/40 transition-colors"
            >
              {/* Progress Fill */}
              <div 
                className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: index === currentSlide ? `${progress}%` : index < currentSlide ? '100%' : '0%'
                }}
              />
            </button>
          ))}
        </div>

        {/* Pursuit Logo */}
        <div className="flex-shrink-0">
          <img 
            src={logoFull} 
            alt="Pursuit Logo" 
            className="h-[71.93px] w-[280px] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default CarouselHero;
