import { Calendar, ExternalLink, Video, Users, Clock, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/button';

function GoogleCalendar({ task, onComplete }) {
  const handleOpenCalendar = () => {
    window.open('https://calendar.google.com', '_blank');
  };

  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">What is Google Calendar?</h3>
              <p className="text-green-800">
                Google Calendar is one of the best tools for managing your time. You'll use it to keep track of your schedule, set up meetings with staff and other Builders, and stay organized throughout the program.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Skills You'll Need</h2>
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
          <p className="text-[#666] mb-4">As a Pursuit Builder, we want you to feel comfortable:</p>
          <ul className="space-y-2 text-[#666]">
            <li>• Creating and updating both individual and recurring meetings on Google Calendar.</li>
            <li>• Adding and removing notifications from calendar events.</li>
            <li>• Accepting, declining, and rescheduling meetings.</li>
            <li>• Creating meetings with an associated Zoom meeting room, using the Zoom plugin.</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Getting Started with Google Calendar</h2>
        
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4 flex items-center gap-2">
            <Video className="h-5 w-5" />
            Watch and Learn
          </h3>
          <p className="text-[#666] mb-4">
            Watch the video below to learn how Google Calendar works. Practice the skills listed above so you feel comfortable using it.
          </p>
          
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 mb-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/IyHvKYeeuB8"
                title="Google Calendar Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Pin Your Calendar:</h4>
            <p className="text-blue-800 text-sm">
              You'll use Google Calendar a lot, so make it easy to access! Pin the Google Calendar tab in Chrome so it shows up as a small icon at the top of your browser. This way, you can always see your schedule with one click.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button 
            onClick={handleOpenCalendar}
            className="bg-[#4285F4] hover:bg-[#3367D6] text-white flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Open Google Calendar
          </Button>
          <Button 
            onClick={handleOpenGmail}
            variant="outline"
            className="border-[#4285F4] text-[#4285F4] hover:bg-[#4285F4] hover:text-white flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Open Gmail
          </Button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">How You'll Use Calendar at Pursuit</h2>
        
        <div className="space-y-6">
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Receiving Invitations</h3>
            <p className="text-[#666] mb-3">
              You'll get meeting and event invitations through both Google Calendar and Gmail. When you get an invitation, you'll need to respond by accepting, declining, or suggesting a new time.
            </p>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <Video className="h-5 w-5" />
              Setting Up Meetings with Zoom
            </h3>
            <p className="text-[#666] mb-3">
              When you need to meet with your team or schedule a project meeting, you can add a Zoom link right in the calendar invite. Use the Zoom integration to make this easy!
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm font-medium">
                <strong>Note:</strong> All classes will be held in-person.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Seeing Other People's Calendars</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 mb-3">
                Because you have a Pursuit email, you can see when other Pursuit members are busy or free. This makes scheduling meetings much easier!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">How to view someone's calendar:</h3>
          <ol className="space-y-2 text-[#666]">
            <li>1. Look for the search area above where your calendars are listed</li>
            <li>2. Type in the person's name or email address</li>
            <li>3. Select the right person from the results</li>
            <li>4. Their calendar will appear alongside yours so you can see their availability</li>
          </ol>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-purple-900 mb-3">Meeting with Staff:</h3>
          <p className="text-purple-800 mb-3">Many Pursuit staff members post "Office Hours" on their calendars. If you see an Office Hours event:</p>
          <ol className="space-y-2 text-purple-800">
            <li>1. Click on the event</li>
            <li>2. Click "Go to appointment page for this calendar"</li>
            <li>3. Book a time slot that works for you</li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Calendar Etiquette</h2>
        
        <p className="text-[#666] mb-4">
          Please be sure to confirm your attendance to all events during the AI Native. Follow the Instructions below to practice accepting invitations two ways.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Option 1 - From Your Email:</h3>
            <ol className="space-y-2 text-[#666]">
              <li>1. Sign into your Pursuit email at mail.google.com</li>
              <li>2. Find the calendar invitation in your inbox</li>
              <li>3. Click "YES" to accept</li>
            </ol>
          </div>

          <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Option 2 - From Your Calendar:</h3>
            <ol className="space-y-2 text-[#666]">
              <li>1. Open your Pursuit email at mail.google.com</li>
              <li>2. Click the Calendar icon on the right side of your screen</li>
              <li>3. Find the event called [In-Person] AI Native Program - L1</li>
              <li>4. Click to accept the invitation</li>
            </ol>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
          <p className="text-amber-800 text-sm">
            <strong>Practice:</strong> Try both methods above to accept the AI Native Program calendar invitation!
          </p>
        </div>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've accessed Google Calendar, watched the tutorial, and practiced accepting invitations, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default GoogleCalendar;
