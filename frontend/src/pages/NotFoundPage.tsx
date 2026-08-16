import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px' }}>
        <div
          className="brand-icon"
          style={{ width: '64px', height: '64px', margin: '0 auto 1.5rem auto' }}
        >
          <UtensilsCrossed size={32} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Página no encontrada</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.95rem' }}>
          La página o receta que estás buscando no existe o fue movida a otra ubicación.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={18} />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
};
