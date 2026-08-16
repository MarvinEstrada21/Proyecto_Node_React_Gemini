import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, MessageSquare, ChefHat } from 'lucide-react';
import type { Recipe } from '../types';
import { getImageUrl } from '../api/client';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const authorFullName = recipe.authorName 
    ? `${recipe.authorName} ${recipe.authorLastname || ''}`.trim() 
    : recipe.usernameAuthor;

  const getInitials = (name?: string) => {
    return (name || 'C').charAt(0).toUpperCase();
  };

  return (
    <Link to={`/recipes/${recipe.idRecipe}`} className="recipe-card">
      <div className="recipe-card-image-wrapper">
        {recipe.imageRecipe ? (
          <img 
            src={getImageUrl(recipe.imageRecipe)} 
            alt={recipe.nameRecipe} 
            className="recipe-card-image"
            loading="lazy"
          />
        ) : (
          <div className="recipe-card-placeholder">
            <Utensils size={48} opacity={0.6} />
          </div>
        )}
        <div className="recipe-card-badge">
          {recipe.categoryRecipe}
        </div>
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{recipe.nameRecipe}</h3>
        <p className="recipe-card-desc">{recipe.descriptionRecipe}</p>

        <div className="recipe-card-footer">
          <div className="recipe-card-author">
            {recipe.authorImage ? (
              <img 
                src={getImageUrl(recipe.authorImage)} 
                alt={authorFullName} 
                className="avatar"
                style={{ width: '28px', height: '28px', fontSize: '0.75rem' }} 
              />
            ) : (
              <div 
                className="avatar" 
                style={{ width: '28px', height: '28px', fontSize: '0.75rem', backgroundColor: '#e2e8f0' }}
              >
                {getInitials(recipe.authorName)}
              </div>
            )}
            <span style={{ fontSize: '0.85rem' }}>{authorFullName}</span>
          </div>

          <div className="recipe-card-meta">
            {recipe.ingredientsCount !== undefined && (
              <span title={`${recipe.ingredientsCount} ingredientes`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ChefHat size={15} />
                <span>{recipe.ingredientsCount}</span>
              </span>
            )}

            {recipe.commentsCount !== undefined && (
              <span title={`${recipe.commentsCount} comentarios`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MessageSquare size={15} />
                <span>{recipe.commentsCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
