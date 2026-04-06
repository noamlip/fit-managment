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
            const points = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                points.push({
                    label: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
                    val: currentWeight || 0
                });
            }
            return points;
        }

        const points = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Find exact or nearest past record
            const validRecords = history.filter(h => h.date <= dateStr).sort((a,b) => b.date.localeCompare(a.date));
            const val = validRecords.length > 0 ? validRecords[0].weight : (currentWeight || 0);

            points.push({
                label: d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
                val: val
            });
        }
        return points;
    }, [history, currentWeight]);

    const maxVal = Math.max(...dataPoints.map(d => d.val));
    const minVal = Math.min(...dataPoints.map(d => d.val));
    
    // Keep bounds tight around actual weights (e.g. +/- 2kg) so even 0.1kg changes are highly visible.
    const padding = Math.max(2, (maxVal - minVal) * 0.2);
    const maxWeight = maxVal + padding;
    const minWeight = Math.max(0, minVal - padding);

    const height = 300;
    const width = 600;

    const getX = (index: number) => (index / (dataPoints.length - 1)) * width;
    const getY = (val: number) => height - ((val - minWeight) / (maxWeight - minWeight)) * height;

    const pointsList = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.val) }));
    
    let curvePath = '';
    if (pointsList.length > 0) {
        curvePath += `M ${pointsList[0].x},${pointsList[0].y} `;
        for (let i = 0; i < pointsList.length - 1; i++) {
            const current = pointsList[i];
            const next = pointsList[i + 1];
            const tension = (next.x - current.x) / 2;
            curvePath += `C ${current.x + tension},${current.y} ${next.x - tension},${next.y} ${next.x},${next.y} `;
        }
    }

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
                <path d={`${curvePath} L${width},${height} L0,${height} Z`} fill="url(#chartGradient)" />
                <path
                    d={curvePath}
                    fill="none"
                    stroke="#00f2ff"
                    strokeWidth="3"
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
