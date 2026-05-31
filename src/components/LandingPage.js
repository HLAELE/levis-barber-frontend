
import React from 'react';

function LandingPage({ onStart }) {
    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="brand">
                    <span className="brand-text">LEVIS.BARBER</span>
                </div>
                <button className="btn-secondary" onClick={onStart}>Login</button>
            </header>

            <main className="landing-main">
                <section className="hero">
                    <div className="hero-copy">
                        <span className="eyebrow">Barbershop experience</span>
                        <h1>Sharp style, easy bookings, happy customers.</h1>
                        <p>
                            Book appointments quickly, get timely reminders, and enjoy a professional service every visit. LEVIS.BARBER focuses on what matters to your customers — speed, clarity, and convenience.
                        </p>
                        <div className="landing-actions">
                            <button className="btn-orange" onClick={onStart}>Book Now</button>
                            <button className="btn-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>See Services</button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="contact-card">
                            <h3>Get in touch</h3>
                            <p className="contact-line">Call: <a href="tel:+63405086">+63405086</a></p>
                            <p className="contact-line">WhatsApp: <a href="https://wa.me/63405086" target="_blank" rel="noreferrer">+63405086</a> / <a href="https://wa.me/59921347" target="_blank" rel="noreferrer">+59921347</a></p>
                            <p className="contact-line">Facebook: <a href="https://www.facebook.com/LEVIS.BARBER" target="_blank" rel="noreferrer">LEVIS.BARBER</a></p>
                            <p className="contact-line">Address: 123 Main Street, City — Open daily 8am–6pm</p>
                            <div className="contact-cta">
                                <button className="btn-orange" onClick={() => window.location = 'tel:+63405086'}>Call Now</button>
                                <button className="btn-link" onClick={() => window.open('https://wa.me/63405086', '_blank')}>Open WhatsApp</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-feature-grid" id="features">
                    <div className="feature-panel">
                        <h2>What customers love</h2>
                        <p>Fast bookings, clear receipts, and friendly staff—experience a premium visit every time.</p>
                    </div>
                    <div className="feature-card-large">
                        <h3>Quick bookings</h3>
                        <p>Reserve a slot in seconds and get confirmation right away.</p>
                    </div>
                    <div className="feature-card-large">
                        <h3>Reliable service</h3>
                        <p>Appointments honored, professionals ready — enjoy consistent quality.</p>
                    </div>
                    <div className="feature-card-large">
                        <h3>Easy receipts</h3>
                        <p>Download receipts and records immediately after payment.</p>
                    </div>
                </section>

                <section className="landing-stats">
                    <div>
                        <span>Why choose us</span>
                        <h2>Comfort, speed, and style in every visit.</h2>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-block">
                            <strong>Fast</strong>
                            <p>Short wait times and efficient service.</p>
                        </div>
                        <div className="stat-block">
                            <strong>Friendly</strong>
                            <p>Experienced barbers who listen and deliver.</p>
                        </div>
                        <div className="stat-block">
                            <strong>Trusted</strong>
                            <p>Clear receipts and reliable booking confirmation.</p>
                        </div>
                    </div>
                </section>

                <section className="landing-focus">
                    <div className="focus-copy">
                        <h2>Visit or contact us</h2>
                        <p>Walk in or book ahead — we’re ready to give you a standout experience.</p>
                    </div>
                    <div className="focus-list">
                        <div>
                            <h3>Call or WhatsApp</h3>
                            <p>Phone: +63405086 | +59921347 — available for bookings and enquiries.</p>
                        </div>
                        <div>
                            <h3>Follow us</h3>
                            <p>Facebook: LEVIS.BARBER — updates, offers and community posts.</p>
                        </div>
                        <div>
                            <h3>Our location</h3>
                            <p>123 Main Street, City — Open daily 8am–6pm.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div>© 2026 LEVIS.BARBER</div>
                <div className="footer-contacts">
                    <div>Call: <a href="tel:+63405086">+63405086</a></div>
                    <div>WhatsApp: <a href="https://wa.me/63405086" target="_blank" rel="noreferrer">+63405086</a></div>
                    <div>Facebook: LEVIS.BARBER</div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
