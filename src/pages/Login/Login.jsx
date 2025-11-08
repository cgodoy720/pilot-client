import { useState } from 'react';
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
  if (isAuthenticated) {
    navigate('/dashboard');
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
      <div className="w-full md:w-1/2 bg-pursuit-purple flex flex-col justify-center px-8 py-12">
        <div className="w-full max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white font-bold font-proxima text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
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
                  className="bg-transparent border-0 border-b-2 border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2 text-base focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {/* Password Input */}
              <div className="space-y-2 relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={isSubmitting}
                  className="bg-transparent border-0 border-b-2 border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2 pr-10 text-base focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button 
                  type="button" 
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Links */}
              <div className="flex justify-between items-center text-sm">
                <Link to="/forgot-password" className="text-white underline hover:text-white/80">
                  Forgot your password?
                </Link>
              </div>
              
              {/* Login Button */}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-white text-pursuit-purple hover:bg-gray-100 font-medium py-2 text-base rounded-lg mt-6"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>

              {/* Sign up link with arrow */}
              <div className="text-center mt-4">
                <div className="flex items-center justify-center gap-2 text-white text-sm">
                  <span>Don't have an account?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 p-1 text-sm"
                    asChild
                  >
                    <Link to="/signup" className="flex items-center gap-1">
                      Sign up
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 