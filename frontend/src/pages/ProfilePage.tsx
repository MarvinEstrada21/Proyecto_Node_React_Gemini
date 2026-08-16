import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, ShieldCheck, Save, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageUpload } from '../components/ImageUpload';
import { getImageUrl } from '../api/client';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [nameUser, setNameUser] = useState('');
  const [lastnameUser, setLastnameUser] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setNameUser(user.nameUser || '');
      setLastnameUser(user.lastnameUser || '');
      setExistingImageUrl(user.imageUser || null);
    }
  }, [user, isAuthenticated, navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nameUser.trim()) {
      errs.nameUser = 'El nombre es obligatorio.';
    } else if (nameUser.trim().length > 100) {
      errs.nameUser = 'Máximo 100 caracteres.';
    }

    if (!lastnameUser.trim()) {
      errs.lastnameUser = 'El apellido es obligatorio.';
    } else if (lastnameUser.trim().length > 100) {
      errs.lastnameUser = 'Máximo 100 caracteres.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setGeneralError(null);

    if (!validate()) return;

    const formData = new FormData();
    formData.append('nameUser', nameUser.trim());
    formData.append('lastnameUser', lastnameUser.trim());
    if (imageFile) {
      formData.append('imageUser', imageFile);
    }

    try {
      setIsSubmitting(true);
      await updateProfile(formData);
      setSuccessMessage('¡Perfil actualizado con éxito!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      setGeneralError(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string, lastname?: string) => {
    const f = name ? name.charAt(0) : '';
    const l = lastname ? lastname.charAt(0) : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  if (!user) return null;

  return (
    <div style={{ flex: 1, padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '650px' }}>
        {/* Profile Card Header */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2rem',
          }}
        >
          {user.imageUser ? (
            <img
              src={getImageUrl(user.imageUser)}
              alt={user.nameUser}
              className="avatar avatar-lg"
              style={{ margin: '0 auto 1rem auto' }}
            />
          ) : (
            <div className="avatar avatar-lg" style={{ margin: '0 auto 1rem auto' }}>
              {getInitials(user.nameUser, user.lastnameUser)}
            </div>
          )}

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {user.nameUser} {user.lastnameUser}
          </h1>

          <div style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '0.8rem' }}>
            @{user.username}
          </div>

          <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
            {isAdmin ? (
              <span className="user-badge user-badge-admin" style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}>
                <ShieldCheck size={14} /> Administrador
              </span>
            ) : (
              <span className="user-badge user-badge-user" style={{ padding: '0.35rem 0.8rem', fontSize: '0.82rem' }}>
                <UserIcon size={14} /> Usuario Estándar
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/my-recipes" className="btn btn-secondary btn-sm">
              <BookOpen size={16} />
              <span>Ver mis recetas</span>
            </Link>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="form-card" style={{ maxWidth: '100%', margin: 0 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Editar Información Personal
          </h2>

          {successMessage && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {generalError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className={`form-control ${errors.nameUser ? 'is-invalid' : ''}`}
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
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  className={`form-control ${errors.lastnameUser ? 'is-invalid' : ''}`}
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

            <div className="form-group">
              <label className="form-label">Nombre de usuario (No modificable)</label>
              <input
                type="text"
                disabled
                value={`@${user.username}`}
                className="form-control"
                style={{ backgroundColor: 'var(--bg-main)', color: '#64748b' }}
              />
            </div>

            <ImageUpload
              label="Actualizar Foto de Perfil (Opcional)"
              initialImageUrl={existingImageUrl}
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
              <Save size={18} />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
