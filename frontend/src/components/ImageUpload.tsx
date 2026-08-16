import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { getImageUrl } from '../api/client';

interface ImageUploadProps {
  label?: string;
  initialImageUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
  aspectRatio?: 'square' | 'wide';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Imagen (Opcional)',
  initialImageUrl,
  onFileSelect,
  error,
  aspectRatio = 'wide',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    initialImageUrl ? getImageUrl(initialImageUrl) : null
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setLocalError(null);

    if (!file) {
      return;
    }

    // Validar tipo de archivo (JPG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setLocalError('Solo se permiten archivos en formato JPG, PNG o WEBP.');
      return;
    }

    // Validar tamaño máximo (2 MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setLocalError('La imagen no debe superar los 2 MB.');
      return;
    }

    // Generar preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  const displayError = error || localError;

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {preview ? (
        <div className="image-preview-wrapper" style={{ height: aspectRatio === 'square' ? '180px' : '220px' }}>
          <img src={preview} alt="Vista previa" className="image-preview" />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            title="Quitar imagen"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          className={`image-dropzone ${displayError ? 'is-invalid' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={32} color="#d97706" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontWeight: 500, fontSize: '0.95rem', color: '#1e293b' }}>
            Haz clic para seleccionar una foto
          </div>
          <div className="form-hint">
            Formatos admitidos: JPG, PNG o WEBP (Máx. 2 MB)
          </div>
        </div>
      )}

      {displayError && <span className="form-error">{displayError}</span>}
    </div>
  );
};
