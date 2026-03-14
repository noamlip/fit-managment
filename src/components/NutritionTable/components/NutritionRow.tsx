import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { FoodItem } from '../../../types';

interface NutritionRowProps {
    item: FoodItem;
    index: number;
    macroColumns: string[];
    trainerName: string | null;
    isEditing: boolean;
    editValues: Partial<FoodItem>;
    onEdit: (item: FoodItem) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete: (id: string) => void;
    onChange: (field: string, value: string | number) => void;
}

export const NutritionRow: React.FC<NutritionRowProps> = ({
    item, index, macroColumns, trainerName,
    isEditing, editValues, onEdit, onSave, onCancel, onDelete, onChange
}) => {
    return (
        <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!trainerName}>
            {(provided) => (
                <tr
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                >
                    {trainerName && (
                        <td className="drag-handle" title="Drag to reorder">
                            ⋮⋮
                        </td>
                    )}
                    <td>{item.item}</td>

                    {isEditing ? (
                        <>
                            <td>
                                <input
                                    type="text"
                                    value={editValues.quantity || ''}
                                    onChange={(e) => onChange('quantity', e.target.value)}
                                />
                            </td>
                            {macroColumns.map(col => (
                                <td key={col}>
                                    <input
                                        type="number"
                                        // @ts-ignore
                                        value={editValues[col]}
                                        onChange={(e) => onChange(col, e.target.value)}
                                    />
                                </td>
                            ))}
                        </>
                    ) : (
                        <>
                            <td>{item.quantity}</td>
                            {macroColumns.map(col => (
                                <td key={col}>{item[col]}</td>
                            ))}
                        </>
                    )}

                    {trainerName && (
                        <td>
                            {isEditing ? (
                                <>
                                    <button onClick={onSave} className="action-btn save">✓</button>
                                    <button onClick={onCancel} className="action-btn cancel">✕</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => onEdit(item)} className="action-btn edit">✎</button>
                                    <button onClick={() => onDelete(item.id)} className="action-btn delete">✕</button>
                                </>
                            )}
                        </td>
                    )}
                </tr>
            )}
        </Draggable>
    );
};
