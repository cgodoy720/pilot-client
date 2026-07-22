import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import ArrowButton from './ArrowButton/ArrowButton';
import logoFull from '../assets/logo-full.png';

/**
 * Post-registration "Congratulations" screen shared by the account-type signup
 * (`pages/Signup`) and the dedicated enterprise signup (`pages/EnterpriseSignup`).
 * Keep it presentational so both entry points render the identical success state.
 */
const SignupSuccessScreen = ({
  message = 'Transformation awaits in your inbox. Log into your account using the link in the confirmation Email!',
}) => {
  return (
    <div
      className="min-h-screen relative flex flex-col"
      style={{
        background: 'linear-gradient(158.49deg, #4242EA 29.85%, #FFD3C2 116.57%)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col items-end md:flex-row md:justify-between md:items-center px-8 pt-5 gap-2">
        <h1 className="hidden md:block text-white text-xl md:text-2xl font-proxima leading-tight">
          Let's create your account
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-proxima">
            Already have an account? Login
          </span>
          <Link to="/login">
            <ArrowButton
              size="sm"
              borderColor="white"
              arrowColor="white"
              backgroundColor="transparent"
              hoverBackgroundColor="white"
              hoverArrowColor="#4242EA"
            />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-2xl text-left">
          <h2 className="text-white text-3xl md:text-4xl font-bold font-proxima mb-6">
            Congratulations!
          </h2>
          <p className="text-white text-lg md:text-xl font-proxima mb-8 leading-relaxed max-w-xl">
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

      {/* Bottom Right Logo */}
      <div className="absolute bottom-8 right-8">
        <img src={logoFull} alt="Pursuit Logo" className="h-[71.93px] w-[280px]" />
      </div>
    </div>
  );
};

export default SignupSuccessScreen;
