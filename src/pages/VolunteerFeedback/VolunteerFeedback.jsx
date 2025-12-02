import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import FeedbackModal from './FeedbackModal';
import FeedbackList from './FeedbackList';
import './VolunteerFeedback.css';

function VolunteerFeedback() {
    const { user, token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedback, setFeedback] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debug logging
    console.log('🔍 VolunteerFeedback rendering with:', { user, token, userRole: user?.role });

    useEffect(() => {
        console.log('🔍 useEffect running with:', { user, token, userRole: user?.role });
        if (user && token) {
            console.log('🔍 User and token exist, fetching data...');
            fetchFeedback();
        } else {
            console.log('🔍 User or token missing:', { hasUser: !!user, hasToken: !!token });
            setIsLoading(false);
        }
    }, [user, token]);

    const fetchFeedback = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/volunteer-feedback/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedback(data.feedback);
            } else {
                throw new Error('Failed to fetch feedback');
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
            setError('Failed to load feedback. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };



    const handleFeedbackSubmitted = (newFeedback) => {
        setFeedback(prev => [newFeedback, ...prev]);
        setIsModalOpen(false);
    };

    const handleFeedbackDeleted = (feedbackId) => {
        setFeedback(prev => prev.filter(f => f.feedback_id !== feedbackId));
    };

    const handleFeedbackUpdated = (updatedFeedback) => {
        setFeedback(prev => prev.map(f => 
            f.feedback_id === updatedFeedback.feedback_id ? updatedFeedback : f
        ));
    };

    console.log('🔍 Role check:', { userRole: user?.role, isVolunteer: user?.role === 'volunteer' });
    
    if (user?.role !== 'volunteer') {
        console.log('🔍 Access denied - user is not a volunteer');
        return (
            <div className="volunteer-feedback-page">
                <div className="volunteer-feedback">
                    <div className="volunteer-feedback__error">
                        <h2>Access Denied</h2>
                        <p>This page is only available to volunteers.</p>
                    </div>
                </div>
            </div>
        );
    }
    
    console.log('🔍 User is a volunteer, rendering feedback form');

    console.log('🔍 Rendering main feedback form content');
    
    return (
        <div className="volunteer-feedback-page">
            <div className="volunteer-feedback">
                <div className="volunteer-feedback__header">
                    <h1>Volunteer Feedback</h1>
                    <p>Share your insights and experiences to help improve our programs.</p>
                </div>

                {/* Action Section */}
                <div className="volunteer-feedback__actions">
                    <button 
                        className="group relative overflow-hidden inline-flex justify-center items-center px-8 py-3 bg-[#4242EA] border border-[#4242EA] rounded-full font-normal text-base text-white cursor-pointer transition-colors duration-300"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-[#4242EA]">📝 Record Feedback</span>
                        <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </button>
                </div>

                {/* Feedback List */}
                <div className="volunteer-feedback__content">
                    <h2>Your Feedback History</h2>
                    {isLoading ? (
                        <div className="volunteer-feedback__loading">Loading your feedback...</div>
                    ) : error ? (
                        <div className="volunteer-feedback__error">{error}</div>
                    ) : feedback.length === 0 ? (
                        <div className="volunteer-feedback__empty">
                            <p>You haven't submitted any feedback yet.</p>
                            <p>Click "Record Feedback" to get started!</p>
                        </div>
                    ) : (
                        <FeedbackList 
                            feedback={feedback}
                            onDelete={handleFeedbackDeleted}
                            onUpdate={handleFeedbackUpdated}
                            token={token}
                        />
                    )}
                </div>

                {/* Feedback Modal */}
                <FeedbackModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFeedbackSubmitted}
                    token={token}
                />
            </div>
        </div>
    );
}

export default VolunteerFeedback;
