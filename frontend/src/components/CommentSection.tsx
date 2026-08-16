import React, { useState, useEffect } from 'react';
import { Send, Trash2, MessageSquare, ShieldCheck, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Comment } from '../types';
import { commentApi } from '../api/commentApi';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../api/client';
import { ConfirmationModal } from './ConfirmationModal';

interface CommentSectionProps {
  recipeId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ recipeId }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de eliminación
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    loadComments();
  }, [recipeId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await commentApi.getCommentsByRecipe(recipeId);
      setComments(data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmed = newComment.trim();
    if (!trimmed) {
      setFormError('El comentario no puede estar vacío.');
      return;
    }

    if (trimmed.length > 500) {
      setFormError('El comentario no puede exceder los 500 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await commentApi.createComment(recipeId, trimmed);
      setComments([created, ...comments]);
      setNewComment('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al publicar comentario';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await commentApi.deleteComment(deleteTargetId);
      setComments(comments.filter((c) => c.idComment !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el comentario.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name?: string, lastname?: string) => {
    const f = name ? name.charAt(0) : '';
    const l = lastname ? lastname.charAt(0) : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  return (
    <div className="detail-section-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={22} color="#d97706" />
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* Formulario para agregar comentario */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} style={{ marginBottom: '2rem' }}>
          <div className="form-group" style={{ marginBottom: '0.6rem' }}>
            <label className="form-label">Deja tu opinión sobre esta receta</label>
            <textarea
              className={`form-control ${formError ? 'is-invalid' : ''}`}
              rows={3}
              placeholder="¿Probaste esta receta? Comparte tus tips o qué tal te quedó..."
              value={newComment}
              maxLength={500}
              onChange={(e) => {
                setNewComment(e.target.value);
                if (formError) setFormError(null);
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
              <div>{formError && <span className="form-error">{formError}</span>}</div>
              <span style={{ fontSize: '0.8rem', color: newComment.length > 450 ? '#dc2626' : '#94a3b8' }}>
                {newComment.length} / 500
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="btn btn-primary btn-sm"
            style={{ float: 'right' }}
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Publicando...' : 'Publicar Comentario'}</span>
          </button>
          <div style={{ clear: 'both' }} />
        </form>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            padding: '1.2rem',
            marginBottom: '2rem',
            textAlign: 'center',
            border: '1px dashed var(--border-light)',
          }}
        >
          <Lock size={20} color="#94a3b8" style={{ margin: '0 auto 0.4rem auto' }} />
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            Inicia sesión para compartir tu experiencia o dejar una reseña en esta receta.
          </p>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Iniciar Sesión
          </Link>
        </div>
      )}

      {/* Lista de comentarios */}
      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          Cargando comentarios...
        </div>
      ) : comments.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem' }}>
          Aún no hay comentarios en esta receta. ¡Sé el primero en compartir tu opinión!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {comments.map((comment) => {
            const authorFullName = comment.nameUser
              ? `${comment.nameUser} ${comment.lastnameUser || ''}`.trim()
              : comment.usernameComment;
            
            // Permiso para borrar: autor o administrador
            const canDelete =
              isAuthenticated &&
              (user?.username === comment.usernameComment || isAdmin);

            return (
              <div key={comment.idComment} className="comment-item">
                {comment.imageUser ? (
                  <img
                    src={getImageUrl(comment.imageUser)}
                    alt={authorFullName}
                    className="avatar"
                    style={{ width: '36px', height: '36px' }}
                  />
                ) : (
                  <div className="avatar" style={{ width: '36px', height: '36px' }}>
                    {getInitials(comment.nameUser, comment.lastnameUser)}
                  </div>
                )}

                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author">
                      <span>{authorFullName}</span>
                      {comment.roleUser === 'admin' && (
                        <span className="user-badge user-badge-admin" style={{ fontSize: '0.7rem' }}>
                          <ShieldCheck size={11} /> Admin
                        </span>
                      )}
                      <span className="comment-date">{formatDate(comment.createdIn)}</span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => setDeleteTargetId(comment.idComment)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94a3b8',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        title="Eliminar comentario"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <p className="comment-body">{comment.bodyComment}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación de eliminación de comentario */}
      <ConfirmationModal
        isOpen={deleteTargetId !== null}
        title="Eliminar Comentario"
        message="¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar Comentario"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
