import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import CarouselHero from '../../components/CarouselHero';
import logoFull from '../../assets/logo-full.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, setAuthState } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Return null while redirecting
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Use the redirectTo from unified auth response
        const redirectPath = result.redirectTo || '/dashboard';
        
        // For builder users, the AuthContext will handle the state
        // For applicants, we redirect but don't set AuthContext state
        if (result.userType === 'builder') {
          // Navigate to the path specified by the backend (could be /dashboard or /volunteer-feedback)
          navigate(redirectPath);
        } else if (result.userType === 'applicant') {
          // Redirect to applicant dashboard
          navigate(redirectPath);
        } else {
          // Fallback to dashboard
          navigate('/dashboard');
        }
      } else {
        // Check if the error is related to email verification
        if (result.needsVerification) {
          setNeedsVerification(true);
        } else {
          setError(result.error || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Carousel */}
      <div className="hidden md:block md:w-1/2">
        <CarouselHero />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full md:w-1/2 bg-pursuit-purple flex flex-col justify-center px-8 py-12 relative">
        <div className="w-full max-w-[320px] mx-auto">
          
          {/* Header */}
          <div className="text-left" style={{ marginBottom: '18px' }}>
            <h1 className="text-white font-proxima-bold text-[1.75rem] leading-tight">
              Let's Build!
            </h1>
          </div>

          {needsVerification ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <p className="text-white mb-4">Please verify your email address before logging in.</p>
              <p className="text-white/80 text-sm mb-6">Check your email for a verification link or request a new one.</p>
              <div className="space-y-4">
                <Button asChild className="w-full bg-white text-pursuit-purple hover:bg-gray-100">
                  <Link to="/resend-verification">
                    Resend Verification Email
                  </Link>
                </Button>
                <button 
                  onClick={() => setNeedsVerification(false)} 
                  className="text-white underline text-sm hover:text-white/80"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded text-center text-sm">
                  {error}
                </div>
              )}
              
              {/* Email Input */}
              <div className="space-y-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  disabled={isSubmitting}
                  className="bg-transparent border-0 border-b-2 border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-0 !text-[1rem] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {/* Password Input */}
              <div className="space-y-2 relative" style={{ marginTop: '5px' }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={isSubmitting}
                  className="bg-transparent border-0 border-b-2 border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-0 pr-8 !text-[1rem] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button 
                  type="button" 
                  className="absolute right-0 bottom-0 text-white/60 hover:text-white w-4 h-8 flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Links */}
              <div className="flex justify-end items-center text-sm" style={{ marginTop: '7px' }}>
                <Link to="/forgot-password" className="text-white no-underline hover:underline hover:text-white/80">
                  Forgot your password?
                </Link>
              </div>
              
              {/* Login Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-white text-pursuit-purple hover:bg-gray-100 font-medium py-2 text-base rounded-lg"
                style={{ marginTop: '30px', marginBottom: '7px' }}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>

              {/* Sign up link with arrow */}
              <div className="text-center" style={{ marginTop: '7px' }}>
                <div className="flex items-center justify-center gap-2 text-white text-sm">
                  <span>Don't have an account?</span>
                  <Link to="/signup" className="group relative inline-flex items-center gap-1 text-white no-underline hover:underline p-1">
                    <span className="relative z-10">Sign up</span>
                    <div className="relative w-5 h-5 flex items-center justify-center border border-white rounded-[0.4rem] overflow-hidden">
                      <ArrowRight className="w-3 h-3 relative z-10 transition-colors duration-300 group-hover:text-pursuit-purple" />
                      {/* Fill animation from left to right */}
                      <div className="absolute inset-0 bg-white -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </div>
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Pursuit Logo - Bottom Right */}
        <div className="absolute bottom-8 right-8">
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

export default Login; 