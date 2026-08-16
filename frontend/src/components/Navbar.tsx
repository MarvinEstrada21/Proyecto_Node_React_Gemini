import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, PlusCircle, User as UserIcon, LogOut, BookOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../api/client';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name?: string, lastname?: string) => {
    const first = name ? name.charAt(0).toUpperCase() : '';
    const second = lastname ? lastname.charAt(0).toUpperCase() : '';
    return `${first}${second}` || 'U';
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <UtensilsCrossed size={22} />
          </div>
          <span>Recetario</span>
        </Link>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>Explorar</span>
            </Link>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <Link 
                  to="/recipes/new" 
                  className={`nav-link ${location.pathname === '/recipes/new' ? 'active' : ''}`}
                >
                  <PlusCircle size={18} />
                  <span>Publicar Receta</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/my-recipes" 
                  className={`nav-link ${location.pathname === '/my-recipes' ? 'active' : ''}`}
                >
                  <span>Mis Recetas</span>
                </Link>
              </li>
            </>
          )}

          {/* User Controls */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
              <Link 
                to="/profile" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
                title="Ver perfil"
              >
                {user.imageUser ? (
                  <img 
                    src={getImageUrl(user.imageUser)} 
                    alt={user.nameUser} 
                    className="avatar" 
                  />
                ) : (
                  <div className="avatar">
                    {getInitials(user.nameUser, user.lastnameUser)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.2 }}>
                    {user.nameUser} {user.lastnameUser}
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    {isAdmin ? (
                      <span className="user-badge user-badge-admin">
                        <ShieldCheck size={12} /> Admin
                      </span>
                    ) : (
                      <span className="user-badge user-badge-user">
                        Usuario
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <button 
                onClick={handleLogout} 
                className="btn btn-secondary btn-sm"
                title="Cerrar sesión"
                style={{ padding: '0.4rem 0.7rem' }}
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <UserIcon size={16} />
                <span>Iniciar Sesión</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <span>Registrarse</span>
              </Link>
            </div>
          )}
        </ul>
      </div>
    </nav>
  );
};
