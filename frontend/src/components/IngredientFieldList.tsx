import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import type { IngredientInput } from '../types';

interface IngredientFieldListProps {
  ingredients: IngredientInput[];
  onChange: (ingredients: IngredientInput[]) => void;
  errors?: {
    ingredients?: string;
    ingredientItems?: Record<number, { nameIngredient?: string; quantityIngredient?: string }>;
  };
}

export const IngredientFieldList: React.FC<IngredientFieldListProps> = ({
  ingredients,
  onChange,
  errors = {},
}) => {
  const handleAddIngredient = () => {
    onChange([
      ...ingredients,
      { nameIngredient: '', quantityIngredient: '', orderIngredient: ingredients.length + 1 },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length <= 1) {
      // Dejar al menos uno vacío si se borra el único elemento
      onChange([{ nameIngredient: '', quantityIngredient: '', orderIngredient: 1 }]);
      return;
    }
    const updated = ingredients.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      orderIngredient: idx + 1,
    }));
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof IngredientInput, value: string) => {
    const updated = [...ingredients];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  // Chequeo en vivo de nombres duplicados
  const namesCount = ingredients.reduce((acc, curr) => {
    const name = curr.nameIngredient.trim().toLowerCase();
    if (name) {
      acc[name] = (acc[name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>
          Ingredientes de la receta <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <button
          type="button"
          onClick={handleAddIngredient}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
        >
          <Plus size={15} />
          <span>Agregar Ingrediente</span>
        </button>
      </div>

      <div className="form-hint" style={{ marginBottom: '0.75rem' }}>
        Especifica el nombre y la cantidad de cada ingrediente (por ejemplo: "Harina de trigo" - "250 gr").
      </div>

      {errors.ingredients && (
        <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <AlertCircle size={15} />
          <span>{errors.ingredients}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {ingredients.map((ing, idx) => {
          const itemError = errors.ingredientItems?.[idx];
          const isDuplicate = ing.nameIngredient.trim() && (namesCount[ing.nameIngredient.trim().toLowerCase()] || 0) > 1;

          return (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 42px',
                gap: '0.6rem',
                alignItems: 'flex-start',
                backgroundColor: '#ffffff',
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div>
                <input
                  type="text"
                  placeholder="Nombre (ej. Huevos)"
                  value={ing.nameIngredient}
                  maxLength={255}
                  onChange={(e) => handleChange(idx, 'nameIngredient', e.target.value)}
                  className={`form-control ${itemError?.nameIngredient || isDuplicate ? 'is-invalid' : ''}`}
                  style={{ padding: '0.55rem 0.8rem', fontSize: '0.9rem' }}
                />
                {itemError?.nameIngredient && (
                  <span className="form-error">{itemError.nameIngredient}</span>
                )}
                {isDuplicate && !itemError?.nameIngredient && (
                  <span className="form-error">Ingrediente duplicado</span>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Cantidad (ej. 2 pzas)"
                  value={ing.quantityIngredient}
                  maxLength={100}
                  onChange={(e) => handleChange(idx, 'quantityIngredient', e.target.value)}
                  className={`form-control ${itemError?.quantityIngredient ? 'is-invalid' : ''}`}
                  style={{ padding: '0.55rem 0.8rem', fontSize: '0.9rem' }}
                />
                {itemError?.quantityIngredient && (
                  <span className="form-error">{itemError.quantityIngredient}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveIngredient(idx)}
                className="btn btn-secondary"
                style={{
                  height: '38px',
                  padding: 0,
                  width: '38px',
                  color: '#94a3b8',
                  borderColor: '#e2e8f0',
                }}
                title="Eliminar ingrediente"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
