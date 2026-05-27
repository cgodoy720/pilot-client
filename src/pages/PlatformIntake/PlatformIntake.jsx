import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/animate-ui/components/animate/tooltip';
import useAuthStore from '../../stores/authStore';
import { submitIntake } from '../../services/platformIntakeService';

const PLATFORM_COMPONENTS = [
  'Dashboard',
  'Learning / Curriculum',
  'AI Chat',
  'Calendar',
  'Assessment',
  'Performance',
  'Pathfinder',
  'Attendance',
  'Admissions',
  'Form Builder',
  'Volunteer Management',
  'Sales Tracker',
  'Content Management',
  'Admin Dashboard',
  'Weekly Reports',
  'Platform Analytics',
  'Permissions',
  'Organization Management',
  'Other',
];

const BUG_PRIORITIZATION_OPTIONS = [
  { value: 'urgent', label: 'Urgent (fix in 24 hours)' },
  { value: 'high', label: 'High (fix in 1 week)' },
  { value: 'medium', label: 'Medium (fix in 2 weeks)' },
  { value: 'low', label: 'Low (fix in 2+ weeks)' },
];

const FEATURE_PRIORITIZATION_OPTIONS = [
  { value: 'urgent', label: 'Urgent (add in 24 hours)' },
  { value: 'high', label: 'High (add in 1 week)' },
  { value: 'medium', label: 'Medium (add in 2 weeks)' },
  { value: 'low', label: 'Low (add in 2+ weeks)' },
];

const INITIAL_FORM = {
  reporter: '',
  reporter_email: '',
  type: 'bug',
  title: '',
  description: '',
  platform_component: '',
  recommended_prioritization: '',
  prioritization_justification: '',
};

const TOOLTIPS = {
  bug: {
    title:
      "Write one clear sentence describing what is broken. Be specific, and start with the broken behavior or the affected component (e.g. 'Builder dashboard shows incorrect cohort assignment after re-enrollment').",
    description: (
      <div className="space-y-1.5">
        <p>First, describe what should happen when it works correctly.</p>
        <p>
          Then, describe what's happening instead — copy any error messages verbatim and note what
          you see on screen.
        </p>
        <p>
          Finally, describe the steps to reproduce. Include the exact page/section, what you did
          before it broke, whether it happens every time or only sometimes, and who is affected
          (everyone, specific users, cohorts, or roles).
        </p>
      </div>
    ),
    platform_component:
      'Select the part of the platform most directly affected. If you are unsure, pick the closest match and explain in the Description above.',
    upload:
      'Attach a screenshot or screen recording showing the bug occurring. This is a mandatory field — visual evidence dramatically speeds up diagnosis.',
    prioritization: (
      <div className="space-y-1.5">
        <p>
          <strong>Urgent:</strong> The platform is broken for a significant number of users right
          now, blocking core program activities (e.g., Builders can't log in, attendance can't be
          recorded during a live session, curriculum is completely inaccessible). Use this
          sparingly — it triggers immediate escalation.
        </p>
        <p>
          <strong>High:</strong> The bug significantly impairs an important workflow, but a
          workaround exists. It affects multiple users or surfaces frequently. Example: Cohort data
          displaying incorrectly in reports.
        </p>
        <p>
          <strong>Medium:</strong> The bug is noticeable and annoying but doesn't block work.
          Affects a subset of users or edge-case flows. Example: A filter not resetting properly
          after search.
        </p>
        <p>
          <strong>Low:</strong> Minor visual or cosmetic issue with no impact on functionality.
          Example: A label is truncated on a specific screen size.
        </p>
      </div>
    ),
    justification:
      'Explain why you selected the priority level above. Reference the user impact, the scope, and any time pressure.',
  },
  feature: {
    title:
      "Write one line describing the feature. Always start with a verb — this forces clarity about what the platform should do (e.g. 'Add a weekly attendance summary view to the cohort dashboard'; 'Allow facilitators to mark a task as optional for specific builders').",
    description: (
      <div className="space-y-1">
        <p>
          Describe the feature in enough detail that a developer could scope the work without asking
          follow-up questions. Include:
        </p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>What user problem does this solve?</li>
          <li>Who would use it — Builders, facilitators, staff, admins?</li>
          <li>What would the experience look like?</li>
          <li>Are there edge cases or constraints to account for?</li>
        </ul>
      </div>
    ),
    platform_component:
      'Select the part of the platform where this feature would live or that it would most directly affect. If the feature spans multiple components, select the primary one and explain the rest in the Description.',
    prioritization: (
      <div className="space-y-1.5">
        <p>
          <strong>Urgent:</strong> The platform cannot support an imminent program need without this
          feature. Only use if a scheduled session or cohort milestone is blocked today. Very rare.
        </p>
        <p>
          <strong>High:</strong> The feature unlocks a workflow that is currently being done
          manually or with significant friction. Affects many users. Has a concrete upcoming
          deadline.
        </p>
        <p>
          <strong>Medium:</strong> A meaningful improvement to an existing workflow. Nice to have
          before a specific cycle or event, but not immediately blocking.
        </p>
        <p>
          <strong>Low:</strong> A useful improvement with no time pressure. Would make the
          experience better but is not tied to any near-term program milestone.
        </p>
      </div>
    ),
    justification:
      'Explain why you selected the priority level above. Reference the program impact, user scope, and any upcoming deadlines.',
  },
};

function FieldLabel({ htmlFor, children, required, tooltip, wide }) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {children} {required && <span className="text-red-500">*</span>}
      </label>
      {tooltip && (
        <Tooltip side="top" sideOffset={6}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="More information"
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4242EA] rounded-full inline-flex"
            >
              <Info size={14} aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent className={wide ? 'max-w-sm' : 'max-w-xs'}>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export default function PlatformIntake() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    reporter: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    reporter_email: user?.email || '',
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type }));
    if (type === 'feature') setUploadFile(null);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.type === 'bug' && !uploadFile) {
      setError('A screenshot or video is required for bug reports.');
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => data.append(key, val));
    if (uploadFile) data.append('upload', uploadFile);

    setIsSubmitting(true);
    try {
      await submitIntake(data, token);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnother = () => {
    setSubmitted(false);
    setUploadFile(null);
    setForm({
      ...INITIAL_FORM,
      reporter: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
      reporter_email: user?.email || '',
    });
  };

  const inputClass =
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4242EA] focus:border-transparent';

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto mt-20 text-center p-8">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Request submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your {form.type === 'bug' ? 'bug report' : 'feature request'} has been shared with the team.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAnother}
              className="px-5 py-2 bg-[#4242EA] text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Submit another
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const t = TOOLTIPS[form.type];

  return (
    <Layout>
      <TooltipProvider openDelay={300} closeDelay={150}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Platform Intake</h1>
          <p className="text-gray-500 text-sm mb-6">
            Report a bug or request a new feature. All fields are required. Requests are reviewed on a regular basis.
          </p>

          {/* Type Toggle */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <button
                type="button"
                onClick={() => handleTypeChange('bug')}
                className={`w-full px-5 py-2 rounded-md text-sm font-medium border transition-colors ${
                  form.type === 'bug'
                    ? 'bg-[#4242EA] text-white border-[#4242EA]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bug
              </button>
              <p className="text-xs text-gray-500 mt-1.5 px-1">
                Select this if something on the platform is broken, not working as expected, or producing an error.
              </p>
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => handleTypeChange('feature')}
                className={`w-full px-5 py-2 rounded-md text-sm font-medium border transition-colors ${
                  form.type === 'feature'
                    ? 'bg-[#4242EA] text-white border-[#4242EA]'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Feature
              </button>
              <p className="text-xs text-gray-500 mt-1.5 px-1">
                Select this if you want to request something new — a capability, improvement, or addition that doesn't exist yet.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Reporter */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="reporter" required>
                  Reporter name
                </FieldLabel>
                <input
                  id="reporter"
                  name="reporter"
                  value={form.reporter}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <FieldLabel htmlFor="reporter_email" required>
                  Reporter email
                </FieldLabel>
                <input
                  id="reporter_email"
                  name="reporter_email"
                  type="email"
                  value={form.reporter_email}
                  readOnly
                  required
                  className={`${inputClass} bg-gray-50 cursor-not-allowed`}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <FieldLabel htmlFor="title" required tooltip={t.title}>
                Title
              </FieldLabel>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder={
                  form.type === 'bug'
                    ? 'One-line summary of the bug'
                    : 'One-line summary of the feature'
                }
              />
            </div>

            {/* Description */}
            <div>
              <FieldLabel htmlFor="description" required tooltip={t.description} wide>
                Description
              </FieldLabel>
              <p className="text-xs text-gray-400 mb-1">The more descriptive you are in this section, the better our team can address the issue.</p>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                className={inputClass}
                placeholder={
                  form.type === 'bug'
                    ? 'What is the expected output?\nWhat is the actual output?\nWhen does it occur?'
                    : 'What does the feature do? How should it work?'
                }
              />
            </div>

            {/* Platform Component */}
            <div>
              <FieldLabel htmlFor="platform_component" required tooltip={t.platform_component}>
                Platform component
              </FieldLabel>
              <select
                id="platform_component"
                name="platform_component"
                value={form.platform_component}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select a component...</option>
                {PLATFORM_COMPONENTS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload (bugs only) */}
            {form.type === 'bug' && (
              <div>
                <FieldLabel htmlFor="upload" required tooltip={TOOLTIPS.bug.upload}>
                  Upload screenshot or video
                </FieldLabel>
                <input
                  id="upload"
                  type="file"
                  accept="image/jpeg,image/png,video/quicktime"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#4242EA] file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or MOV — max 50MB</p>
              </div>
            )}

            {/* Prioritization */}
            <div>
              <FieldLabel
                htmlFor="recommended_prioritization"
                required
                tooltip={t.prioritization}
                wide
              >
                Recommended prioritization
              </FieldLabel>
              <select
                id="recommended_prioritization"
                name="recommended_prioritization"
                value={form.recommended_prioritization}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select prioritization...</option>
                {(form.type === 'bug' ? BUG_PRIORITIZATION_OPTIONS : FEATURE_PRIORITIZATION_OPTIONS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Justification */}
            <div>
              <FieldLabel
                htmlFor="prioritization_justification"
                required
                tooltip={t.justification}
              >
                Prioritization justification
              </FieldLabel>
              <textarea
                id="prioritization_justification"
                name="prioritization_justification"
                value={form.prioritization_justification}
                onChange={handleChange}
                required
                rows={3}
                className={inputClass}
                placeholder="Why did you select the prioritization above?"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#4242EA] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : `Submit ${form.type === 'bug' ? 'bug report' : 'feature request'}`}
            </button>
          </form>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
