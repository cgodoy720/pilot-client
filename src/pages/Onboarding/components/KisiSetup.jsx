import { Smartphone, Lock, MapPin, AlertTriangle } from 'lucide-react';

function KisiSetup({ task, onComplete }) {
  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Introduction to Kisi & Accessing the Site</h3>
              <p className="text-amber-800">
                You may have noticed that the main doors to our office are now locked at all times. This allows us to better manage the guests that come in and out of our space and make sure the office is safe for everyone.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">
              Please refrain from propping the doors open and use discretion when holding the door or letting people into the office. If you ever have concerns, reach out to Victoria Mayo for assistance.
            </p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Accessing The Office</h2>
        
        <div className="space-y-6">
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Download Kisi
            </h3>
            <div className="space-y-3 text-[#666]">
              <p>Download Kisi on your mobile device</p>
              <p>Check your email inbox for a link from Kisi to finish setting up your account</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 font-medium text-sm">
                  <strong>BUILDERS:</strong> your account is likely tied to your Pursuit account. Please check that inbox first!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4">Sign in</h3>
            
            <div className="space-y-4">
              <p className="text-[#666]">The home screen should look like this:</p>
              
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <Smartphone className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600">Kisi Home Screen</p>
                </div>
                <p className="text-sm text-[#666]">Click on Pursuit to access the office controls</p>
              </div>

              <p className="text-[#666]">You will see a screen that looks like this:</p>
              
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-4">
                  <h4 className="font-semibold text-purple-900 mb-3">Pursuit Office Access</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-3">
                      <span className="text-purple-800">Main Entrance</span>
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-3">
                      <span className="text-purple-800">Office Door</span>
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>

                <ol className="space-y-2 text-[#666]">
                  <li>1. Click on the door you'd like to unlock.</li>
                  <li>2. The purple "locked" icon will briefly turn green and read "unlocked"</li>
                  <li>3. Open the door and make sure it closes behind you :)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Main Entrance Doors</h2>
        
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="h-5 w-5 text-[#4242EA] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#666] mb-4">
                To access the main entrance door (located at 47-10 Austell), you may need to go to the keypad to the left of the door and enter <strong className="bg-gray-100 px-2 py-1 rounded font-mono">5353#</strong>.
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Important Notes:</h4>
            <ul className="space-y-2 text-amber-800">
              <li>• The doors are usually set to be locked before 9 AM and after 7 PM daily.</li>
              <li>• The door code (above) may change occasionally.</li>
              <li>• When this happens, please look out for a message on Slack and/or Email from Victoria@pursuit.org</li>
              <li>• OR Slack Victoria directly for assistance.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Next Steps</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 mb-3">To complete this task:</h3>
          <ol className="space-y-2 text-green-800">
            <li>1. Download the Kisi app on your mobile device</li>
            <li>2. Check your Pursuit email for the setup invitation</li>
            <li>3. Complete the account setup process</li>
            <li>4. Test unlocking a door using the app</li>
            <li>5. Mark this task as complete</li>
          </ol>
        </div>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've downloaded Kisi, set up your account, and successfully tested office access, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default KisiSetup;
