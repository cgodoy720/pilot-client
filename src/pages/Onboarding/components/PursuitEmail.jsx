import { Mail, ExternalLink, Key, User, Settings } from 'lucide-react';
import { Button } from '../../../components/ui/button';

function PursuitEmail({ task, onComplete }) {
  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Your Pursuit Email</h3>
              <p className="text-blue-800">
                One of the many benefits of joining our community as a Builder is getting a Pursuit-branded email account. Your email format will be first.last@pursuit.org.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Gmail at Pursuit</h2>
        <p className="text-[#666] mb-4">
          We use Gmail as our Pursuit email platform. Gmail is a powerful service that allows you to do more than just send emails. You'll use your Gmail account for a number of tasks, such as:
        </p>
        
        <ul className="space-y-2 text-[#666] mb-6">
          <li>• Confirming accounts for a variety of services.</li>
          <li>• Official coordination with Pursuit staff.</li>
          <li>• Viewing and taking action on notifications from Canvas and GitHub.</li>
        </ul>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-amber-800 font-medium">
            It's important to frequently view your Gmail account and respond quickly whenever appropriate.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">How to Access Your Email</h2>
        
        <div className="space-y-6">
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Step 1: Go to Gmail
            </h3>
            <p className="text-[#666] mb-4">Open your web browser and go to mail.google.com</p>
            <Button 
              onClick={handleOpenGmail}
              className="bg-[#4285F4] hover:bg-[#3367D6] text-white flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Open Gmail
            </Button>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Step 2: Enter Your Email Address
            </h3>
            <p className="text-[#666] mb-4">Your email address follows this pattern: <strong>FirstName.LastName@pursuit.org</strong></p>
            
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-[#1E1E1E] mb-2">Special cases for your name:</h4>
              <ul className="space-y-2 text-[#666]">
                <li><strong>Space or hyphen in first name?</strong> Combine them together
                  <div className="text-sm text-[#888] ml-4">Example: Min Yi becomes minyi.lastname@pursuit.org</div>
                </li>
                <li><strong>Space or hyphen in last name?</strong> Use the first letter of each part
                  <div className="text-sm text-[#888] ml-4">Example: Rowe-Owen becomes firstname.ro@pursuit.org</div>
                </li>
                <li><strong>Have Jr., Sr., II, III, etc.?</strong> Don't include these in your email</li>
                <li><strong>Worried about capital letters?</strong> Don't be! Emails aren't case sensitive</li>
              </ul>
            </div>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Step 3: Use the Temporary Password
            </h3>
            <p className="text-[#666] mb-4">When it asks for your password, type: <strong className="bg-gray-100 px-2 py-1 rounded font-mono">Welcome!</strong></p>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Step 4: Create Your Own Password
            </h3>
            <p className="text-[#666] mb-4">You'll be asked to create a new password right away. Choose something secure and write it down somewhere safe!</p>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Step 5: Explore</h3>
            <p className="text-[#666] mb-4">
              Now that you've logged in, please explore the platform. As a Builder, you'll want to feel comfortable doing the following:
            </p>
            <ul className="space-y-2 text-[#666]">
              <li>• Sending emails to individual recipients, as well as using the CC and BCC fields.</li>
              <li>• Mark emails as read and unread.</li>
              <li>• Archiving emails from your inbox to All Mail.</li>
              <li>• Formatting emails with styled text, links, and attachments.</li>
            </ul>
            <p className="text-[#666] mt-4">
              Your google account gives you access to all apps within Google Drive (docs, sheets, calendar, etc.), which we will explore in future onboarding steps.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Need Help?</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">
            Having trouble? Message Victoria Mayo on Slack for help.
          </p>
        </div>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've successfully accessed your Pursuit email and explored the platform, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default PursuitEmail;
