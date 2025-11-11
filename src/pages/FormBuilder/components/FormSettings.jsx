import { useState } from 'react';
import './FormSettings.css';

const FormSettings = ({ settings, onUpdate }) => {
  const [emailInput, setEmailInput] = useState('');

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
    <div className="form-settings">
      <h2 className="form-settings__title">Form Settings</h2>

      <div className="form-settings__section">
        <h3 className="form-settings__section-title">Response Settings</h3>
        
        <div className="form-settings__field">
          <label className="form-settings__checkbox-label">
            <input
              type="checkbox"
              checked={settings.allow_multiple_submissions}
              onChange={(e) => handleChange('allow_multiple_submissions', e.target.checked)}
            />
            <div>
              <strong>Allow Multiple Submissions</strong>
              <p className="form-settings__help-text">
                Allow respondents to submit the form more than once
              </p>
            </div>
          </label>
        </div>

        <div className="form-settings__field">
          <label className="form-settings__checkbox-label">
            <input
              type="checkbox"
              checked={settings.require_email}
              onChange={(e) => handleChange('require_email', e.target.checked)}
            />
            <div>
              <strong>Require Email Address</strong>
              <p className="form-settings__help-text">
                Collect respondent email addresses
              </p>
            </div>
          </label>
        </div>

        <div className="form-settings__field">
          <label className="form-settings__checkbox-label">
            <input
              type="checkbox"
              checked={settings.show_progress}
              onChange={(e) => handleChange('show_progress', e.target.checked)}
            />
            <div>
              <strong>Show Progress Indicator</strong>
              <p className="form-settings__help-text">
                Display progress bar to respondents
              </p>
            </div>
          </label>
        </div>

        <div className="form-settings__field">
          <label className="form-settings__checkbox-label">
            <input
              type="checkbox"
              checked={settings.enable_save_continue}
              onChange={(e) => handleChange('enable_save_continue', e.target.checked)}
            />
            <div>
              <strong>Enable Save & Continue Later</strong>
              <p className="form-settings__help-text">
                Allow respondents to save progress and complete later
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="form-settings__section">
        <h3 className="form-settings__section-title">Completion Settings</h3>
        
        <div className="form-settings__field">
          <label className="form-settings__label">Thank You Message</label>
          <textarea
            className="form-settings__textarea"
            value={settings.thank_you_message}
            onChange={(e) => handleChange('thank_you_message', e.target.value)}
            placeholder="Thank you for your submission!"
            rows={3}
          />
        </div>

        <div className="form-settings__field">
          <label className="form-settings__label">Redirect URL (Optional)</label>
          <input
            type="url"
            className="form-settings__input"
            value={settings.redirect_url || ''}
            onChange={(e) => handleChange('redirect_url', e.target.value)}
            placeholder="https://example.com/thank-you"
          />
          <p className="form-settings__help-text">
            Redirect respondents to this URL after submission
          </p>
        </div>
      </div>

      <div className="form-settings__section">
        <h3 className="form-settings__section-title">Email Notifications</h3>
        
        <div className="form-settings__field">
          <label className="form-settings__checkbox-label">
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => handleChange('email_notifications', e.target.checked)}
            />
            <div>
              <strong>Send Email Notifications</strong>
              <p className="form-settings__help-text">
                Receive an email when someone submits this form
              </p>
            </div>
          </label>
        </div>

        {settings.email_notifications && (
          <div className="form-settings__field">
            <label className="form-settings__label">Notification Recipients</label>
            <div className="form-settings__email-list">
              {(settings.notification_emails || []).map((email, index) => (
                <div key={index} className="form-settings__email-item">
                  <span>{email}</span>
                  <button
                    className="form-settings__remove-email-btn"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="form-settings__email-input-group">
              <input
                type="email"
                className="form-settings__input"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                placeholder="Enter email address"
              />
              <button
                className="form-settings__add-email-btn"
                onClick={handleAddEmail}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="form-settings__section">
        <h3 className="form-settings__section-title">Form Limits (Optional)</h3>
        
        <div className="form-settings__field">
          <label className="form-settings__label">Submission Limit</label>
          <input
            type="number"
            className="form-settings__input form-settings__input--small"
            value={settings.submission_limit || ''}
            onChange={(e) => handleChange('submission_limit', parseInt(e.target.value) || null)}
            placeholder="Unlimited"
            min="1"
          />
          <p className="form-settings__help-text">
            Stop accepting responses after this many submissions
          </p>
        </div>

        <div className="form-settings__field">
          <label className="form-settings__label">Expiration Date</label>
          <input
            type="datetime-local"
            className="form-settings__input"
            value={settings.expires_at || ''}
            onChange={(e) => handleChange('expires_at', e.target.value)}
          />
          <p className="form-settings__help-text">
            Stop accepting responses after this date/time
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormSettings;

