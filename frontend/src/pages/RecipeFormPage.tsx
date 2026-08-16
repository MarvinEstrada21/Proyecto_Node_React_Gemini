import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { recipeApi } from '../api/recipeApi';
import { useAuth } from '../context/AuthContext';
import { ImageUpload } from '../components/ImageUpload';
import { IngredientFieldList } from '../components/IngredientFieldList';
import type { IngredientInput } from '../types';

export const RecipeFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  // Estados del formulario
  const [nameRecipe, setNameRecipe] = useState('');
  const [categoryRecipe, setCategoryRecipe] = useState('Platos fuertes');
  const [customCategory, setCustomCategory] = useState('');
  const [descriptionRecipe, setDescriptionRecipe] = useState('');
  const [stepsRecipe, setStepsRecipe] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { nameIngredient: '', quantityIngredient: '', orderIngredient: 1 },
  ]);

  // Lista de categorías para sugerencias
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'Platos fuertes',
    'Postres',
    'Sopas',
    'Ensaladas',
    'Desayunos',
    'Bebidas',
    'Aperitivos',
    'Otra categoría',
  ]);

  // Estados de control
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Cargar categorías
  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await recipeApi.getCategories();
        if (cats.length > 0) {
          const merged = Array.from(new Set([...availableCategories, ...cats]));
          setAvailableCategories(merged);
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    }
    loadCategories();
  }, []);

  // Cargar receta si está en modo edición
  useEffect(() => {
    async function loadRecipeData() {
      if (!id) return;
      try {
        setIsLoadingRecipe(true);
        const recipe = await recipeApi.getRecipeById(parseInt(id, 10));

        // Verificar permisos de edición en el cliente (el backend también lo verifica de forma estricta)
        if (recipe.usernameAuthor !== user?.username && !isAdmin) {
          navigate('/');
          return;
        }

        setNameRecipe(recipe.nameRecipe);
        setDescriptionRecipe(recipe.descriptionRecipe);
        setStepsRecipe(recipe.stepsRecipe);
        setCategoryRecipe(recipe.categoryRecipe);
        setExistingImageUrl(recipe.imageRecipe || null);

        if (recipe.ingredients && recipe.ingredients.length > 0) {
          setIngredients(
            recipe.ingredients.map((ing, idx) => ({
              nameIngredient: ing.nameIngredient,
              quantityIngredient: ing.quantityIngredient,
              orderIngredient: ing.orderIngredient || idx + 1,
            }))
          );
        }
      } catch (err: any) {
        setGeneralError('No se pudo cargar la información de la receta.');
      } finally {
        setIsLoadingRecipe(false);
      }
    }

    if (isEditMode) {
      loadRecipeData();
    }
  }, [id, isEditMode, user, isAdmin, navigate]);

  // Validación local del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, any> = {};

    const trimmedName = nameRecipe.trim();
    if (!trimmedName) {
      newErrors.nameRecipe = 'El nombre de la receta es obligatorio.';
    } else if (trimmedName.length > 200) {
      newErrors.nameRecipe = 'El nombre no puede exceder 200 caracteres.';
    }

    const finalCategory = categoryRecipe === 'Otra categoría' ? customCategory.trim() : categoryRecipe.trim();
    if (!finalCategory) {
      newErrors.categoryRecipe = 'La categoría es obligatoria.';
    } else if (finalCategory.length > 100) {
      newErrors.categoryRecipe = 'La categoría no puede exceder 100 caracteres.';
    }

    const trimmedDesc = descriptionRecipe.trim();
    if (!trimmedDesc) {
      newErrors.descriptionRecipe = 'La descripción es obligatoria.';
    } else if (trimmedDesc.length > 500) {
      newErrors.descriptionRecipe = 'La descripción no puede superar los 500 caracteres.';
    }

    const trimmedSteps = stepsRecipe.trim();
    if (!trimmedSteps) {
      newErrors.stepsRecipe = 'Los pasos de preparación son obligatorios.';
    } else if (trimmedSteps.length > 500) {
      newErrors.stepsRecipe = 'Los pasos no pueden superar los 500 caracteres.';
    }

    // Validar lista de ingredientes
    const filledIngredients = ingredients.filter(
      (i) => i.nameIngredient.trim() || i.quantityIngredient.trim()
    );

    if (filledIngredients.length === 0) {
      newErrors.ingredients = 'Una receta requiere al menos un ingrediente para poder guardarse.';
    } else {
      const itemErrors: Record<number, any> = {};
      const seenNames = new Set<string>();

      filledIngredients.forEach((ing, index) => {
        const itemErr: Record<string, string> = {};
        const name = ing.nameIngredient.trim();
        const qty = ing.quantityIngredient.trim();

        if (!name) {
          itemErr.nameIngredient = 'El nombre es obligatorio.';
        } else if (name.length > 255) {
          itemErr.nameIngredient = 'Máximo 255 caracteres.';
        } else {
          const lowerName = name.toLowerCase();
          if (seenNames.has(lowerName)) {
            itemErr.nameIngredient = 'No se permiten ingredientes duplicados.';
          } else {
            seenNames.add(lowerName);
          }
        }

        if (!qty) {
          itemErr.quantityIngredient = 'La cantidad es requerida.';
        } else if (qty.length > 100) {
          itemErr.quantityIngredient = 'Máximo 100 caracteres.';
        }

        if (Object.keys(itemErr).length > 0) {
          itemErrors[index] = itemErr;
        }
      });

      if (Object.keys(itemErrors).length > 0) {
        newErrors.ingredientItems = itemErrors;
        newErrors.ingredients = 'Por favor corrige los datos de los ingredientes.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    const finalCategory = categoryRecipe === 'Otra categoría' ? customCategory.trim() : categoryRecipe.trim();
    const validIngredients = ingredients
      .filter((i) => i.nameIngredient.trim() && i.quantityIngredient.trim())
      .map((i, idx) => ({
        nameIngredient: i.nameIngredient.trim(),
        quantityIngredient: i.quantityIngredient.trim(),
        orderIngredient: idx + 1,
      }));

    const formData = new FormData();
    formData.append('nameRecipe', nameRecipe.trim());
    formData.append('categoryRecipe', finalCategory);
    formData.append('descriptionRecipe', descriptionRecipe.trim());
    formData.append('stepsRecipe', stepsRecipe.trim());
    formData.append('ingredients', JSON.stringify(validIngredients));

    if (imageFile) {
      formData.append('imageRecipe', imageFile);
    }

    try {
      setIsSubmitting(true);
      if (isEditMode && id) {
        const res = await recipeApi.updateRecipe(parseInt(id, 10), formData);
        navigate(`/recipes/${res.recipeId || id}`);
      } else {
        const res = await recipeApi.createRecipe(formData);
        navigate(`/recipes/${res.recipeId}`);
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setGeneralError(err.response?.data?.message || 'Error al procesar la receta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRecipe) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2>Cargando formulario de receta...</h2>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '2rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Navigation & Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to={isEditMode ? `/recipes/${id}` : '/'}
            className="nav-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}
          >
            <ArrowLeft size={18} />
            <span>{isEditMode ? 'Volver al detalle de la receta' : 'Volver al catálogo'}</span>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700 }}>
            {isEditMode ? 'Editar Receta' : 'Publicar Nueva Receta'}
          </h1>
          <p style={{ color: '#64748b' }}>
            Completa los detalles de tu preparación. Asegúrate de incluir todos los ingredientes y los pasos claros.
          </p>
        </div>

        {generalError && (
          <div className="alert alert-danger">
            <AlertCircle size={20} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: '100%' }}>
          {/* Título de la Receta */}
          <div className="form-group">
            <label className="form-label">
              Título de la Receta <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.nameRecipe ? 'is-invalid' : ''}`}
              placeholder="Ej. Tarta de Manzana Tradicional"
              value={nameRecipe}
              maxLength={200}
              onChange={(e) => {
                setNameRecipe(e.target.value);
                if (errors.nameRecipe) setErrors({ ...errors, nameRecipe: undefined });
              }}
            />
            {errors.nameRecipe && <span className="form-error">{errors.nameRecipe}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{nameRecipe.length} / 200</span>
            </div>
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label className="form-label">
              Categoría <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              className={`form-control ${errors.categoryRecipe ? 'is-invalid' : ''}`}
              value={categoryRecipe}
              onChange={(e) => {
                setCategoryRecipe(e.target.value);
                if (errors.categoryRecipe) setErrors({ ...errors, categoryRecipe: undefined });
              }}
            >
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {categoryRecipe === 'Otra categoría' && (
              <div style={{ marginTop: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Escribe el nombre de la categoría..."
                  maxLength={100}
                  className="form-control"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}
            {errors.categoryRecipe && <span className="form-error">{errors.categoryRecipe}</span>}
          </div>

          {/* Imagen de la Receta */}
          <ImageUpload
            label="Foto del Platillo (Opcional)"
            initialImageUrl={existingImageUrl}
            onFileSelect={(file) => setImageFile(file)}
            error={errors.imageRecipe}
            aspectRatio="wide"
          />

          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">
              Descripción Breve <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              className={`form-control ${errors.descriptionRecipe ? 'is-invalid' : ''}`}
              rows={3}
              placeholder="Describe de qué trata el platillo, sus sabores principales o su historia..."
              value={descriptionRecipe}
              maxLength={500}
              onChange={(e) => {
                setDescriptionRecipe(e.target.value);
                if (errors.descriptionRecipe) setErrors({ ...errors, descriptionRecipe: undefined });
              }}
            />
            {errors.descriptionRecipe && <span className="form-error">{errors.descriptionRecipe}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{descriptionRecipe.length} / 500</span>
            </div>
          </div>

          {/* Lista Dinámica de Ingredientes */}
          <IngredientFieldList
            ingredients={ingredients}
            onChange={(newIngs) => setIngredients(newIngs)}
            errors={errors}
          />

          {/* Pasos de Preparación */}
          <div className="form-group">
            <label className="form-label">
              Pasos de Preparación <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              className={`form-control ${errors.stepsRecipe ? 'is-invalid' : ''}`}
              rows={6}
              placeholder="Detalla paso a paso el proceso de elaboración (ej. 1. Precalentar el horno a 180°C. 2. Mezclar los ingredientes secos...)"
              value={stepsRecipe}
              maxLength={500}
              onChange={(e) => {
                setStepsRecipe(e.target.value);
                if (errors.stepsRecipe) setErrors({ ...errors, stepsRecipe: undefined });
              }}
            />
            {errors.stepsRecipe && <span className="form-error">{errors.stepsRecipe}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{stepsRecipe.length} / 500</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
            <Link to={isEditMode ? `/recipes/${id}` : '/'} className="btn btn-secondary">
              Cancelar
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg">
              <Save size={18} />
              <span>{isSubmitting ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Publicar Receta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
