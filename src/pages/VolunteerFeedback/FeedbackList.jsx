import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import './FeedbackList.css';

function FeedbackList({ feedback, onDelete, onUpdate, token }) {
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEdit = (feedbackItem) => {
        setEditingFeedback(feedbackItem);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (feedbackId) => {
        if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/volunteer-feedback/${feedbackId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    onDelete(feedbackId);
                } else {
                    alert('Failed to delete feedback. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting feedback:', error);
                alert('An error occurred while deleting feedback.');
            }
        }
    };

    const handleEditSubmit = async (updatedFeedback) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/volunteer-feedback/${updatedFeedback.feedback_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    feedbackDate: updatedFeedback.feedback_date,
                    feedbackType: updatedFeedback.feedback_type,
                    feedbackText: updatedFeedback.feedback_text,
                    audioRecordingUrl: updatedFeedback.audio_recording_url
                })
            });

            if (response.ok) {
                const data = await response.json();
                onUpdate(data.feedback);
                setIsEditModalOpen(false);
                setEditingFeedback(null);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to update feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error updating feedback:', error);
            alert('An error occurred while updating feedback.');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFeedbackTypeIcon = (type) => {
        const icons = {
            'AI Native Class': '🤖',
            'Demo Day': '🎯',
            'Networking Event': '🤝',
            'Panel': '👥',
            'Mock Interview': '💼'
        };
        return icons[type] || '📝';
    };

    const getFeedbackTypeColor = (type) => {
        const colors = {
            'AI Native Class': '#4CAF50',
            'Demo Day': '#2196F3',
            'Networking Event': '#FF9800',
            'Panel': '#9C27B0',
            'Mock Interview': '#F44336'
        };
        return colors[type] || '#666';
    };

    return (
        <div className="feedback-list">
            {feedback.map((feedbackItem) => (
                <div key={feedbackItem.feedback_id} className="feedback-item">
                    <div className="feedback-item__header">
                        <div className="feedback-item__type">
                            <span 
                                className="feedback-item__type-icon"
                                style={{ backgroundColor: getFeedbackTypeColor(feedbackItem.feedback_type) }}
                            >
                                {getFeedbackTypeIcon(feedbackItem.feedback_type)}
                            </span>
                            <span className="feedback-item__type-text">
                                {feedbackItem.feedback_type}
                            </span>
                        </div>
                        <div className="feedback-item__date">
                            {formatDate(feedbackItem.feedback_date)}
                        </div>
                    </div>

                    <div className="feedback-item__content">
                        {feedbackItem.feedback_text ? (
                            <div className="feedback-item__text">
                                {feedbackItem.feedback_text}
                            </div>
                        ) : feedbackItem.audio_recording_url ? (
                            <div className="feedback-item__audio">
                                🎤 Audio feedback recorded
                                {feedbackItem.audio_recording_url !== 'placeholder-audio-url' && (
                                    <a 
                                        href={feedbackItem.audio_recording_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="feedback-item__audio-link"
                                    >
                                        Listen to recording
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="feedback-item__empty">
                                No feedback content available
                            </div>
                        )}
                    </div>

                    <div className="feedback-item__actions">
                        <button
                            className="feedback-item__edit-btn"
                            onClick={() => handleEdit(feedbackItem)}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            className="feedback-item__delete-btn"
                            onClick={() => handleDelete(feedbackItem.feedback_id)}
                        >
                            🗑️ Delete
                        </button>
                    </div>

                    <div className="feedback-item__meta">
                        <small>
                            Submitted on {formatDate(feedbackItem.created_at)}
                            {feedbackItem.updated_at !== feedbackItem.created_at && (
                                <span> • Updated on {formatDate(feedbackItem.updated_at)}</span>
                            )}
                        </small>
                    </div>
                </div>
            ))}

            {/* Edit Modal */}
            {editingFeedback && (
                <FeedbackModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingFeedback(null);
                    }}
                    onSubmit={handleEditSubmit}
                    token={token}
                    isEditing={true}
                    initialData={{
                        feedbackDate: editingFeedback.feedback_date,
                        feedbackType: editingFeedback.feedback_type,
                        feedbackText: editingFeedback.feedback_text || '',
                        audioRecordingUrl: editingFeedback.audio_recording_url || ''
                    }}
                />
            )}
        </div>
    );
}

export default FeedbackList;
