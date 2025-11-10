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
      objectPosition: 'center 30%'
    },
    {
      id: 2,
      image: '/photos/chantal.jpg',
      title: "Innovation starts with the right training.",
      person: "Chantal Rodriguez",
      role: "AI Engineer",
      company: "Microsoft",
      objectPosition: 'center 40%'
    },
    {
      id: 3,
      image: '/photos/pilot-class.jpg',
      title: "Your career transformation begins here.",
      person: "Pilot Cohort",
      role: "Builders", 
      company: "Pursuit AI-Native Program",
      objectPosition: 'center 40%'
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
      <div className="relative overflow-hidden px-[60px] pt-[40px] pb-0 flex justify-center" style={{ height: 'calc(100% - 100px)' }}>
        {/* Background Image with Overlay */}
        <div className="relative h-full w-[85%] rounded-[30px] overflow-hidden">
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

      {/* Text Content Overlay - Below carousel */}
      <div className="absolute bottom-[30px] left-[40px] z-10">
        {/* Main Headline */}
        <h1 className="text-white font-proxima-bold text-[3.5rem] leading-none mb-[70px] max-w-[525px]">
          {slides[currentSlide].title}
        </h1>
        
        {/* Person Info - Stacked vertically */}
        <div className="text-white space-y-0">
          <p className="font-proxima-bold text-base leading-5">
            {slides[currentSlide].person}
          </p>
          <p className="font-proxima text-base leading-5">
            {slides[currentSlide].role}
          </p>
          <p className="font-proxima text-base leading-5">
            {slides[currentSlide].company}
          </p>
        </div>
      </div>

      {/* Bottom Section with Progress Indicators - Right Corner */}
      <div className="absolute bottom-0 right-0 flex justify-end items-end px-[40px] py-[30px]">
        {/* Progress Bar Breadcrumbs */}
        <div className="flex gap-2 items-center">
          {slides.map((_, index) => {
            const isActive = index === currentSlide;
            const isPast = index < currentSlide;
            
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative rounded-full overflow-hidden cursor-pointer transition-all duration-300 ${
                  isActive ? 'w-16 h-2' : 'w-2 h-2'
                }`}
                style={{
                  backgroundColor: isPast ? '#4242EA' : '#FFFFFF'
                }}
              >
                {/* Progress Fill for active slide */}
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-pursuit-purple rounded-full transition-all duration-100 ease-linear"
                    style={{
                      width: `${progress}%`
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarouselHero;
