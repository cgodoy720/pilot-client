import logo from '../../../assets/logo-full.png';
import { Instagram, Linkedin } from 'lucide-react';

const ThankYouScreen = ({ message }) => {
  return (
    <div className="min-h-screen h-screen w-screen bg-[#4E4DED] flex items-center justify-center px-16 relative box-border">
      <div className="max-w-full w-full text-center animate-fade-in-scale">
        <h1 className="text-5xl font-semibold mb-10 text-white leading-tight animate-fade-in-up animation-delay-300">
          We'll get back to you<br />as soon as we can.
        </h1>
        <p className="text-xl text-white/80 leading-relaxed mb-8 animate-fade-in-up animation-delay-400">
          In the meantime, follow us on:
        </p>
        <div className="flex gap-6 justify-center items-center animate-fade-in-up animation-delay-500">
          <a 
            href="https://www.instagram.com/pursuit/?hl=en" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Follow us on Instagram"
          >
            <Instagram size={22} />
          </a>
          <a 
            href="https://x.com/joinpursuit" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Follow us on X"
          >
            <svg 
              width="22" 
              height="22" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a 
            href="https://www.linkedin.com/school/joinpursuit/?trk=public_post_feed-actor-name" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Follow us on LinkedIn"
          >
            <Linkedin size={22} />
          </a>
        </div>
      </div>
      <img src={logo} alt="Pursuit" className="fixed bottom-8 right-8 h-10 w-auto opacity-90 z-50" />
    </div>
  );
};

export default ThankYouScreen;
