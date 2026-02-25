import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import './PaymentTerms.css';

function PaymentTerms() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    } else {
      // Redirect to login if no user data
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  if (!user) {
    return <div className="admissions-dashboard__loading">Loading...</div>;
  }

  return (
    <div className="admissions-dashboard">
      {/* Top Bar */}
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <Link to="/apply">
              <img src={pursuitLogoFull} alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
            </Link>
          </div>
          <div className="admissions-dashboard__welcome-text">
            Welcome, {user.firstName || user.first_name}!
          </div>
        </div>
        <div className="admissions-dashboard__topbar-right">
          <Link to="/apply" className="nav-link">Apply</Link>
          <Link to="/program-details" className="nav-link">Details</Link>
          <button 
            onClick={handleLogout}
            className="admissions-dashboard__button--primary"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Payment Terms Content */}
      <div className="payment-terms">
        <div className="payment-terms__header">
          <h1 className="payment-terms__title">Payment Structure Terms</h1>
          <p className="payment-terms__subtitle">Understand how your payments are structured and what to expect.</p>
        </div>

      <section className="payment-terms__section payment-terms__section--overview">
        <h2 className="payment-terms__section-title">Overview</h2>
        <p className="payment-terms__text">
          This page explains your payment obligations, timelines, and key terms in clear language. We’ll add your official terms here once provided.
        </p>
      </section>

      <section className="payment-terms__section payment-terms__section--definitions">
        <h2 className="payment-terms__section-title">Key Definitions</h2>
        <ul className="payment-terms__list">
          <li className="payment-terms__list-item"><strong>Tuition</strong>: The total cost of the program or services.</li>
          <li className="payment-terms__list-item"><strong>Deposit</strong>: An upfront amount that secures your spot.</li>
          <li className="payment-terms__list-item"><strong>Installment</strong>: A portion of tuition paid on a schedule.</li>
          <li className="payment-terms__list-item"><strong>Due Date</strong>: The date by which a payment must be received.</li>
        </ul>
      </section>

      <section className="payment-terms__section payment-terms__section--examples">
        <h2 className="payment-terms__section-title">Examples</h2>
        <div className="payment-terms__example">
          <h3 className="payment-terms__example-title">Scenario A: Deposit + Monthly Plan</h3>
          <p className="payment-terms__text">
            Pay a deposit at enrollment, then equal monthly installments over the program duration.
          </p>
        </div>
        <div className="payment-terms__example">
          <h3 className="payment-terms__example-title">Scenario B: Full Upfront</h3>
          <p className="payment-terms__text">
            Receive a discount for paying the full amount before the program start date.
          </p>
        </div>
      </section>

      <section className="payment-terms__section payment-terms__section--faqs">
        <h2 className="payment-terms__section-title">FAQs</h2>
        <details className="payment-terms__faq">
          <summary className="payment-terms__faq-question">What happens if I miss a payment?</summary>
          <div className="payment-terms__faq-answer">
            We’ll outline grace periods, late fees, and steps to get back on track.
          </div>
        </details>
        <details className="payment-terms__faq">
          <summary className="payment-terms__faq-question">Can I change my payment plan later?</summary>
          <div className="payment-terms__faq-answer">
            We’ll describe eligibility, timelines, and any applicable fees or approvals.
          </div>
        </details>
      </section>

        <div className="payment-terms__cta">
          <p className="payment-terms__text">Have questions about your terms?</p>
          <Link className="payment-terms__link" to="/program-details">View Program Details</Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentTerms;



