import React, { useState } from 'react';
import './BulkActionsModal.css';

const BulkActionsModal = ({ selectedCount, onClose, onAction, isLoading }) => {
    const [selectedAction, setSelectedAction] = useState('');
    const [customSubject, setCustomSubject] = useState('');
    const [customBody, setCustomBody] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const actions = [
        { value: 'invite_to_workshop', label: 'Invite to workshop' },
        { value: 'remind_info_session', label: 'Remind to register for an info session' },
        { value: 'remind_workshop', label: 'Remind to register for a workshop' },
        { value: 'remind_application', label: 'Remind to submit application' },
        { value: 'admit_to_program', label: 'Admit to program' },
        { value: 'reject_from_program', label: 'Reject from program' },
        { value: 'send_custom_email', label: 'Send custom email' }
    ];

    const handleSubmit = () => {
        if (!selectedAction) return;

        if (selectedAction === 'send_custom_email' && (!customSubject.trim() || !customBody.trim())) {
            alert('Please provide both subject and body for custom email');
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirm = () => {
        onAction(selectedAction, customSubject, customBody);
        setShowConfirmation(false);
    };

    const getActionDescription = (action) => {
        switch (action) {
            case 'invite_to_workshop':
                return 'Update stage to "workshop_invited" and send workshop invitation email';
            case 'remind_info_session':
                return 'Send reminder email about registering for info sessions';
            case 'remind_workshop':
                return 'Send reminder email about registering for workshops';
            case 'remind_application':
                return 'Send reminder email to complete application';
            case 'admit_to_program':
                return 'Update stage to "decision_accepted" and send acceptance email';
            case 'reject_from_program':
                return 'Update stage to "decision_rejected" and send rejection email';
            case 'send_custom_email':
                return 'Send custom email with your provided subject and body';
            default:
                return '';
        }
    };

    if (showConfirmation) {
        return (
            <div className="bulk-actions-modal__overlay">
                <div className="bulk-actions-modal__container">
                    <div className="bulk-actions-modal__header">
                        <h2>Confirm Action</h2>
                    </div>
                    <div className="bulk-actions-modal__content">
                        <p>Are you sure you want to perform this action on <strong>{selectedCount}</strong> applicant{selectedCount !== 1 ? 's' : ''}?</p>
                        <div className="bulk-actions-modal__action-summary">
                            <strong>Action:</strong> {actions.find(a => a.value === selectedAction)?.label}
                        </div>
                        <div className="bulk-actions-modal__action-description">
                            {getActionDescription(selectedAction)}
                        </div>
                        {selectedAction === 'send_custom_email' && (
                            <div className="bulk-actions-modal__email-preview">
                                <div><strong>Subject:</strong> {customSubject}</div>
                                <div><strong>Body:</strong> {customBody.substring(0, 100)}{customBody.length > 100 ? '...' : ''}</div>
                            </div>
                        )}
                    </div>
                    <div className="bulk-actions-modal__footer">
                        <button 
                            className="bulk-actions-modal__btn bulk-actions-modal__btn--secondary"
                            onClick={() => setShowConfirmation(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            className="bulk-actions-modal__btn bulk-actions-modal__btn--primary"
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bulk-actions-modal__overlay">
            <div className="bulk-actions-modal__container">
                <div className="bulk-actions-modal__header">
                    <h2>Applicant(s) Selected</h2>
                    <button 
                        className="bulk-actions-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="bulk-actions-modal__content">
                    <p>{selectedCount} applicant{selectedCount !== 1 ? 's' : ''} selected</p>
                    
                    <div className="bulk-actions-modal__field">
                        <label htmlFor="action-select">Select Action:</label>
                        <select
                            id="action-select"
                            className="bulk-actions-modal__select"
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                        >
                            <option value="">Choose an action...</option>
                            {actions.map(action => (
                                <option key={action.value} value={action.value}>
                                    {action.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedAction === 'send_custom_email' && (
                        <>
                            <div className="bulk-actions-modal__field">
                                <label htmlFor="custom-subject">Email Subject:</label>
                                <input
                                    id="custom-subject"
                                    type="text"
                                    className="bulk-actions-modal__input"
                                    value={customSubject}
                                    onChange={(e) => setCustomSubject(e.target.value)}
                                    placeholder="Enter email subject..."
                                />
                            </div>
                            <div className="bulk-actions-modal__field">
                                <label htmlFor="custom-body">Email Body:</label>
                                <textarea
                                    id="custom-body"
                                    className="bulk-actions-modal__textarea"
                                    value={customBody}
                                    onChange={(e) => setCustomBody(e.target.value)}
                                    placeholder="Enter email body..."
                                    rows={6}
                                />
                            </div>
                        </>
                    )}

                    {selectedAction && selectedAction !== 'send_custom_email' && (
                        <div className="bulk-actions-modal__action-description">
                            {getActionDescription(selectedAction)}
                        </div>
                    )}
                </div>
                <div className="bulk-actions-modal__footer">
                    <button 
                        className="bulk-actions-modal__btn bulk-actions-modal__btn--secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        className="bulk-actions-modal__btn bulk-actions-modal__btn--primary"
                        onClick={handleSubmit}
                        disabled={!selectedAction}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionsModal;