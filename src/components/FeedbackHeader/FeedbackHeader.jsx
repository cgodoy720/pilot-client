import React from 'react';
import { Link } from 'react-router-dom';
import './FeedbackHeader.css';
import logoFull from '../../assets/logo-full.png';

const FeedbackHeader = () => {
    return (
        <header className="feedback-header">
            <div className="feedback-header__container">
                <div className="feedback-header__logo">
                    <img src={logoFull} alt="Pursuit" className="feedback-header__logo-img" />
                </div>
                <div className="feedback-header__nav">
                    <Link to="/dashboard" className="feedback-header__nav-link">
                        ← Back to Main App
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default FeedbackHeader;
