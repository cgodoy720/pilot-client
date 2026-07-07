import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Bug, Lightbulb, CheckCircle2, UploadCloud } from 'lucide-react';
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

const TYPE_OPTIONS = [
  {
    value: 'bug',
    label: 'Bug',
    icon: Bug,
    blurb: 'Something on the platform is broken, not working as expected, or producing an error.',
  },
  {
    value: 'feature',
    label: 'Feature',
    icon: Lightbulb,
    blurb: "Request something new — a capability, improvement, or addition that doesn't exist yet.",
  },
];

function FieldLabel({ htmlFor, children, required, tooltip, wide }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5">
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

function SectionHeading({ step, title, hint }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4242EA]/10 text-[#4242EA] text-xs font-bold">
          {step}
        </span>
        {title}
      </h2>
      {hint && <p className="text-xs text-gray-400 mt-1 ml-7">{hint}</p>}
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
    'w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4242EA] focus:border-transparent';

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto mt-24 px-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Request submitted!</h2>
            <p className="text-gray-500 mb-8">
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
        </div>
      </Layout>
    );
  }

  const t = TOOLTIPS[form.type];

  return (
    <Layout>
      <TooltipProvider openDelay={300} closeDelay={150}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-10">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Platform Intake</h1>
            <p className="text-gray-500 text-sm">
              Report a bug or request a new feature. All fields are required. Requests are reviewed on a regular basis.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm lg:grid lg:grid-cols-[5fr_7fr]">
              {/* Type */}
              <div className="px-6 py-5 sm:px-8 border-b border-gray-100 lg:col-start-1 lg:row-start-1">
                <SectionHeading step="1" title="What kind of request is this?" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                  {TYPE_OPTIONS.map(({ value, label, icon: Icon, blurb }) => {
                    const selected = form.type === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={label}
                        aria-pressed={selected}
                        onClick={() => handleTypeChange(value)}
                        className={`relative text-left rounded-lg border p-3 transition-colors ${
                          selected
                            ? 'border-[#4242EA] ring-2 ring-[#4242EA]/20 bg-[#4242EA]/[0.03]'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                              selected ? 'bg-[#4242EA] text-white' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            <Icon size={18} aria-hidden="true" />
                          </span>
                          <span>
                            <span
                              className={`block text-sm font-semibold ${
                                selected ? 'text-[#4242EA]' : 'text-gray-800'
                              }`}
                            >
                              {label}
                            </span>
                            <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                              {blurb}
                            </span>
                          </span>
                        </div>
                        {selected && (
                          <CheckCircle2
                            className="absolute top-3 right-3 h-4 w-4 text-[#4242EA]"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reporter */}
              <div className="px-6 py-5 sm:px-8 border-b border-gray-100 lg:col-start-1 lg:row-start-2">
                <SectionHeading step="2" title="Who's reporting" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Details */}
              <div className="px-6 py-5 sm:px-8 border-b border-gray-100 lg:border-b-0 lg:border-l lg:col-start-2 lg:row-start-1 lg:row-span-3">
                <SectionHeading
                  step="4"
                  title={form.type === 'bug' ? 'What happened' : 'What do you need'}
                  hint="The more descriptive you are, the better our team can address it."
                />
                <div className="space-y-4">
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

                  <div>
                    <FieldLabel htmlFor="description" required tooltip={t.description} wide>
                      Description
                    </FieldLabel>
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

                  <div>
                    <FieldLabel
                      htmlFor="platform_component"
                      required
                      tooltip={t.platform_component}
                    >
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

                  {form.type === 'bug' && (
                    <div>
                      <FieldLabel htmlFor="upload" required tooltip={TOOLTIPS.bug.upload}>
                        Upload screenshot or video
                      </FieldLabel>
                      <label
                        htmlFor="upload"
                        className={`flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 cursor-pointer transition-colors ${
                          uploadFile
                            ? 'border-[#4242EA]/60 bg-[#4242EA]/[0.03]'
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                        }`}
                      >
                        <UploadCloud
                          size={20}
                          className={uploadFile ? 'text-[#4242EA]' : 'text-gray-400'}
                          aria-hidden="true"
                        />
                        <span className="text-sm">
                          {uploadFile ? (
                            <span className="font-medium text-gray-800">{uploadFile.name}</span>
                          ) : (
                            <>
                              <span className="font-medium text-[#4242EA]">Choose a file</span>
                              <span className="text-gray-500"> showing the bug occurring</span>
                            </>
                          )}
                          <span className="block text-xs text-gray-400 mt-0.5">
                            JPEG, PNG, or MOV — max 50MB
                          </span>
                        </span>
                      </label>
                      <input
                        id="upload"
                        type="file"
                        accept="image/jpeg,image/png,video/quicktime"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Prioritization */}
              <div className="px-6 py-5 sm:px-8 border-b border-gray-100 lg:border-b-0 lg:col-start-1 lg:row-start-3">
                <SectionHeading step="3" title="How urgent is it?" />
                <div className="space-y-4">
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
                      {(form.type === 'bug'
                        ? BUG_PRIORITIZATION_OPTIONS
                        : FEATURE_PRIORITIZATION_OPTIONS
                      ).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 sm:px-8 bg-gray-50 rounded-b-xl border-t border-gray-100 lg:col-span-2 lg:row-start-4">
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
                    {error}
                  </p>
                )}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-gray-400">
                    All fields are required <span className="text-red-500">*</span>
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#4242EA] text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : `Submit ${form.type === 'bug' ? 'bug report' : 'feature request'}`}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </TooltipProvider>
    </Layout>
  );
}
