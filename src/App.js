import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import OwnerDashboard from './components/owner/OwnerDashboard';
import './App.css';

function App() {
    const [showDashboard, setShowDashboard] = useState(false);
    
    // Default owner user - no login needed
    const ownerUser = {
        userId: 1,
        username: 'owner',
        role: 'OWNER',
        full_name: 'System Owner'
    };

    const handleGoToDashboard = () => {
        console.log('Going to dashboard...');
        setShowDashboard(true);
    };

    const handleLogout = () => {
        setShowDashboard(false);
    };

    // If showing dashboard, render OwnerDashboard
    if (showDashboard) {
        return <OwnerDashboard user={ownerUser} onLogout={handleLogout} />;
    }

    // Otherwise show landing page
    return <LandingPage onGoToDashboard={handleGoToDashboard} />;
}

export default App;