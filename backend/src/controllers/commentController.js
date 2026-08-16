const { pool } = require('../config/db');
const { validateCommentInput } = require('../middleware/validator');

// Obtener comentarios de una receta
async function getCommentsByRecipe(req, res, next) {
  try {
    const { recipeId } = req.params;
    const id = parseInt(recipeId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identificador de receta inválido.'
      });
    }

    const [comments] = await pool.query(
      `SELECT 
        c.idComment,
        c.idRecipe,
        c.bodyComment,
        c.usernameComment,
        c.createdIn,
        u.nameUser,
        u.lastnameUser,
        u.imageUser,
        u.roleUser
      FROM tb_comments c
      LEFT JOIN tb_users u ON c.usernameComment = u.username
      WHERE c.idRecipe = ?
      ORDER BY c.createdIn DESC`,
      [id]
    );

    return res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
}

// Crear un nuevo comentario en una receta
async function createComment(req, res, next) {
  try {
    const { recipeId } = req.params;
    const id = parseInt(recipeId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Identificador de receta inválido.'
      });
    }

    // Verificar que la receta exista
    const [recipes] = await pool.query(
      'SELECT idRecipe FROM tb_recipes WHERE idRecipe = ? LIMIT 1',
      [id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La receta a comentar no existe.'
      });
    }

    const { isValid, errors, sanitized } = validateCommentInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Por favor verifica el texto de tu comentario.',
        errors
      });
    }

    const { bodyComment } = sanitized;

    const [result] = await pool.query(
      `INSERT INTO tb_comments (idRecipe, bodyComment, usernameComment, createdIn)
       VALUES (?, ?, ?, NOW())`,
      [id, bodyComment, req.user.username]
    );

    // Obtener el comentario recién creado con los datos del usuario
    const [newCommentRows] = await pool.query(
      `SELECT 
        c.idComment,
        c.idRecipe,
        c.bodyComment,
        c.usernameComment,
        c.createdIn,
        u.nameUser,
        u.lastnameUser,
        u.imageUser,
        u.roleUser
      FROM tb_comments c
      LEFT JOIN tb_users u ON c.usernameComment = u.username
      WHERE c.idComment = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Comentario publicado exitosamente.',
      data: newCommentRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// Eliminar un comentario (Autor o Administrador)
async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const commentId = parseInt(id, 10);

    if (isNaN(commentId)) {
      return res.status(400).json({
        success: false,
        message: 'Identificador de comentario inválido.'
      });
    }

    // Verificar existencia del comentario
    const [comments] = await pool.query(
      'SELECT idComment, idRecipe, usernameComment FROM tb_comments WHERE idComment = ? LIMIT 1',
      [commentId]
    );

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado.'
      });
    }

    const comment = comments[0];
    const isAuthor = comment.usernameComment === req.user.username;
    const isAdmin = req.user.roleUser === 'admin';

    // Regla de seguridad #6: Solo autor o administrador
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este comentario.'
      });
    }

    await pool.query('DELETE FROM tb_comments WHERE idComment = ?', [commentId]);

    return res.json({
      success: true,
      message: 'Comentario eliminado exitosamente.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCommentsByRecipe,
  createComment,
  deleteComment
};
