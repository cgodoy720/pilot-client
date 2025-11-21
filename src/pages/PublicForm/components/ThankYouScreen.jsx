import logo from '../../../assets/logo-full.png';

const ThankYouScreen = ({ message }) => {
  return (
    <div className="min-h-screen h-screen w-screen bg-[#4E4DED] flex items-center justify-center px-16 relative box-border">
      <div className="max-w-full w-full text-center animate-fade-in-scale">
        <div className="w-25 h-25 bg-[#FFFFCC] text-[#4E4DED] rounded-full flex items-center justify-center text-6xl font-bold mx-auto mb-8 shadow-2xl animate-bounce-in">
          ✓
        </div>
        <h1 className="text-5xl font-semibold mb-6 text-white leading-tight animate-fade-in-up animation-delay-300">
          Thank you!
        </h1>
        <p className="text-xl text-white/80 leading-relaxed m-0 animate-fade-in-up animation-delay-400">
          {message || 'Your response has been recorded.'}
        </p>
      </div>
      <img src={logo} alt="Pursuit" className="fixed bottom-8 right-8 h-10 w-auto opacity-90 z-50" />
    </div>
  );
};

export default ThankYouScreen;
