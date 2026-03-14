import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTrainee } from '../../context/TraineeContext';
import { User, Shield } from 'lucide-react';
import './TrainerSelection.scss';

export const TrainerSelection: React.FC = () => {
    const { login } = useConfig();
    const { trainees } = useTrainee();
    const [name, setName] = useState('');
    const [role, setRole] = useState<'trainer' | 'coach'>('trainer');

    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (role === 'coach') {
            login('Coach', 'coach');
        } else if (name.trim()) {
            login(name.trim(), 'trainer');
        }
    };

    return (
        <div className='trainer-selection'>
            <h2>{role === 'coach' ? 'Coach Access' : 'Identify Yourself'}</h2>

            <div className="role-switcher" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                <button
                    type="button"
                    onClick={() => setRole('trainer')}
                    style={{
                        opacity: role === 'trainer' ? 1 : 0.5,
                        background: role === 'trainer' ? 'var(--primary-color, #00C49F)' : 'transparent',
                        border: '1px solid var(--primary-color, #00C49F)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <User size={18} /> Trainer
                </button>
                <button
                    type="button"
                    onClick={() => setRole('coach')}
                    style={{
                        opacity: role === 'coach' ? 1 : 0.5,
                        background: role === 'coach' ? 'var(--primary-color, #00C49F)' : 'transparent',
                        border: '1px solid var(--primary-color, #00C49F)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Shield size={18} /> Coach
                </button>
            </div>

            <form className='login-card' onSubmit={handleLogin}>
                {role === 'trainer' ? (
                    <>
                        <input
                            type='text'
                            placeholder='Enter Trainer Name (or select below)'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <button type='submit' disabled={!name.trim()}>
                            Access Portal
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <p style={{ marginBottom: '1.5rem', color: '#ccc' }}>Access the management dashboard to oversee all trainers.</p>
                        <button type='submit' style={{ width: '100%', padding: '1rem', background: 'var(--primary-color, #00C49F)', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                            Enter as Coach
                        </button>
                    </div>
                )}

                {role === 'trainer' && trainees.length > 0 && (
                    <div className="recent-trainers">
                        <h3>Select Trainee Account</h3>
                        <div className="trainer-list">
                            {trainees.map(trainee => (
                                <div
                                    key={trainee.id}
                                    className="trainer-chip"
                                    onClick={() => login(trainee.name, 'trainer')}
                                    title={trainee.email}
                                >
                                    <div className="chip-avatar" style={{
                                        width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', marginRight: '0.5rem'
                                    }}>
                                        {trainee.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{trainee.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};
