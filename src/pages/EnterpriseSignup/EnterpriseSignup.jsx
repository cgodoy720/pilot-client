import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import MultiStepForm from '../../components/MultiStepForm';
import SignupSuccessScreen from '../../components/SignupSuccessScreen';

/**
 * Dedicated enterprise signup page, linked directly from external-cohort
 * invitation emails as `/enterprise/signup?code=<ACCESS_CODE>`.
 *
 * Unlike the generic `/signup` page (which presents four account-type cards,
 * where many enterprise invitees mistakenly picked "Applicant"), this page goes
 * straight into the enterprise flow. It validates the code from the link,
 * confirms which cohort the person is joining, and — when the code is valid —
 * prefills + locks the access-code step so the invitee never has to type it.
 * Submission still hits the same `POST /api/enterprise/access` endpoint, so the
 * account is created exactly as it would be from the generic signup.
 */
const EnterpriseSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const codeFromUrl = (searchParams.get('code') || '').trim();

  // 'validating' | 'valid' | 'invalid' | 'none'
  const [codeState, setCodeState] = useState(codeFromUrl ? 'validating' : 'none');
  const [cohort, setCohort] = useState(null); // { type, name, description }

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Redirect if already authenticated (mirrors Signup.jsx)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Validate the invite code (without creating an account) so we can show the
  // cohort name and prefill/lock the access-code field.
  useEffect(() => {
    if (!codeFromUrl) {
      setCodeState('none');
      return;
    }

    let cancelled = false;
    setCodeState('validating');

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/enterprise/validate-code/${encodeURIComponent(codeFromUrl)}`
        );
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.valid) {
          setCohort({ type: data.type, name: data.name, description: data.description });
          setCodeState('valid');
        } else {
          setCodeState('invalid');
        }
      } catch (err) {
        console.error('Failed to validate access code:', err);
        if (!cancelled) setCodeState('invalid');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [codeFromUrl]);

  const handleMultiStepSubmit = async (formData) => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/enterprise/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_code: formData.accessCode,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationComplete(true);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated === null) {
    return null;
  }

  if (registrationComplete) {
    return <SignupSuccessScreen />;
  }

  // Full-screen loading state while we validate the code from the link.
  if (codeState === 'validating') {
    return (
      <div className="min-h-screen bg-pursuit-purple flex items-center justify-center px-8">
        <p className="text-white text-lg font-proxima">Verifying your invitation…</p>
      </div>
    );
  }

  // When the code is valid, prefill + lock it so the invitee never retypes it.
  // Otherwise (missing/invalid code), fall back to letting them enter it — this
  // page is still enterprise-only, so there's no way to become an Applicant.
  const codeValid = codeState === 'valid';

  const banner = (
    <div className="w-full max-w-2xl mb-8">
      {codeValid ? (
        <div className="bg-white/10 border border-white/30 rounded-2xl p-5">
          <p className="text-white/70 text-sm font-proxima mb-1">You've been invited to join</p>
          <h3 className="text-white text-xl md:text-2xl font-bold font-proxima leading-tight">
            {cohort?.name}
          </h3>
          {cohort?.description && (
            <p className="text-white/80 text-sm font-proxima mt-2 leading-relaxed">
              {cohort.description}
            </p>
          )}
          <p className="text-white/60 text-xs font-proxima mt-3">
            Access code applied automatically. Just create your account below.
          </p>
        </div>
      ) : (
        <div className="bg-white/10 border border-white/30 rounded-2xl p-5">
          <h3 className="text-white text-xl md:text-2xl font-bold font-proxima leading-tight">
            Enterprise Signup
          </h3>
          <p className="text-white/80 text-sm font-proxima mt-2 leading-relaxed">
            {codeState === 'invalid'
              ? "We couldn't verify that invitation link. Please enter the access code from your invitation email to continue."
              : 'Enter the access code from your invitation email to join your cohort.'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <MultiStepForm
      userType="enterprise"
      onSubmit={handleMultiStepSubmit}
      onBack={() => navigate('/login')}
      error={error}
      isSubmitting={isSubmitting}
      headerBanner={banner}
      precedingSteps={0}
      initialFormData={codeValid ? { accessCode: codeFromUrl } : {}}
      skipStepIds={codeValid ? ['accessCode'] : []}
    />
  );
};

export default EnterpriseSignup;
