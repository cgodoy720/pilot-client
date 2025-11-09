import { useState, useEffect } from 'react';
import logoFull from '../assets/logo-full.png';

const CarouselHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/photos/larry.jpg',
      title: "We're building the future of AI jobs.",
      person: "Larry Lamouth",
      role: "Cyber Security Analyst",
      company: "Blackstone",
      objectPosition: 'center top'
    },
    {
      id: 2,
      image: '/photos/chantal.jpg',
      title: "Innovation starts with the right training.",
      person: "Chantal Rodriguez",
      role: "AI Engineer",
      company: "Microsoft",
      objectPosition: 'center center'
    },
    {
      id: 3,
      image: '/photos/ted-talk.jpg',
      title: "Your career transformation begins here.",
      person: "Marcus Johnson",
      role: "Data Scientist", 
      company: "Google",
      objectPosition: 'center center'
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
      <div className="relative overflow-hidden p-[60px] pb-0" style={{ height: 'calc(100% - 150px)' }}>
        {/* Background Image with Overlay */}
        <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-[4px_4px_20px_rgba(0,0,0,0.25)]">
          {/* Render all images, only show current one */}
          {slides.map((slide, index) => (
            <div 
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: index === currentSlide ? 1 : 0 }}
            >
              <img
                src={slide.image}
                alt="Hero"
                className="w-full h-full object-cover"
                style={{ 
                  filter: 'brightness(0.8)',
                  objectPosition: slide.objectPosition || 'center center'
                }}
              />
            </div>
          ))}
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-carbon-black/20" />
        </div>
      </div>

      {/* Text Content Overlay - Outside image container */}
      <div className="absolute bottom-[100px] left-[40px] z-10">
        {/* Main Headline */}
        <h1 className="text-white font-bold font-proxima text-3xl md:text-4xl lg:text-5xl leading-[70px] mb-4 max-w-[598px]">
          {slides[currentSlide].title}
        </h1>
        
        {/* Person Info - Stacked vertically */}
        <div className="text-white space-y-0">
          <p className="font-bold font-proxima text-base leading-5">
            {slides[currentSlide].person}
          </p>
          <p className="font-bold font-proxima text-base leading-5">
            {slides[currentSlide].role}
          </p>
          <p className="font-bold font-proxima text-base leading-5">
            {slides[currentSlide].company}
          </p>
        </div>
      </div>

      {/* Bottom Section with Progress Indicators and Logo */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-[40px] py-[30px]">
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
