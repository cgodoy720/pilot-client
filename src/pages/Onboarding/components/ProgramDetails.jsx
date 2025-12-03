import { ExternalLink } from 'lucide-react';

function ProgramDetails({ task, onComplete }) {
  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <p className="text-lg text-[#666] mb-6">
          This resource is to remind you how the Pursuit AI Program works and to review the expectations and responsibilities of each Builder. Please review it carefully to make sure you are aligned with program operations.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">I. Program Overview</h2>
        <p className="text-[#666] mb-4">
          The Pursuit AI Program teaches you how to use AI tools and build projects. You'll learn skills to help you get a good job in tech.
        </p>
        
        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">What makes this program special:</h3>
        <ul className="space-y-2 text-[#666]">
          <li><strong>AI-Powered Individual Learning:</strong> Utilizing AI tools for personalized learning pathways and skill development.</li>
          <li><strong>Self-Driven, Active Learning Through Building:</strong> Focusing on practical application and project-based learning.</li>
          <li><strong>Many-to-Many Learning and Teaching:</strong> Fostering a collaborative environment where Builders learn from and teach each other.</li>
          <li><strong>Industry Network-Integrated:</strong> Connecting Builders with industry professionals, mentors, and potential employers.</li>
          <li><strong>Adaptive Approach to Learning:</strong> Continuously adjusting the curriculum and approach based on real-time feedback and the evolving AI landscape.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">II. Schedule & Calendar</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">Program Kickoff Details</h3>
          <div className="text-blue-800 space-y-1">
            <p><strong>Start Date:</strong> December 6th, 2025</p>
            <p><strong>Arrival Time:</strong> 9:30 AM</p>
            <p className="text-sm">(If you have requested a loaner laptop, please arrive at 9:15 AM)</p>
            <p><strong>Program Start Time:</strong> 10:00 AM</p>
            <p><strong>Location:</strong> Pursuit HQ, 47-10 Austell Pl 2nd floor, Long Island City, NY 11101</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Weekly Schedule:</h3>
        <ul className="space-y-2 text-[#666] mb-4">
          <li><strong>Monday – Wednesday:</strong> 6:30 PM – 10:00 PM (In-person, Long Island City)</li>
          <li><strong>Saturday – Sunday:</strong> 10:00 AM – 4:00 PM (In-person, Long Island City)</li>
          <li>Plus time for learning and building projects on your own</li>
        </ul>

        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Program Timeline:</h3>
        <div className="space-y-3 text-[#666]">
          <div>
            <strong>Months 1-2:</strong> Learn AI Basics
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Understand how AI works</li>
              <li>• Try different AI tools</li>
              <li>• Start planning your first project</li>
            </ul>
          </div>
          <div>
            <strong>Months 3-4:</strong> Build with AI
            <p className="text-sm text-amber-600 ml-4 mt-1">
              Note: Progressing to months 3-7 is contingent on admission. See Month 2 Review Guidelines below.
            </p>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Create real AI projects</li>
              <li>• Work with mentors</li>
              <li>• Meet people in the tech industry</li>
            </ul>
          </div>
          <div>
            <strong>Months 5-7:</strong> Show Your Work
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Build your portfolio</li>
              <li>• Share your projects</li>
              <li>• Practice interviews and find jobs</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">III. Payment Agreement & Moving Forward</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-green-900 mb-2">The Good News:</h3>
          <ul className="space-y-1 text-green-800">
            <li>• No money needed to start</li>
            <li>• Only pay if you get a high-paying job ($85,000 or more per year)</li>
            <li>• If you don't get a job, you pay nothing</li>
            <li>• If you lose your job, payments stop until you get a new one</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Payment Details:</h3>
        <ul className="space-y-2 text-[#666]">
          <li><strong>Rate:</strong> 15% of what you earn each year</li>
          <li><strong>You stop paying when:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• You've paid for 36 months, OR</li>
              <li>• 5 years have passed since you started, OR</li>
              <li>• You've paid $55,000 total</li>
            </ul>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3 mt-6">Month 2 Review:</h3>
        <p className="text-[#666] mb-2">During Month 2, we'll check how you're doing based on:</p>
        <ul className="space-y-1 text-[#666]">
          <li>• Completion and quality of weekly video submissions</li>
          <li>• Demonstrated understanding of AI concepts</li>
          <li>• Ability to clearly articulate ideas and present viable work</li>
          <li>• Consistent attendance (80% or higher)</li>
          <li>• Active community engagement and openness to feedback</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">IV. Laptops & Logistics</h2>
        
        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Laptops:</h3>
        <ul className="space-y-2 text-[#666] mb-4">
          <li>• Bring your own laptop if you have one</li>
          <li>• Need to borrow one? <a href="https://docs.google.com/forms/d/e/1FAIpQLSfffn7wXk7wF35LuH-HwtioJbToYF7sRporUNNDat_0AqZTQg/viewform" target="_blank" rel="noopener noreferrer" className="text-[#4242EA] hover:underline inline-flex items-center gap-1">Fill out this form <ExternalLink className="h-3 w-3" /></a> - we'll try to help, but we have limited laptops</li>
          <li>• Borrowed laptops must stay at Pursuit - you can't take them home</li>
        </ul>

        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Program Logistics:</h3>
        <ol className="space-y-2 text-[#666]">
          <li>1. Please bring your laptop to all sessions moving forward.</li>
          <li>2. Make sure to check your email daily.</li>
          <li>3. Throughout this program, we will communicate via Slack and email. It's essential to check both daily to stay up to date with important information.</li>
          <li>4. Lunch is not provided during session, so please plan to bring it going forward.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">V. Attendance</h2>
        <p className="text-[#666] mb-4">
          Coming to class is very important. Your group depends on you being there.
        </p>
        
        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">Rules:</h3>
        <ul className="space-y-2 text-[#666]">
          <li>• You must come to all in-person classes</li>
          <li>• We will track who shows up</li>
          <li>• If you need to miss class, tell us ahead of time</li>
          <li>• Being present helps you and helps everyone in your group succeed.</li>
        </ul>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've reviewed all the program details above, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default ProgramDetails;
