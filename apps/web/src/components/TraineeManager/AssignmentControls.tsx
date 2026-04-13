import type { WorkoutType } from '../../types';

interface Props {
    selectedDate: string | null;
    onAssign: (type: WorkoutType) => void;
}

export const AssignmentControls: React.FC<Props> = ({ selectedDate, onAssign }) => {
    return (
        <div className="assignment-controls" style={{ marginBottom: '1rem' }}>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {selectedDate ? `Selected: ${selectedDate}` : 'Pick a day on the calendar'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(['push', 'pull', 'legs', 'rest'] as const).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => onAssign(t)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 8,
                            border: '1px solid rgba(0,242,255,0.3)',
                            background: 'rgba(0,242,255,0.08)',
                            color: '#00f2ff',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
    );
};
