import React from 'react';
import { UtensilsCrossed, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
              <UtensilsCrossed size={18} />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>
              Recetario
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
            <a href="#terminos">Términos</a>
            <a href="#privacidad">Privacidad</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
          <div>
            © {new Date().getFullYear()} Recetario Gourmet. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Creado con <Heart size={14} color="#ef4444" fill="#ef4444" /> para los amantes de la cocina.
          </div>
        </div>
      </div>
    </footer>
  );
};
