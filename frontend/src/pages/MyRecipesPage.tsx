import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Utensils } from 'lucide-react';
import type { Recipe } from '../types';
import { recipeApi } from '../api/recipeApi';
import { useAuth } from '../context/AuthContext';
import { RecipeCard } from '../components/RecipeCard';

export const MyRecipesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    async function loadMyRecipes() {
      if (!user) return;
      try {
        setIsLoading(true);
        const data = await recipeApi.getRecipes({ author: user.username });
        setRecipes(data);
      } catch (err) {
        console.error('Error al cargar mis recetas:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMyRecipes();
  }, [user, isAuthenticated, navigate]);

  return (
    <div style={{ flex: 1, padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700 }}>
              Mis Recetas
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Administra todas las recetas que has publicado en la plataforma.
            </p>
          </div>

          <Link to="/recipes/new" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Nueva Receta</span>
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>
            <p>Cargando tus recetas...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div
            style={{
              backgroundColor: 'white',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <Utensils size={40} color="#d97706" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Aún no has publicado recetas</h3>
            <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
              Comparte tu primera creación culinaria con todos los amantes de la cocina.
            </p>
            <Link to="/recipes/new" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Publicar mi primera receta</span>
            </Link>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.idRecipe} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
