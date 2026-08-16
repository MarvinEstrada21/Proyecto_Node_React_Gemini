import React, { useState, useEffect } from 'react';
import { Search, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../types';
import { recipeApi } from '../api/recipeApi';
import { RecipeCard } from '../components/RecipeCard';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar categorías disponibles
  useEffect(() => {
    async function loadCategories() {
      try {
        const catList = await recipeApi.getCategories();
        setCategories(['Todas', ...catList]);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    }
    loadCategories();
  }, []);

  // Cargar recetas al cambiar filtros o búsqueda
  useEffect(() => {
    async function loadRecipes() {
      try {
        setIsLoading(true);
        const data = await recipeApi.getRecipes({
          search: searchTerm.trim() || undefined,
          category: selectedCategory !== 'Todas' ? selectedCategory : undefined,
        });
        setRecipes(data);
      } catch (err) {
        console.error('Error al cargar recetas:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadRecipes();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  return (
    <div style={{ flex: 1 }}>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Descubre, Cocina y Comparte tus Mejores Recetas
            </h1>
            <p className="hero-subtitle">
              Explora una amplia colección gastronómica creada por la comunidad. Encuentra inspiración culinaria para cada ocasión.
            </p>

            <div className="search-box-wrapper">
              <Search size={20} color="#94a3b8" style={{ marginLeft: '0.5rem' }} />
              <input
                type="text"
                placeholder="Buscar por nombre de receta (ej. Tacos, Ensalada, Tarta)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: '0 0.5rem',
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container">
        {/* Categories Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Header con conteo y botón de publicar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              {selectedCategory === 'Todas' ? 'Todas las Recetas' : selectedCategory}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
              {recipes.length} {recipes.length === 1 ? 'receta disponible' : 'recetas disponibles'}
            </p>
          </div>

          {isAuthenticated && (
            <Link to="/recipes/new" className="btn btn-primary btn-sm">
              <PlusCircle size={16} />
              <span>Nueva Receta</span>
            </Link>
          )}
        </div>

        {/* Listado de recetas */}
        {isLoading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Cargando catálogo de recetas...</div>
          </div>
        ) : recipes.length === 0 ? (
          <div
            style={{
              backgroundColor: 'white',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '4rem 2rem',
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            <Sparkles size={40} color="#d97706" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No se encontraron recetas</h3>
            <p style={{ color: '#64748b', maxWidth: '460px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
              No encontramos recetas que coincidan con tu búsqueda actual. Intenta cambiar de categoría o buscar con otro término.
            </p>
            {isAuthenticated ? (
              <Link to="/recipes/new" className="btn btn-primary">
                <PlusCircle size={18} />
                <span>Sé el primero en publicar una</span>
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary">
                <span>Únete para publicar tu receta</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.idRecipe} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
