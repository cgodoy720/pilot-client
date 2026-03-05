import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';

function CheckEmailSuccess({ user, onBackToDashboard }) {
  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#1E1E1E] mb-4">
          Builder Account Created Successfully!
        </h1>
        
        <p className="text-lg text-[#666] mb-6">
          Congratulations! You've completed all onboarding tasks and your builder account has been created.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <Mail className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="text-left">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              Check Your Pursuit Email
            </h2>
            <p className="text-blue-800 mb-4">
              We've sent a verification email to your new Pursuit email address. You'll need to verify your email before you can access your builder account.
            </p>
            <p className="text-blue-800 mb-4">
              <strong>Important:</strong> From now on, you'll use your Pursuit email to log into the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-4">Next Steps:</h3>
        <ol className="space-y-3 text-[#666] text-left">
          <li>1. <strong>Check your Pursuit email</strong> for the verification message</li>
          <li>2. <strong>Click the verification link</strong> in the email</li>
          <li>3. <strong>Log in with your Pursuit email</strong> to access your builder account</li>
          <li>4. <strong>Start building!</strong> Your AI-Native journey is about to begin</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={handleOpenGmail}
          className="bg-[#4285F4] hover:bg-[#3367D6] text-white flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Check Pursuit Email
        </Button>
        
        <Button 
          onClick={onBackToDashboard}
          variant="outline"
          className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white flex items-center gap-2"
        >
          Back to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
        <p className="text-sm text-[#666]">
          Need help? Contact Victoria Mayo on Slack or email systems@pursuit.org
        </p>
      </div>
    </div>
  );
}

export default CheckEmailSuccess;
