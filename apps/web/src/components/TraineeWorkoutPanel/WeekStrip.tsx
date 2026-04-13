interface Day {
    date: Date;
    name: string;
    day: number;
    isToday: boolean;
    workout: string;
    type: string;
    isDone: boolean;
}

interface Props {
    days: Day[];
}

export const WeekStrip: React.FC<Props> = ({ days }) => {
    return (
        <div className="week-strip" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {days.map((d, i) => (
                <div
                    key={i}
                    style={{
                        padding: '0.75rem',
                        borderRadius: 10,
                        border: d.isToday ? '2px solid #00f2ff' : '1px solid rgba(255,255,255,0.1)',
                        background: d.isDone ? 'rgba(0,200,120,0.12)' : 'rgba(255,255,255,0.04)',
                        minWidth: 64,
                        textAlign: 'center',
                    }}
                >
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>{d.name}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{d.day}</div>
                    <div style={{ fontSize: '0.65rem', color: '#aaa' }}>{d.workout}</div>
                </div>
            ))}
        </div>
    );
};
