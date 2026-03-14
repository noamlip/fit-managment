import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import { User, Database, AlertTriangle } from 'lucide-react';
import './Settings.scss';

export const Settings: React.FC = () => {
    const { trainerName, login, userRole } = useConfig();
    const { addToast } = useToast();
    const [name, setName] = useState(trainerName || '');

    const handleSaveName = () => {
        if (name.trim()) {
            login(name.trim(), userRole || 'trainer');
            addToast('Trainer profile updated!', 'success');
        }
    };

    const handleClearData = () => {
        if (confirm('ARE YOU SURE? This will delete all local data for this browser including trainees, workouts, and plans.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="settings-page">
            <h2>Settings</h2>

            <div className="settings-section">
                <h3><User size={20} /> Trainer Profile</h3>
                <div className="setting-item">
                    <label>Trainer Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />
                    <button className="primary" onClick={handleSaveName}>
                        Update Profile
                    </button>
                    <p className="info-text">This name is used to identify your session and stored data.</p>
                </div>
            </div>

            <div className="settings-section">
                <h3><Database size={20} /> Data Management</h3>
                <div className="setting-item">
                    <label>Reset Application</label>
                    <p className="info-text" style={{ marginBottom: '1rem' }}>
                        Clear all stored data on this device. This cannot be undone.
                    </p>
                    <button className="danger" onClick={handleClearData}>
                        <AlertTriangle size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};
