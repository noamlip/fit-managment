import { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import type { UserRole } from '../../types';
import './TrainerSelection.scss';

export const TrainerSelection: React.FC = () => {
    const { login, knownTrainers } = useConfig();
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('trainer');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const n = name.trim();
        if (!n) return;
        login(n, role);
    };

    return (
        <div className="trainer-selection">
            <h2>Sign in</h2>
            <form className="login-card" onSubmit={handleSubmit}>
                <input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />
                <div className="role-row">
                    <button type="button" className={role === 'trainer' ? 'active' : ''} onClick={() => setRole('trainer')}>
                        Trainee
                    </button>
                    <button type="button" className={role === 'coach' ? 'active' : ''} onClick={() => setRole('coach')}>
                        Coach
                    </button>
                </div>
                <button type="submit" className="submit-login">
                    Continue
                </button>
                {knownTrainers.length > 0 && role === 'trainer' && (
                    <div className="recent-trainers">
                        <h3>Recent</h3>
                        <div className="trainer-list">
                            {knownTrainers.map((t) => (
                                <button key={t} type="button" className="trainer-chip" onClick={() => login(t, 'trainer')}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};
