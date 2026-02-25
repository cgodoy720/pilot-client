import { ExternalLink, Linkedin, Twitter, Share2, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';

function BuildingInPublic({ task, onComplete }) {
  const handleOpenLinkedIn = () => {
    window.open('https://linkedin.com', '_blank');
  };

  const handleOpenX = () => {
    window.open('https://x.com', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Share2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800">
                A big part of this pilot is for you to build and share your work and reflections publicly. Reflecting on your failures and growth, sharing what you're learning, and showcasing your progress and your actual product will create meaningful opportunities to connect with the tech community, industry leaders, and potential employers.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800 font-medium">
            This is one of the best ways for Builders to network, attract job opportunities, and get hired.
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4 flex items-center gap-2">
          <Linkedin className="h-6 w-6 text-[#0077B5]" />
          Creating a LinkedIn Account
        </h2>
        
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <ol className="space-y-4 text-[#666]">
            <li>
              <strong className="text-[#1E1E1E]">1. Head over to LinkedIn.com</strong>
              <div className="mt-2">
                <Button 
                  onClick={handleOpenLinkedIn}
                  className="bg-[#0077B5] hover:bg-[#005885] text-white flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4" />
                  Create LinkedIn Account
                </Button>
              </div>
            </li>
            
            <li>
              <strong className="text-[#1E1E1E]">2. Create an account.</strong>
              <p className="text-sm text-[#666] mt-1">Use your new Pursuit email when signing up.</p>
            </li>
            
            <li>
              <strong className="text-[#1E1E1E]">3. Build out your user profile, including:</strong>
              <ul className="mt-2 space-y-2 text-[#666] ml-4">
                <li>• Updating your professional/work history</li>
                <li>• Adding your educational background</li>
                <li>• Including your X account where you'll share your AI builds (if you create one)</li>
                <li>• Adding a professional headshot</li>
                <li>• Writing a compelling headline and summary</li>
              </ul>
            </li>
            
            <li>
              <strong className="text-[#1E1E1E]">4. Follow Pursuit on LinkedIn.</strong>
              <p className="text-sm text-[#666] mt-1">Search for "Pursuit" and follow the official company page.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4 flex items-center gap-2">
          <Twitter className="h-6 w-6 text-[#1DA1F2]" />
          Creating an X (Twitter) Account (Optional)
        </h2>
        
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <ol className="space-y-4 text-[#666]">
            <li>
              <strong className="text-[#1E1E1E]">1. Head over to X.com</strong>
              <div className="mt-2">
                <Button 
                  onClick={handleOpenX}
                  variant="outline"
                  className="border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" />
                  Create X Account
                </Button>
              </div>
            </li>
            
            <li>
              <strong className="text-[#1E1E1E]">2. Create a user account</strong>
              <p className="text-sm text-[#666] mt-1">Choose a professional username that represents you well.</p>
            </li>
            
            <li>
              <strong className="text-[#1E1E1E]">3. Follow These Accounts on X:</strong>
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                  <h4 className="font-semibold text-[#1E1E1E] mb-3">AI Companies & Tools:</h4>
                  <ul className="space-y-2 text-[#666]">
                    <li>• <a href="https://x.com/deepseek_ai" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@deepseek_ai <ExternalLink className="h-3 w-3" /></a></li>
                    <li>• <a href="https://x.com/cursor_ai" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@cursor_ai <ExternalLink className="h-3 w-3" /></a></li>
                    <li>• <a href="https://x.com/cognition_labs" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@cognition_labs <ExternalLink className="h-3 w-3" /></a></li>
                  </ul>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                  <h4 className="font-semibold text-[#1E1E1E] mb-3">Industry Leaders:</h4>
                  <ul className="space-y-2 text-[#666]">
                    <li>• <a href="https://x.com/gdb" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@gdb <ExternalLink className="h-3 w-3" /></a></li>
                    <li>• <a href="https://x.com/darioamodei" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@darioamodei <ExternalLink className="h-3 w-3" /></a></li>
                    <li>• <a href="https://x.com/snowmaker" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@snowmaker <ExternalLink className="h-3 w-3" /></a></li>
                    <li>• <a href="https://x.com/demishassabis" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@demishassabis <ExternalLink className="h-3 w-3" /></a></li>
                    <li>• <a href="https://x.com/ban_Kawas" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">@ban_Kawas <ExternalLink className="h-3 w-3" /></a></li>
                  </ul>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Why Building in Public Matters</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Networking Benefits
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Connect with tech community members</li>
              <li>• Attract attention from industry leaders</li>
              <li>• Build relationships with potential employers</li>
              <li>• Learn from other builders and creators</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-900 mb-3">Career Impact</h3>
            <ul className="space-y-2 text-green-800">
              <li>• Showcase your skills and projects</li>
              <li>• Demonstrate your learning journey</li>
              <li>• Create opportunities for job offers</li>
              <li>• Build your personal brand in tech</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">What You'll Share</h2>
        
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
          <p className="text-[#666] mb-4">Throughout the program, you'll share:</p>
          <ul className="space-y-2 text-[#666]">
            <li>• Your AI projects and builds</li>
            <li>• Learning reflections and insights</li>
            <li>• Challenges you've overcome</li>
            <li>• Progress updates and milestones</li>
            <li>• Interesting articles and resources you discover</li>
          </ul>
        </div>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've created your LinkedIn account (and optionally X account), completed your profiles, and followed the recommended accounts, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default BuildingInPublic;
