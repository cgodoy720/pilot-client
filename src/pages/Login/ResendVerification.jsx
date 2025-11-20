import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2 } from 'lucide-react';
import logoFull from '../../assets/logo-full.png';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'If an account exists with this email, a verification link will be sent.');
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-pursuit-purple relative flex flex-col">
      {/* Header Logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <img src={logoFull} alt="Pursuit Logo" className="h-16 w-auto" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold font-proxima mb-12 uppercase tracking-wide">
            RESEND<br />VERIFICATION
          </h1>
          
          {isSuccess ? (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <p className="text-white text-lg font-proxima mb-6">
                  {message}
                </p>
                <Button 
                  asChild 
                  className="bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium"
                >
                  <Link to="/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
                  <p className="text-red-200 text-sm font-proxima">{error}</p>
                </div>
              )}
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <p className="text-white text-base font-proxima mb-6">
                  Enter your email address and we'll send you another verification link.
                </p>
                
                <div className="space-y-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={isSubmitting}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white font-proxima"
                  />
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Link'
                    )}
                  </Button>
                </div>
                
                <Link 
                  to="/login" 
                  className="text-white underline hover:text-white/80 text-sm font-proxima inline-block mt-6"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Right Logo */}
      <div className="absolute bottom-8 right-8">
        <img 
          src={logoFull} 
          alt="Pursuit Logo" 
          className="h-[71.93px] w-[280px]" 
        />
      </div>
    </div>
  );
};

export default ResendVerification; 