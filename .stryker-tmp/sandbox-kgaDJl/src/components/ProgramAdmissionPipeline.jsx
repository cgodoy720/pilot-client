// @ts-nocheck
import React from 'react';

const ProgramAdmissionPipeline = ({ programAdmissions = [] }) => {
    // Calculate totals and percentages
    const totalApplicants = programAdmissions.reduce((sum, item) => sum + item.count, 0);
    
    const getPercentage = (count) => {
        return totalApplicants > 0 ? Math.round((count / totalApplicants) * 100) : 0;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#9ca3af'; // Gray
            case 'accepted':
                return '#22c55e'; // Green
            case 'rejected':
                return '#ef4444'; // Red
            case 'waitlisted':
                return '#fbbf24'; // Yellow
            case 'deferred':
                return '#a855f7'; // Purple
            default:
                return '#9ca3af';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending Review';
            case 'accepted':
                return 'Accepted';
            case 'rejected':
                return 'Rejected';
            case 'waitlisted':
                return 'Waitlisted';
            case 'deferred':
                return 'Deferred';
            default:
                return status;
        }
    };

    // Sort by status priority
    const sortedAdmissions = [...programAdmissions].sort((a, b) => {
        const order = ['pending', 'accepted', 'waitlisted', 'deferred', 'rejected'];
        return order.indexOf(a.status) - order.indexOf(b.status);
    });

    return (
        <div className="program-admission-pipeline">
            <div className="program-admission-pipeline__header">
                <h4>Program Admission Pipeline</h4>
                <span className="program-admission-pipeline__total">
                    {totalApplicants} total applicants
                </span>
            </div>
            
            <div className="program-admission-pipeline__items">
                {sortedAdmissions.map((item) => (
                    <div key={item.status} className="program-admission-pipeline__item">
                        <div 
                            className="program-admission-pipeline__indicator"
                            style={{ backgroundColor: getStatusColor(item.status) }}
                        />
                        <div className="program-admission-pipeline__label">
                            {getStatusLabel(item.status)}
                        </div>
                        <div className="program-admission-pipeline__count">
                            {item.count}
                        </div>
                        <div className="program-admission-pipeline__percentage">
                            ({getPercentage(item.count)}%)
                        </div>
                    </div>
                ))}
            </div>

            {/* Acceptance Rate Summary */}
            {totalApplicants > 0 && (
                <div className="program-admission-pipeline__summary">
                    <div className="admission-rate">
                        <span className="admission-rate__label">Acceptance Rate:</span>
                        <span className="admission-rate__value">
                            {(() => {
                                const accepted = programAdmissions.find(item => item.status === 'accepted')?.count || 0;
                                const reviewed = totalApplicants - (programAdmissions.find(item => item.status === 'pending')?.count || 0);
                                return reviewed > 0 ? Math.round((accepted / reviewed) * 100) : 0;
                            })()}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramAdmissionPipeline;