import { useConfig } from '../../context/ConfigContext';
import './NutritionTable.scss';

export const NutritionTable: React.FC = () => {
    const { currentPlan } = useConfig();
    const rows = currentPlan?.dailyPlan ?? [];
    return (
        <div className="nutrition-table-wrap">
            <h3>Daily plan</h3>
            {rows.length === 0 ? (
                <p style={{ color: '#888' }}>No foods in plan yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>kcal</th>
                            <th>P</th>
                            <th>C</th>
                            <th>F</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((f) => (
                            <tr key={f.id}>
                                <td>{f.item}</td>
                                <td>{f.quantity}</td>
                                <td>{f.calories}</td>
                                <td>{f.protein}</td>
                                <td>{f.carbs}</td>
                                <td>{f.fat}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
