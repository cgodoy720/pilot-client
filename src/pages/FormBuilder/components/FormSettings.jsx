import { useState } from 'react';
import { X, Plus } from 'lucide-react';

const FormSettings = ({ settings, questions = [], onUpdate }) => {
  const [emailInput, setEmailInput] = useState('');

  const emailQuestion = questions.find(
    (q) =>
      q.type === 'email' ||
      ((q.type === 'text' || q.type === 'long_text') &&
        typeof q.text === 'string' &&
        /\bemail\b/i.test(q.text))
  );

  const handleChange = (field, value) => {
    onUpdate({ ...settings, [field]: value });
  };

  const handleAddEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      const currentEmails = settings.notification_emails || [];
      if (!currentEmails.includes(emailInput)) {
        onUpdate({
          ...settings,
          notification_emails: [...currentEmails, emailInput]
        });
        setEmailInput('');
      }
    }
  };

  const handleRemoveEmail = (email) => {
    const currentEmails = settings.notification_emails || [];
    onUpdate({
      ...settings,
      notification_emails: currentEmails.filter(e => e !== email)
    });
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Form Settings</h2>

      {/* Response Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Response Settings</h3>
        
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allow_multiple_submissions}
              onChange={(e) => handleChange('allow_multiple_submissions', e.target.checked)}
              className="w-5 h-5 accent-[#4242ea] cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <strong className="text-gray-800 block">Allow Multiple Submissions</strong>
              <p className="text-sm text-gray-600 mt-1">
                Allow respondents to submit the form more than once
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.require_email}
              onChange={(e) => handleChange('require_email', e.target.checked)}
              className="w-5 h-5 accent-[#4242ea] cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <strong className="text-gray-800 block">Require Email Address</strong>
              <p className="text-sm text-gray-600 mt-1">
                Collect respondent email addresses
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_progress}
              onChange={(e) => handleChange('show_progress', e.target.checked)}
              className="w-5 h-5 accent-[#4242ea] cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <strong className="text-gray-800 block">Show Progress Indicator</strong>
              <p className="text-sm text-gray-600 mt-1">
                Display progress bar to respondents
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enable_save_continue}
              onChange={(e) => handleChange('enable_save_continue', e.target.checked)}
              className="w-5 h-5 accent-[#4242ea] cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <strong className="text-gray-800 block">Enable Save & Continue Later</strong>
              <p className="text-sm text-gray-600 mt-1">
                Allow respondents to save progress and complete later
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Completion Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Completion Settings</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Thank You Message</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base resize-vertical transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            value={settings.thank_you_message}
            onChange={(e) => handleChange('thank_you_message', e.target.value)}
            placeholder="Thank you for your submission!"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Redirect URL (Optional)</label>
          <input
            type="url"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            value={settings.redirect_url || ''}
            onChange={(e) => handleChange('redirect_url', e.target.value)}
            placeholder="https://example.com/thank-you"
          />
          <p className="text-sm text-gray-600 mt-2">
            Redirect respondents to this URL after submission
          </p>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Email Notifications</h3>
        
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => handleChange('email_notifications', e.target.checked)}
              className="w-5 h-5 accent-[#4242ea] cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <strong className="text-gray-800 block">Send Email Notifications</strong>
              <p className="text-sm text-gray-600 mt-1">
                Receive an email when someone submits this form
              </p>
            </div>
          </label>
        </div>

        {settings.email_notifications && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Recipients</label>
            {(settings.notification_emails || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(settings.notification_emails || []).map((email, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 px-3 py-2 bg-[#4242ea]/10 text-[#4242ea] rounded-lg text-sm"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-[#4242ea] hover:text-[#3333d1] transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                placeholder="Enter email address"
              />
              <button
                onClick={handleAddEmail}
                className="px-4 py-2 bg-[#4242ea] text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-[#3333d1]"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Email to Respondent */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Confirmation Email to Respondent</h3>

        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.confirmation_email_enabled || false}
              onChange={(e) => handleChange('confirmation_email_enabled', e.target.checked)}
              className="w-5 h-5 accent-[#4242ea] cursor-pointer mt-0.5"
            />
            <div className="flex-1">
              <strong className="text-gray-800 block">Send a Confirmation Email</strong>
              <p className="text-sm text-gray-600 mt-1">
                Email the respondent a confirmation when they submit this form
              </p>
            </div>
          </label>
        </div>

        {settings.confirmation_email_enabled && (
          <div className="space-y-4">
            {!settings.require_email && emailQuestion && (
              <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                We'll send the confirmation to the answer of{' '}
                <strong>"{emailQuestion.text}"</strong>. Enable <strong>Require Email Address</strong> above to also collect an email up front.
              </div>
            )}
            {!settings.require_email && !emailQuestion && (
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                Enable <strong>Require Email Address</strong> above, or add a question whose label contains "email", so we have somewhere to send the confirmation. Without either, no email will be sent.
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={settings.confirmation_email_from_name || ''}
                onChange={(e) => handleChange('confirmation_email_from_name', e.target.value)}
                placeholder="Pursuit"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={settings.confirmation_email_subject || ''}
                onChange={(e) => handleChange('confirmation_email_subject', e.target.value)}
                placeholder="Thank you for your submission to {{form_title}}"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Body</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base font-mono resize-vertical transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
                value={settings.confirmation_email_body || ''}
                onChange={(e) => handleChange('confirmation_email_body', e.target.value)}
                placeholder={'Hi,\n\nThanks for submitting "{{form_title}}" on {{submission_date}}. We\'ve received your response and will be in touch if we need anything further.\n\n— The Pursuit Team'}
                rows={8}
              />
            </div>

            <p className="text-xs text-gray-500">
              Available variables: <code className="px-1 py-0.5 bg-gray-100 rounded">{'{{form_title}}'}</code>{' '}
              <code className="px-1 py-0.5 bg-gray-100 rounded">{'{{submission_date}}'}</code>{' '}
              <code className="px-1 py-0.5 bg-gray-100 rounded">{'{{respondent_email}}'}</code>. Leave any field blank to use the default.
            </p>
          </div>
        )}
      </div>

      {/* Form Limits */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Form Limits (Optional)</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Submission Limit</label>
          <input
            type="number"
            className="w-48 px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            value={settings.submission_limit || ''}
            onChange={(e) => handleChange('submission_limit', parseInt(e.target.value) || null)}
            placeholder="Unlimited"
            min="1"
          />
          <p className="text-sm text-gray-600 mt-2">
            Stop accepting responses after this many submissions
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiration Date</label>
          <input
            type="datetime-local"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            value={settings.expires_at || ''}
            onChange={(e) => handleChange('expires_at', e.target.value)}
          />
          <p className="text-sm text-gray-600 mt-2">
            Stop accepting responses after this date/time
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormSettings;
