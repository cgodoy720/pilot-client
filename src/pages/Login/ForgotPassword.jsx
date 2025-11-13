import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import logoFull from '../../assets/logo-full.png';

const ForgotPassword = () => {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'If an account exists with this email, a password reset link will be sent.');
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
    <div className="min-h-screen bg-pursuit-purple flex flex-col items-center justify-start px-6 py-8 pt-[10vh]">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8">
          <img src={logoFull} alt="Pursuit Logo" className="h-10 w-auto" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold font-proxima leading-tight">
            FORGOT YOUR<br />PASSWORD?
          </h1>
        </div>
        
        {isSuccess ? (
          <div className="flex flex-col items-center gap-6 text-center w-full">
            <p className="text-white text-base leading-relaxed">{message}</p>
            <Button 
              asChild
              className="bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium"
            >
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded text-center text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 p-3 rounded text-center text-sm">
                {message}
              </div>
            )}
            
            <p className="text-white/80 text-sm mb-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <div className="relative w-full">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isSubmitting}
                className="bg-transparent border-0 border-b border-white/30 rounded-none text-white placeholder:text-white/60 focus:border-white focus:ring-0 px-0 pb-2"
              />
            </div>
            
            <div className="flex justify-start mt-2">
              <Link 
                to="/login" 
                className="text-white/80 text-xs hover:text-white underline transition-colors"
              >
                Back to Login
              </Link>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-white text-pursuit-purple hover:bg-gray-100 rounded-full px-6 py-3 text-base font-proxima font-medium mt-4"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 