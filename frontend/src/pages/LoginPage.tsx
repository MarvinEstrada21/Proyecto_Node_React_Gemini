import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [passwordUser, setPasswordUser] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!username.trim()) {
      errs.username = 'El nombre de usuario es obligatorio.';
    }
    if (!passwordUser.trim()) {
      errs.passwordUser = 'La contraseña es obligatoria.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await login(username.trim(), passwordUser.trim());
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setGeneralError(
        err.response?.data?.message ||
          'Credenciales inválidas. Por favor verifica tu usuario y contraseña.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-icon"
            style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}
          >
            <LogIn size={24} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700 }}>
            Iniciar Sesión
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Ingresa a tu cuenta para crear recetas y comentar.
          </p>
        </div>

        {generalError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="ej. mariagonzalez"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: '' });
                }}
              />
            </div>
            {errors.username && <span className="form-error">{errors.username}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-control ${errors.passwordUser ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={passwordUser}
              onChange={(e) => {
                setPasswordUser(e.target.value);
                if (errors.passwordUser) setErrors({ ...errors, passwordUser: '' });
              }}
            />
            {errors.passwordUser && <span className="form-error">{errors.passwordUser}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Iniciando sesión...' : 'Ingresar'}</span>
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748b',
          }}
        >
          ¿No tienes una cuenta todavía?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
