import { AlertCircle, Calendar, Clock } from 'lucide-react';

function AttendancePolicy({ task, onComplete }) {
  return (
    <div className="max-w-4xl mx-auto prose prose-lg">
      <div className="mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Why Attendance Matters</h3>
              <p className="text-blue-800">
                Coming to class is very important. This program moves fast, and you learn by working with others. You need to be here to succeed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Attendance Rules</h2>
        <p className="text-[#666] text-xl mb-4">You must attend at least 80% of all classes.</p>
        
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-[#1E1E1E] mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Required Sessions:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Weekday Sessions</h4>
              <div className="text-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span><strong>Monday-Wednesday:</strong> 6:30 PM - 10:00 PM</span>
                </div>
                <div className="text-sm text-purple-600">Building projects</div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Weekend Sessions</h4>
              <div className="text-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span><strong>Saturday-Sunday:</strong> 10:00 AM - 4:00 PM</span>
                </div>
                <div className="text-sm text-green-600">Professional skills</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-amber-900 mb-2">How We Track Attendance:</h3>
          <p className="text-amber-800">
            Please be sure to log into our attendance app every day upon arrival onsite
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">When You Can Miss Class (Excused Absences)</h2>
        <p className="text-[#666] mb-4">You can miss class without penalty for these reasons:</p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#4242EA] rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-[#1E1E1E]">Medical emergencies</strong>
                <p className="text-sm text-[#666]">You're sick or need to care for a family member</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#4242EA] rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-[#1E1E1E]">Family emergencies</strong>
                <p className="text-sm text-[#666]">A death or serious illness in your immediate family</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#4242EA] rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-[#1E1E1E]">Legal reasons</strong>
                <p className="text-sm text-[#666]">Court, jury duty, or other required legal appointments</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#4242EA] rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-[#1E1E1E]">Religious holidays</strong>
                <p className="text-sm text-[#666]">Days important to your religion</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#4242EA] rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong className="text-[#1E1E1E]">Special events</strong>
                <p className="text-sm text-[#666]">Important life events (weddings, graduations) with approval ahead of time</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-900 mb-3">What You Need to Do:</h3>
          <ul className="space-y-2 text-red-800">
            <li><strong>Tell us before you miss class</strong> - Send an email to Afiyah (afiyah@pursuit.org) at least 24 hours ahead of class time.</li>
            <li><strong>Emergency?</strong> - Let us know via Slack or Email as soon as you can</li>
            <li><strong>Need proof?</strong> - If you miss more than 2 classes in a row or miss many times, we may ask for documentation</li>
            <li><strong>Catch up on work</strong> - You must review what you missed, finish assignments, and work with your group to catch up</li>
          </ul>
          <p className="text-red-800 mt-3 font-medium">
            <strong>Note:</strong> If you are going to be late, please slack Afiyah and let her know your ETA.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Missing Class Without a Good Reason (Unexcused Absences)</h2>
        <p className="text-[#666] mb-4">
          If you don't have one of the approved reasons above OR you don't tell us ahead of time, your absence is unexcused.
        </p>
        
        <h3 className="text-xl font-semibold text-[#1E1E1E] mb-3">What Happens:</h3>
        <ul className="space-y-2 text-[#666]">
          <li><strong>After 2 unexcused absences</strong> - You get a formal warning</li>
          <li><strong>After 3 unexcused absences</strong> - You'll meet with staff and create an improvement plan</li>
          <li><strong>3 unexcused absences in 2 weeks</strong> - Required meeting with staff about your commitment</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Serious Consequences</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-900 font-semibold mb-3">You can be removed from the program if:</p>
          <ul className="space-y-2 text-red-800">
            <li>• You don't follow your improvement plan</li>
            <li>• Your attendance drops below 75%</li>
            <li>• You have 5 or more unexcused absences in any 2-week period</li>
            <li>• You're gone for 7 days in a row without approval</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4">Weekly Schedule Visualization</h2>
        <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-semibold text-[#1E1E1E] p-2">
                {day}
              </div>
            ))}
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 text-center text-sm">
              <div className="font-semibold text-purple-900">6:30 PM</div>
              <div className="font-semibold text-purple-900">10:00 PM</div>
            </div>
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 text-center text-sm">
              <div className="font-semibold text-purple-900">6:30 PM</div>
              <div className="font-semibold text-purple-900">10:00 PM</div>
            </div>
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 text-center text-sm">
              <div className="font-semibold text-purple-900">6:30 PM</div>
              <div className="font-semibold text-purple-900">10:00 PM</div>
            </div>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center text-sm">
              <div className="text-gray-600">No Class</div>
            </div>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center text-sm">
              <div className="text-gray-600">No Class</div>
            </div>
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center text-sm">
              <div className="font-semibold text-green-900">10:00 AM</div>
              <div className="font-semibold text-green-900">4:00 PM</div>
            </div>
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center text-sm">
              <div className="font-semibold text-green-900">10:00 AM</div>
              <div className="font-semibold text-green-900">4:00 PM</div>
            </div>
          </div>
          <p className="text-sm text-[#666] text-center">
            <strong>Note:</strong> This is your weekly schedule. Monday-Wednesday evenings and Saturday-Sunday days are required attendance.
          </p>
        </div>
      </section>

      <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 mt-8">
        <p className="text-sm text-[#666] text-center">
          Once you've reviewed the attendance policy and calendar above, mark this task as complete using the checkbox in the top right.
        </p>
      </div>
    </div>
  );
}

export default AttendancePolicy;
