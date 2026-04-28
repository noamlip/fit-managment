import React, { useMemo } from 'react';
import type { Trainee } from '../../types';
import { Camera, Calendar as CalendarIcon } from 'lucide-react';

interface IProgressPhotosTabProps {
    trainee: Trainee;
}

type PhotoRow = { url: string; date: string; label?: string };

export const ProgressPhotosTab: React.FC<IProgressPhotosTabProps> = ({ trainee }) => {
    const allPhotos = useMemo(() => {
        const rows: PhotoRow[] = [];
        for (const f of trainee.weeklyFeedback || []) {
            for (const url of f.photos || []) {
                rows.push({ url, date: f.date });
            }
            if (f.photoFrontUrl) rows.push({ url: f.photoFrontUrl, date: f.date, label: 'Front' });
            const backUrl = f.photoBackUrl || f.photoBarUrl;
            if (backUrl) {
                rows.push({ url: backUrl, date: f.date, label: 'Back' });
            }
            if (f.photoSideUrl) rows.push({ url: f.photoSideUrl, date: f.date, label: 'Side' });
        }
        return rows.sort((a, b) => b.date.localeCompare(a.date));
    }, [trainee.weeklyFeedback]);

    return (
        <div className="progress-view" style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="progress-photos-section" style={{ marginTop: '0.5rem' }}>
                <div
                    className="section-header"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        paddingBottom: '0.5rem',
                    }}
                >
                    <Camera size={20} color="#00f2ff" />
                    <h3
                        style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}
                    >
                        Progress Photos
                    </h3>
                </div>

                {allPhotos.length > 0 ? (
                    <div
                        className="photos-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '1rem',
                        }}
                    >
                        {allPhotos.map((photo, idx) => (
                            <div
                                key={`${photo.date}-${idx}`}
                                className="photo-card"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'transform 0.2s',
                                }}
                            >
                                <div style={{ height: '150px', width: '100%', position: 'relative' }}>
                                    <img
                                        src={photo.url}
                                        alt={`Progress ${photo.date}${photo.label ? ` ${photo.label}` : ''}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div
                                    style={{
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.8rem',
                                        color: '#a0a0a0',
                                    }}
                                >
                                    <CalendarIcon size={12} />
                                    <span>{photo.date}</span>
                                    {photo.label && (
                                        <span style={{ marginLeft: 'auto', color: '#00f2ff' }}>{photo.label}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="empty-photos"
                        style={{
                            padding: '3rem',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '12px',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            color: '#666',
                        }}
                    >
                        <Camera size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                        <p style={{ margin: 0 }}>No progress photos uploaded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
