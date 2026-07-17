import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from '../../assets/logo-full.png';

const PURSUIT_PURPLE = '#4E4DED';

const DECISION_OPTIONS = [
    { value: 'unsubscribe', label: 'I no longer want to apply to the program.' },
    { value: 'defer', label: 'I want to defer my application and be considered for a future cohort.' }
];

const REASON_OPTIONS = [
    { value: 'time_commitment', label: 'I cannot commit to the time right now' },
    { value: 'emergency', label: 'I am experiencing a personal or family emergency' },
    { value: 'not_interested', label: 'I am no longer interested in the program' },
    { value: 'other', label: 'Other' }
];

const OptionCard = ({ label, selected, onSelect }) => (
    <div
        onClick={onSelect}
        className={`group relative w-full min-h-[48px] border rounded-[12px] shadow-[4px_4px_40px_rgba(0,0,0,0.05)] flex items-center justify-between px-5 py-3 cursor-pointer transition-colors duration-200 overflow-hidden ${
            selected ? 'border-white bg-white' : 'border-white/30 bg-transparent hover:border-white'
        }`}
    >
        <div className={`absolute inset-0 bg-white transition-transform duration-300 ${
            selected ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'
        }`} />
        <p className={`relative z-10 text-base leading-snug text-left flex-1 transition-colors duration-200 ${
            selected ? 'text-[#4E4DED]' : 'text-white group-hover:text-[#4E4DED]'
        }`}>
            {label}
        </p>
        {selected && (
            <div className="relative z-10 w-5 h-5 rounded-full bg-[#4E4DED] flex items-center justify-center flex-shrink-0 ml-4">
                <span className="text-white text-xs font-bold">✓</span>
            </div>
        )}
    </div>
);

const PageShell = ({ children }) => (
    <div className="min-h-screen relative flex flex-col bg-[#4E4DED] font-proxima">
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 py-16">
            {children}
        </div>
        <img src={logo} alt="Pursuit" className="hidden md:block absolute bottom-8 right-8 h-10 w-auto opacity-90" />
    </div>
);

const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [applicantData, setApplicantData] = useState(null);
    const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState({
        decision: '', // 'unsubscribe' or 'defer'
        reason: '',
        otherReason: ''
    });

    const applicantId = searchParams.get('id');

    useEffect(() => {
        if (applicantId) {
            fetchApplicantData();
        } else {
            setError('Invalid unsubscribe link. Missing applicant ID.');
        }
    }, [applicantId]);

    const fetchApplicantData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicants/${applicantId}/unsubscribe-info`);

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Applicant not found. This unsubscribe link may be invalid.');
                } else {
                    setError('Unable to load applicant information.');
                }
                return;
            }

            const data = await response.json();
            setApplicantData(data);
            setAlreadyUnsubscribed(data.email_opt_out);
        } catch (error) {
            console.error('Error fetching applicant data:', error);
            setError('Unable to connect to the server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialUnsubscribe = () => {
        setShowConfirmation(true);
    };

    const handleConfirmationChange = (field, value) => {
        setConfirmationData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFinalSubmit = async () => {
        // Validate required fields
        if (!confirmationData.decision) {
            await Swal.fire({
                title: 'Please Select an Option',
                text: 'Please choose whether you want to unsubscribe or defer your application.',
                icon: 'warning',
                confirmButtonColor: PURSUIT_PURPLE
            });
            return;
        }

        if (!confirmationData.reason) {
            await Swal.fire({
                title: 'Please Select a Reason',
                text: 'Please let us know why you\'re making this decision.',
                icon: 'warning',
                confirmButtonColor: PURSUIT_PURPLE
            });
            return;
        }

        if (confirmationData.reason === 'other' && !confirmationData.otherReason.trim()) {
            await Swal.fire({
                title: 'Please Provide Details',
                text: 'Please provide more details about your reason.',
                icon: 'warning',
                confirmButtonColor: PURSUIT_PURPLE
            });
            return;
        }

        try {
            setLoading(true);

            const requestData = {
                decision: confirmationData.decision,
                reason: confirmationData.reason,
                otherReason: confirmationData.reason === 'other' ? confirmationData.otherReason : null
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/applications/applicants/${applicantId}/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Failed to process request');
            }

            // Show success message based on decision
            const successTitle = confirmationData.decision === 'defer'
                ? 'Application Deferred'
                : 'Successfully Unsubscribed';

            const successMessage = confirmationData.decision === 'defer'
                ? 'Your application has been deferred and you will be considered for a future cohort. We\'ll reach out when the next application cycle opens.'
                : 'You have been successfully unsubscribed from automated emails for the Pursuit AI-Native Program.';

            await Swal.fire({
                title: successTitle,
                text: successMessage,
                icon: 'success',
                confirmButtonText: 'Close',
                confirmButtonColor: PURSUIT_PURPLE
            });

            setAlreadyUnsubscribed(true);
            setShowConfirmation(false);
        } catch (error) {
            console.error('Error processing request:', error);
            await Swal.fire({
                title: 'Error',
                text: 'Unable to process your request. Please try again or contact support.',
                icon: 'error',
                confirmButtonColor: PURSUIT_PURPLE
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !applicantData) {
        return (
            <PageShell>
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
                <p className="text-white">Loading...</p>
            </PageShell>
        );
    }

    if (error) {
        return (
            <PageShell>
                <div className="w-full max-w-[660px] text-left animate-fade-in-up">
                    <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">
                        Something went wrong
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed mb-4">{error}</p>
                    <p className="text-white/60 text-base">
                        If you believe this is an error, please contact us at{' '}
                        <a href="mailto:admissions@pursuit.org" className="text-white underline hover:text-white/80">
                            admissions@pursuit.org
                        </a>
                    </p>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <div className="w-full max-w-[660px]">
                <p className="text-white/70 text-sm font-bold tracking-widest uppercase mb-3">
                    Pursuit AI-Native Program
                </p>

                {alreadyUnsubscribed ? (
                    <div className="animate-fade-in-up">
                        <h1 className="text-white text-2xl md:text-3xl font-bold mb-6">
                            You're unsubscribed
                        </h1>
                        <p className="text-white/80 text-lg leading-relaxed mb-4">
                            You have already been unsubscribed from automated emails for the Pursuit AI-Native Program.
                        </p>
                        <p className="text-white/60 text-base">
                            If you're still receiving emails, please contact us at{' '}
                            <a href="mailto:admissions@pursuit.org" className="text-white underline hover:text-white/80">
                                admissions@pursuit.org
                            </a>
                        </p>
                    </div>
                ) : !showConfirmation ? (
                    <div className="animate-fade-in-up">
                        <h1 className="text-white text-2xl md:text-3xl font-bold mb-4">
                            No longer interested in applying?
                        </h1>
                        {applicantData && (
                            <p className="text-white/80 text-base mb-6">
                                {applicantData.first_name} {applicantData.last_name} · {applicantData.email}
                            </p>
                        )}
                        <p className="text-white/90 text-lg leading-relaxed mb-8">
                            If you are no longer interested in applying for the program, you can unsubscribe here.
                        </p>

                        <div className="border border-white/30 rounded-[12px] p-5 mb-4">
                            <p className="text-white font-semibold mb-3">This will stop:</p>
                            <ul className="list-disc list-inside space-y-1.5">
                                <li className="text-white/80">Application reminders</li>
                                <li className="text-white/80">Info session notifications</li>
                                <li className="text-white/80">Workshop invitations</li>
                                <li className="text-white/80">Program updates and deadlines</li>
                            </ul>
                        </div>

                        <div className="bg-white/10 rounded-[12px] p-5 mb-8">
                            <p className="text-white/90 text-sm leading-relaxed">
                                <span className="font-semibold">Important:</span> You may still receive essential
                                administrative emails related to your application status, acceptance, or other
                                critical program information.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInitialUnsubscribe}
                                disabled={loading}
                                className="px-6 py-2 bg-white text-[#4E4DED] hover:bg-gray-100 rounded-lg border border-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                            >
                                CONTINUE
                            </button>
                        </div>

                        <p className="text-white/60 text-sm mt-8">
                            If you have questions or need assistance, please contact us at{' '}
                            <a href="mailto:admissions@pursuit.org" className="text-white underline hover:text-white/80">
                                admissions@pursuit.org
                            </a>
                        </p>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        <h1 className="text-white text-2xl md:text-3xl font-bold mb-4">
                            Are you sure you don't want to apply?
                        </h1>
                        <p className="text-white/90 text-lg leading-relaxed mb-8">
                            Please confirm your decision below. Both fields are required.
                        </p>

                        <div className="mb-8">
                            <p className="text-white text-lg font-semibold mb-3">
                                Your decision <span className="text-white/70">*</span>
                            </p>
                            <div className="flex flex-col gap-3">
                                {DECISION_OPTIONS.map(option => (
                                    <OptionCard
                                        key={option.value}
                                        label={option.label}
                                        selected={confirmationData.decision === option.value}
                                        onSelect={() => handleConfirmationChange('decision', option.value)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-white text-lg font-semibold mb-3">
                                Please let us know why <span className="text-white/70">*</span>
                            </p>
                            <div className="flex flex-col gap-3">
                                {REASON_OPTIONS.map(option => (
                                    <OptionCard
                                        key={option.value}
                                        label={option.label}
                                        selected={confirmationData.reason === option.value}
                                        onSelect={() => handleConfirmationChange('reason', option.value)}
                                    />
                                ))}
                            </div>
                            {confirmationData.reason === 'other' && (
                                <textarea
                                    placeholder="Please provide more details..."
                                    value={confirmationData.otherReason}
                                    onChange={(e) => handleConfirmationChange('otherReason', e.target.value)}
                                    rows="3"
                                    required
                                    className="mt-4 w-full px-0 py-2 border-0 border-b-2 border-white/60 bg-transparent text-white text-lg placeholder:text-white/40 focus:border-white focus:ring-0 focus:outline-none rounded-none resize-none box-border transition-all"
                                />
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                disabled={loading}
                                className="px-6 py-2 border border-white text-white hover:bg-white/10 rounded-lg bg-transparent flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                            >
                                BACK
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="px-6 py-2 bg-white text-[#4E4DED] hover:bg-gray-100 rounded-lg border border-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                            >
                                {loading ? 'PROCESSING...' : 'CONFIRM'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageShell>
    );
};

export default Unsubscribe;
