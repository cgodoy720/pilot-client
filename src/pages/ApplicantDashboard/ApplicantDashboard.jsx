import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import databaseService from '../../services/databaseService';
import './ApplicantDashboard.css';

const ApplicantDashboard = () => {
    const navigate = useNavigate();
    const [applicant, setApplicant] = useState(null);

    useEffect(() => {
        const currentApplicant = databaseService.getCurrentApplicant();
        if (currentApplicant) {
            setApplicant(currentApplicant);
        } else {
            navigate('/apply/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        databaseService.logout();
        navigate('/apply/login');
    };

    if (!applicant) {
        return <div>Loading...</div>;
    }

    return (
        <div className="applicant-dashboard">
            <header className="dashboard-header">
                <h1>Welcome, {applicant.first_name}!</h1>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </header>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h2>Your Pursuit Application Journey</h2>
                    <p>Complete these steps to submit your application:</p>
                </div>

                <div className="application-steps">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Complete Application Form</h3>
                            <p>Fill out your personal information and essay questions</p>
                            <button 
                                onClick={() => navigate('/application-form')}
                                className="step-button"
                            >
                                Start Application
                            </button>
                        </div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Attend Information Session</h3>
                            <p>Learn more about our program and ask questions</p>
                            <button 
                                onClick={() => navigate('/info-sessions')}
                                className="step-button"
                            >
                                View Sessions
                            </button>
                        </div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Join a Workshop</h3>
                            <p>Get hands-on experience with our teaching style</p>
                            <button 
                                onClick={() => navigate('/workshops')}
                                className="step-button"
                            >
                                View Workshops
                            </button>
                        </div>
                    </div>
                </div>

                <div className="applicant-info">
                    <h3>Your Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Name:</label>
                            <span>{applicant.first_name} {applicant.last_name}</span>
                        </div>
                        <div className="info-item">
                            <label>Email:</label>
                            <span>{applicant.email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantDashboard; 