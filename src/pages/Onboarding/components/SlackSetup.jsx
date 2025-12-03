import { ExternalLink, MessageSquare, Users, Hash } from 'lucide-react';
import { Button } from '../../../components/ui/button';

function SlackSetup({ task, onComplete }) {
  const handleOpenSlack = () => {
    window.open('https://pursuit-core.slack.com', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">What is Slack?</h3>
              <p className="text-purple-800">
                Slack is a messaging app that most tech companies use for work communication. It's like texting, but for your job! You'll use Slack every day at Pursuit to talk with other Builders, staff, and mentors.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Getting Started with Slack</h2>
        
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">Step 1: Join Pursuit's Slack</h3>
          <p className="text-[#666] mb-4">
            Look in your Pursuit email for a message that says "You're invited to join Pursuit Fellowship on Slack."
          </p>
          <p className="text-[#666] mb-4">
            Can't find it? Email systems@pursuit.org for help.
          </p>
          
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-[#1E1E1E] mb-2">To join:</h4>
            <ol className="space-y-2 text-[#666]">
              <li>1. Click the "Join Now" button in the email, OR go to pursuit-core.slack.com</li>
              <li>2. Choose "Sign in with Google"</li>
              <li>3. Use your Pursuit email to log in</li>
              <li>4. Google will connect your accounts and take you to Slack</li>
              <li>5. You're now in Slack!</li>
            </ol>
          </div>

          <Button 
            onClick={handleOpenSlack}
            className="bg-[#4A154B] hover:bg-[#3d1142] text-white flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Pursuit Slack
          </Button>
        </div>

        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">Step 2: Download the Desktop App</h3>
          <p className="text-[#666] mb-4">
            Most people use Slack as a desktop app instead of in a web browser. At Pursuit, you must download the desktop app.
          </p>
          
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
            <h4 className="font-semibold text-[#1E1E1E] mb-2">To download:</h4>
            <ol className="space-y-2 text-[#666]">
              <li>1. Go to the App Store on your computer</li>
              <li>2. Search for "Slack"</li>
              <li>3. Download and install it</li>
              <li>4. Open the Slack app</li>
              <li>5. Log in again using your Pursuit email (same way as before)</li>
              <li>6. Done! Now you have Slack on your computer.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">How to Use Slack at Pursuit</h2>
        
        <p className="text-[#666] mb-6">
          You'll use Slack to communicate with other Builders, alumni, Pursuit staff, and your mentors. Along with email, it's one of the main ways we'll stay in touch.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">Slack vs. Email - When to Use Each</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Use Slack for:
              </h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Quick questions about assignments</li>
                <li>• Sharing interesting articles with your class</li>
                <li>• Group chats with teammates</li>
                <li>• Casual conversations with other Builders</li>
                <li>• Reaching out to Pursuit alumni</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-3">Use Email for:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Non-urgent questions</li>
                <li>• Formal requests (like asking for an extension)</li>
                <li>• Professional messages</li>
                <li>• Anything official you want to keep forever</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 mt-4">
            <p className="text-blue-900 font-medium text-sm">
              <strong>Important:</strong> Slack messages don't last forever! If it's official or important, send it by email.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Understanding Slack's Main Features</h2>
        
        <div className="space-y-6">
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <Hash className="h-5 w-5" />
              1. Channels (# symbol)
            </h3>
            <p className="text-[#666] mb-3">Channels are like group chat rooms. Each channel has a specific topic.</p>
            
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-[#1E1E1E] mb-2">Examples:</h4>
              <ul className="space-y-1 text-[#666]">
                <li>• #general - Announcements for everyone</li>
                <li>• #jobs_tech - Job postings in technology</li>
                <li>• Your class channel - Private chat just for your class</li>
              </ul>
            </div>

            <h4 className="font-semibold text-[#1E1E1E] mb-2">To find more channels:</h4>
            <ol className="space-y-1 text-[#666]">
              <li>1. Click the + next to "Channels"</li>
              <li>2. Click "Add channels"</li>
              <li>3. Click "Browse channels"</li>
              <li>4. Join any that interest you!</li>
            </ol>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              2. Direct Messages (DMs)
            </h3>
            <p className="text-[#666] mb-3">Direct messages are private conversations between you and one or more people. They're great for quick, casual chats.</p>
            
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
              <h4 className="font-semibold text-[#1E1E1E] mb-2">To start a direct message:</h4>
              <ol className="space-y-1 text-[#666]">
                <li>1. Click the + next to "Direct messages"</li>
                <li>2. Search for the person's name</li>
                <li>3. Start typing!</li>
              </ol>
              <p className="text-[#666] mt-3">
                <strong>Try it:</strong> Say hello to Slackbot! It's Slack's helpful robot. Send it a message and see if it responds!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Setting Up Your Profile</h2>
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
          <p className="text-[#666] mb-4">
            In the top-right corner of Slack, click the square that contains a single letter or a picture in it. Then, select "Edit profile." Update your name and insert your class number and preferred pronouns. Finally, upload an appropriate picture of yourself.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> Once you have your official Pursuit portrait, you should use that picture!
            </p>
          </div>
        </div>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've joined Slack, downloaded the desktop app, and set up your profile, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default SlackSetup;
