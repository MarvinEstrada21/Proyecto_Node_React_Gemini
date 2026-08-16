import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  ChefHat, 
  Calendar, 
  CheckCircle2, 
  Utensils 
} from 'lucide-react';
import type { Recipe } from '../types';
import { recipeApi } from '../api/recipeApi';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../api/client';
import { CommentSection } from '../components/CommentSection';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de confirmación para eliminar receta
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    async function loadRecipe() {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await recipeApi.getRecipeById(parseInt(id, 10));
        setRecipe(data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'No se pudo cargar la receta');
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

  const handleDeleteRecipe = async () => {
    if (!recipe) return;
    try {
      setIsDeleting(true);
      await recipeApi.deleteRecipe(recipe.idRecipe);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar la receta');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'long',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name?: string, lastname?: string) => {
    const f = name ? name.charAt(0) : '';
    const l = lastname ? lastname.charAt(0) : '';
    return `${f}${l}`.toUpperCase() || 'C';
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <h2>Cargando los detalles de la receta...</h2>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>Receta no encontrada</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          {error || 'La receta solicitada no existe o ha sido eliminada.'}
        </p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Volver al inicio</span>
        </Link>
      </div>
    );
  }

  const isAuthor = isAuthenticated && user?.username === recipe.usernameAuthor;
  const canModify = isAuthor || isAdmin;
  const authorFullName = recipe.authorName
    ? `${recipe.authorName} ${recipe.authorLastname || ''}`.trim()
    : recipe.usernameAuthor;

  return (
    <div style={{ flex: 1, paddingBottom: '4rem' }}>
      {/* Header Bar */}
      <header className="recipe-detail-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <Link to="/" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={18} />
              <span>Volver a recetas</span>
            </Link>

            {canModify && (
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <Link to={`/recipes/edit/${recipe.idRecipe}`} className="btn btn-secondary btn-sm">
                  <Edit3 size={15} />
                  <span>Editar</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="btn btn-danger-outline btn-sm"
                >
                  <Trash2 size={15} />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <span className="user-badge user-badge-admin" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-hover)' }}>
              {recipe.categoryRecipe}
            </span>
          </div>

          <h1 className="recipe-detail-title">{recipe.nameRecipe}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {recipe.authorImage ? (
                <img
                  src={getImageUrl(recipe.authorImage)}
                  alt={authorFullName}
                  className="avatar"
                  style={{ width: '30px', height: '30px' }}
                />
              ) : (
                <div className="avatar" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>
                  {getInitials(recipe.authorName, recipe.authorLastname)}
                </div>
              )}
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{authorFullName}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} />
              <span>Publicado: {formatDate(recipe.createdIn)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="container">
        <div className="recipe-detail-grid">
          {/* Main Column */}
          <div>
            {/* Imagen Principal */}
            {recipe.imageRecipe && (
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  marginBottom: '2rem',
                  maxHeight: '420px',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <img
                  src={getImageUrl(recipe.imageRecipe)}
                  alt={recipe.nameRecipe}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Descripción */}
            <div className="detail-section-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                Descripción
              </h3>
              <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.7 }}>
                {recipe.descriptionRecipe}
              </p>
            </div>

            {/* Pasos de Preparación */}
            <div className="detail-section-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <Utensils size={22} color="#d97706" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                  Modo de Preparación
                </h3>
              </div>
              <div className="steps-content">
                {recipe.stepsRecipe}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            {/* Tarjeta de Ingredientes */}
            <div className="detail-section-card" style={{ position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <ChefHat size={22} color="#d97706" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  Ingredientes ({recipe.ingredients?.length || 0})
                </h3>
              </div>

              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="ingredients-list">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={ing.idIngredient || idx} className="ingredient-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span className="ingredient-name">{ing.nameIngredient}</span>
                      </div>
                      <span className="ingredient-qty">{ing.quantityIngredient}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  No se registraron ingredientes.
                </p>
              )}

              {/* Tarjeta de Autor */}
              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                }}
              >
                {recipe.authorImage ? (
                  <img
                    src={getImageUrl(recipe.authorImage)}
                    alt={authorFullName}
                    className="avatar"
                    style={{ width: '45px', height: '45px' }}
                  />
                ) : (
                  <div className="avatar" style={{ width: '45px', height: '45px' }}>
                    {getInitials(recipe.authorName, recipe.authorLastname)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Receta creada por</div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{authorFullName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>@{recipe.usernameAuthor}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Comentarios */}
        <div style={{ maxWidth: '850px' }}>
          <CommentSection recipeId={recipe.idRecipe} />
        </div>
      </div>

      {/* Modal de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Eliminar Receta"
        message={`¿Estás seguro de que deseas eliminar permanentemente la receta "${recipe.nameRecipe}"? Se eliminarán también todos sus comentarios e ingredientes.`}
        confirmLabel="Eliminar Receta"
        isLoading={isDeleting}
        onConfirm={handleDeleteRecipe}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
