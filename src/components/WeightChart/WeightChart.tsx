import React, { useMemo } from 'react';
import type { WeightRecord } from '../../types';
import './WeightChart.scss';

interface WeightChartProps {
    history: WeightRecord[];
    currentWeight: number;
}

export const WeightChart: React.FC<WeightChartProps> = ({ history, currentWeight }) => {
    // Determine data points to show (last 7 days or custom range)
    const dataPoints = useMemo(() => {
        if (!history || history.length === 0) {
            // Fallback: 7 days of 0s if no history exists (User request: "no chance to be true because sadrah have no history")
            const points = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                points.push({
                    label: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
                    val: 0 // Explicit request: 0 if no history
                });
            }
            return points;
        }

        // Fill gaps logic for last 7 days from today?
        // OR just show the actual history points if we want "per day" accuracy?
        // The user request "represented per day" likely implies "daily tracking".
        // Let's stick to the "last 7 days" view as it's standard for dashboards,
        // but ensuring we have a point for EVERY day.

        const points = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // User request: EXACT MATCH only, otherwise 0
            const record = history.find(r => r.date === dateStr);

            points.push({
                label: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
                val: record ? record.weight : 0
            });
        }
        return points;
    }, [history, currentWeight]);

    const maxWeight = Math.max(...dataPoints.map(d => d.val)) + 1;
    const minWeight = Math.min(...dataPoints.map(d => d.val)) - 1;
    const height = 150;
    const width = 600;

    const getX = (index: number) => (index / (dataPoints.length - 1)) * width;
    const getY = (val: number) => height - ((val - minWeight) / (maxWeight - minWeight)) * height;

    const points = dataPoints.map((d, i) => `${getX(i)},${getY(d.val)}`).join(' ');
    const areaPath = `${points} ${width},${height} 0,${height}`;

    const [hoveredPoint, setHoveredPoint] = React.useState<{ x: number, y: number, val: number } | null>(null);

    return (
        <div className="weight-chart-container">
            <div className="current-stat">
                <span className="val">{dataPoints[dataPoints.length - 1].val}</span>
                <span className="unit">kg</span>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="weight-svg">
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,${height} ${areaPath} Z`} fill="url(#chartGradient)" />
                <polyline
                    fill="none"
                    stroke="#00f2ff"
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {dataPoints.map((d, i) => {
                    const cx = getX(i);
                    const cy = getY(d.val);
                    return (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={hoveredPoint?.x === cx ? 6 : 4}
                            fill="#fff"
                            stroke="#00f2ff"
                            strokeWidth="2"
                            className="chart-point"
                            onMouseEnter={() => setHoveredPoint({ x: cx, y: cy, val: d.val })}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    );
                })}

                {hoveredPoint && (
                    <g className="chart-tooltip">
                        <rect
                            x={hoveredPoint.x - 25}
                            y={hoveredPoint.y - 35}
                            width="50"
                            height="24"
                            rx="4"
                            fill="rgba(0,0,0,0.8)"
                        />
                        <text
                            x={hoveredPoint.x}
                            y={hoveredPoint.y - 19}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize="12"
                            fontWeight="bold"
                        >
                            {hoveredPoint.val}
                        </text>
                    </g>
                )}
            </svg>
            <div className="chart-labels">
                {dataPoints.map((d, i) => (
                    <span key={i} style={{ left: `${(i / 6) * 100}%` }}>{d.label}</span>
                ))}
            </div>
        </div>
    );
};
