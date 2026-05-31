
import React from 'react';
import logoImage from '../assets/levis-logo.svg';

function LandingPage({ onStart }) {
    return (
        <div className="landing-page">
            <div className="landing-content">
                <div className="landing-copy">
                    <div className="landing-logo"><img src={logoImage} alt="Levis Barber Logo" /></div>
                    <p className="eyebrow">LEVIS.BARBER</p>
                    <h1>Modern barbershop management built for speed and clarity.</h1>
                    <p className="landing-text">
                        Streamline customer bookings, track income and expenses, and manage staff approvals from one clean, responsive dashboard.
                        Designed for owners, employees, and customers who want a sharp digital experience without the clutter.
                    </p>
                    <div className="landing-actions">
                        <button className="btn-orange" onClick={onStart}>Get Started</button>
                    </div>
                </div>
                <div className="landing-features">
                    <div className="feature-card">
                        <h3>Owner insights</h3>
                        <p>Track revenue, expenses, approvals, and performance data in one place.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Employee workflow</h3>
                        <p>Manage appointments, salary records, and support tickets with no extra hassle.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Customer bookings</h3>
                        <p>Book appointments, download receipts, and submit feedback quickly.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;