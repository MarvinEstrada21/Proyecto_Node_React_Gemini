import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageUpload } from '../components/ImageUpload';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Estados del formulario conservados intactos
  const [username, setUsername] = useState('');
  const [nameUser, setNameUser] = useState('');
  const [lastnameUser, setLastnameUser] = useState('');
  const [passwordUser, setPasswordUser] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    const trimmedUser = username.trim();
    if (!trimmedUser) {
      errs.username = 'El nombre de usuario es obligatorio.';
    } else if (trimmedUser.length < 3) {
      errs.username = 'Debe contener al menos 3 caracteres.';
    } else if (trimmedUser.length > 100) {
      errs.username = 'No puede superar los 100 caracteres.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedUser)) {
      errs.username = 'Solo letras, números, puntos y guiones.';
    }

    const trimmedName = nameUser.trim();
    if (!trimmedName) {
      errs.nameUser = 'El nombre es obligatorio.';
    } else if (trimmedName.length > 100) {
      errs.nameUser = 'No puede superar los 100 caracteres.';
    }

    const trimmedLastname = lastnameUser.trim();
    if (!trimmedLastname) {
      errs.lastnameUser = 'El apellido es obligatorio.';
    } else if (trimmedLastname.length > 100) {
      errs.lastnameUser = 'No puede superar los 100 caracteres.';
    }

    const trimmedPass = passwordUser.trim();
    if (!trimmedPass) {
      errs.passwordUser = 'La contraseña es obligatoria.';
    } else if (trimmedPass.length < 6) {
      errs.passwordUser = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (trimmedPass.length > 255) {
      errs.passwordUser = 'No puede superar los 255 caracteres.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('nameUser', nameUser.trim());
    formData.append('lastnameUser', lastnameUser.trim());
    formData.append('passwordUser', passwordUser.trim());

    if (imageFile) {
      formData.append('imageUser', imageFile);
    }

    try {
      setIsSubmitting(true);
      await register(formData);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setGeneralError(
        err.response?.data?.message ||
          'Error al crear la cuenta. Por favor verifica los datos ingresados.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-icon"
            style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}
          >
            <UserPlus size={24} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700 }}>
            Crear Cuenta
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Únete a nuestra comunidad culinaria y comparte tus creaciones.
          </p>
        </div>

        {generalError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nombre y Apellido en 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">
                Nombre <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.nameUser ? 'is-invalid' : ''}`}
                placeholder="ej. Ana"
                value={nameUser}
                maxLength={100}
                onChange={(e) => {
                  setNameUser(e.target.value);
                  if (errors.nameUser) setErrors({ ...errors, nameUser: '' });
                }}
              />
              {errors.nameUser && <span className="form-error">{errors.nameUser}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Apellido <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.lastnameUser ? 'is-invalid' : ''}`}
                placeholder="ej. Cruz"
                value={lastnameUser}
                maxLength={100}
                onChange={(e) => {
                  setLastnameUser(e.target.value);
                  if (errors.lastnameUser) setErrors({ ...errors, lastnameUser: '' });
                }}
              />
              {errors.lastnameUser && <span className="form-error">{errors.lastnameUser}</span>}
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label">
              Nombre de Usuario <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="ej. anacruz"
              value={username}
              maxLength={100}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors({ ...errors, username: '' });
              }}
            />
            {errors.username && <span className="form-error">{errors.username}</span>}
            <span className="form-hint">Tu identificador único en la plataforma.</span>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              Contraseña <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="password"
              className={`form-control ${errors.passwordUser ? 'is-invalid' : ''}`}
              placeholder="Mínimo 6 caracteres"
              value={passwordUser}
              maxLength={255}
              onChange={(e) => {
                setPasswordUser(e.target.value);
                if (errors.passwordUser) setErrors({ ...errors, passwordUser: '' });
              }}
            />
            {errors.passwordUser && <span className="form-error">{errors.passwordUser}</span>}
          </div>

          {/* Foto de Perfil Opcional */}
          <ImageUpload
            label="Foto de Perfil (Opcional)"
            onFileSelect={(file) => setImageFile(file)}
            error={errors.imageUser}
            aspectRatio="square"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Registrando...' : 'Completar Registro'}</span>
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
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
