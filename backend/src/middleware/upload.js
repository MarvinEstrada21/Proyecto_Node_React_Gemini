const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Asegurar que el directorio de uploads existe
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento en disco con nombres aleatorios no predecibles
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre criptográficamente seguro
    const randomHex = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    
    // Mapear extensión segura basada en mimetype validado
    let ext = '.jpg';
    if (file.mimetype === 'image/png') ext = '.png';
    else if (file.mimetype === 'image/webp') ext = '.webp';
    else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') ext = '.jpg';
    
    const safeFilename = `${timestamp}-${randomHex}${ext}`;
    cb(null, safeFilename);
  }
});

// Filtro de validación de tipo MIME real
const fileFilter = (req, file, cb) => {
  const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimetypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error('Formato de imagen inválido. Solo se admiten archivos JPG, PNG y WEBP.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Instancia de Multer configurada
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // Límite estricto de 2 MB
  },
  fileFilter: fileFilter
});

// Middleware auxiliar para envolver multer y atrapar errores de tamaño de forma limpia
function handleUpload(fieldName) {
  const multerSingle = upload.single(fieldName);
  return (req, res, next) => {
    multerSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'La imagen excede el tamaño máximo permitido de 2 MB.',
            errors: { [fieldName]: 'El archivo no debe superar los 2 MB.' }
          });
        }
        return res.status(400).json({
          success: false,
          message: `Error al procesar el archivo: ${err.message}`,
          errors: { [fieldName]: err.message }
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
          errors: { [fieldName]: err.message }
        });
      }
      next();
    });
  };
}

module.exports = {
  upload,
  handleUpload,
  uploadsDir
};
