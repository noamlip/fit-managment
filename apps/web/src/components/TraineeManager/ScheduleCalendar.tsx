export interface IDayInfo {
    date: Date;
    dateStr: string;
    name: string;
    day: number;
    workout: string;
    status: string;
    isSelected: boolean;
}

interface Props {
    weekDays: IDayInfo[];
    onDayClick: (date: string | null) => void;
}

export const ScheduleCalendar: React.FC<Props> = ({ weekDays, onDayClick }) => {
    return (
        <div className="schedule-calendar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {weekDays.map((d) => (
                <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => onDayClick(d.dateStr)}
                    style={{
                        minWidth: 72,
                        padding: '0.75rem',
                        borderRadius: 10,
                        border: d.isSelected ? '2px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)',
                        background: d.isSelected ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.04)',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>{d.name}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{d.day}</div>
                    <div style={{ fontSize: '0.65rem', color: '#aaa', marginTop: 4 }}>{d.workout}</div>
                    <div style={{ fontSize: '0.6rem', marginTop: 2 }}>{d.status}</div>
                </button>
            ))}
        </div>
    );
};
