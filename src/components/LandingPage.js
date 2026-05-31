
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
                        <span className="eyebrow">Barbershop management reinvented</span>
                        <h1>Run your shop with confidence, speed, and style.</h1>
                        <p>
                            LEVIS.BARBER brings appointment booking, financial tracking, and staff approvals into one premium dashboard.
                            Designed to help owners, employees, and customers move faster while keeping every detail polished.
                        </p>
                        <div className="landing-actions">
                            <button className="btn-orange" onClick={onStart}>Start Free</button>
                            <button className="btn-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Explore Features</button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-card">
                            <div className="hero-card-top">
                                <span>Owner dashboard</span>
                                <span className="chip">Live insights</span>
                            </div>
                            <h3>Clear revenue & expense control</h3>
                            <div className="hero-card-row">
                                <div>
                                    <strong>M 287,420</strong>
                                    <span>Total revenue</span>
                                </div>
                                <div>
                                    <strong>M 47,180</strong>
                                    <span>Expenses</span>
                                </div>
                            </div>
                            <div className="hero-card-footer">Quickly approve staff, add income, and review monthly charts—all in one place.</div>
                        </div>
                    </div>
                </section>

                <section className="landing-feature-grid" id="features">
                    <div className="feature-panel">
                        <h2>Everything you need, nothing you don’t</h2>
                        <p>Designed for salons and barbershops that want a premium, modern workflow without the complexity.</p>
                    </div>
                    <div className="feature-card-large">
                        <h3>Owner analytics</h3>
                        <p>Monitor revenue, expenses, profits, and customer growth from a clean central dashboard.</p>
                    </div>
                    <div className="feature-card-large">
                        <h3>Workflow for employees</h3>
                        <p>Employees can manage appointments, update status, and access salary records with ease.</p>
                    </div>
                    <div className="feature-card-large">
                        <h3>Customer convenience</h3>
                        <p>Customers book appointments, download receipts, and send feedback without friction.</p>
                    </div>
                </section>

                <section className="landing-stats">
                    <div>
                        <span>Proven performance</span>
                        <h2>Save time and keep your business moving.</h2>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-block">
                            <strong>24/7</strong>
                            <p>Access the dashboard anytime from any device.</p>
                        </div>
                        <div className="stat-block">
                            <strong>95%</strong>
                            <p>Approval confidence for employee onboarding and payroll.</p>
                        </div>
                        <div className="stat-block">
                            <strong>3x</strong>
                            <p>Faster bookkeeping and appointment management for teams.</p>
                        </div>
                    </div>
                </section>

                <section className="landing-focus">
                    <div className="focus-copy">
                        <h2>Professional tools for modern barbershops</h2>
                        <p>From staff approvals to financial summaries, LEVIS.BARBER gives your business the premium experience your customers expect.</p>
                    </div>
                    <div className="focus-list">
                        <div>
                            <h3>Smart approvals</h3>
                            <p>Approve or reject employee accounts quickly with built-in onboarding controls.</p>
                        </div>
                        <div>
                            <h3>Financial clarity</h3>
                            <p>Track revenue, income, and expenses with consistent reports and clean totals.</p>
                        </div>
                        <div>
                            <h3>Fast booking</h3>
                            <p>Customers can reserve services and download receipts from a modern interface.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <span>© 2026 LEVIS.BARBER</span>
                <div className="footer-links">
                    <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</button>
                    <button onClick={onStart}>Login</button>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
