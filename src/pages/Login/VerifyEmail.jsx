import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';
import logoFull from '../../assets/logo-full.png';

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          
          // Store token in localStorage
          if (data.token) {
            localStorage.setItem('authToken', data.token);
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } else {
          setError(data.error || 'Verification failed');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
      setError('Invalid verification link');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-pursuit-purple relative flex flex-col">
      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <img src={logoFull} alt="Pursuit Logo" className="h-16 w-auto" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-white text-3xl md:text-4xl font-bold font-proxima mb-12 uppercase tracking-wide">
            EMAIL<br/>VERIFICATION
          </h1>
          
          {verifying ? (
            <div className="space-y-6">
              <p className="text-white text-lg font-proxima">
                Verifying your email address...
              </p>
              <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <p className="text-white text-xl font-bold font-proxima mb-4">
                  Your email has been verified successfully!
                </p>
                <p className="text-white/80 text-base font-proxima mb-6">
                  You will be redirected to the dashboard shortly...
                </p>
                <Button 
                  asChild 
                  className="bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium"
                >
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-8 border border-red-500/30">
                <p className="text-red-200 text-lg font-bold font-proxima mb-6">
                  {error}
                </p>
                
                {error.includes('expired') && (
                  <div className="space-y-4 mb-6">
                    <p className="text-white text-base font-proxima">
                      Would you like to request a new verification link?
                    </p>
                    <Button 
                      asChild 
                      className="bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium"
                    >
                      <Link to="/resend-verification">Resend Verification</Link>
                    </Button>
                  </div>
                )}
                
                <Link 
                  to="/login" 
                  className="text-white underline hover:text-white/80 text-sm font-proxima inline-block mt-4"
                >
                  Back to Login
                </Link>
              </div>
            </div>
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

export default VerifyEmail; 