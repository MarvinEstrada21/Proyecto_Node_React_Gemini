const { pool } = require('../config/db');
const { validateRecipeInput } = require('../middleware/validator');

// Listar recetas con filtros de búsqueda por nombre y categoría
async function getRecipes(req, res, next) {
  try {
    const { search, category, author } = req.query;
    
    let query = `
      SELECT 
        r.idRecipe,
        r.nameRecipe,
        r.categoryRecipe,
        r.descriptionRecipe,
        r.stepsRecipe,
        r.imageRecipe,
        r.usernameAuthor,
        r.createdIn,
        u.nameUser AS authorName,
        u.lastnameUser AS authorLastname,
        u.imageUser AS authorImage,
        COUNT(DISTINCT c.idComment) AS commentsCount,
        COUNT(DISTINCT i.idIngredient) AS ingredientsCount
      FROM tb_recipes r
      LEFT JOIN tb_users u ON r.usernameAuthor = u.username
      LEFT JOIN tb_comments c ON r.idRecipe = c.idRecipe
      LEFT JOIN tb_ingredients i ON r.idRecipe = i.idRecipe
      WHERE 1=1
    `;
    
    const params = [];

    if (search && search.trim()) {
      query += ` AND r.nameRecipe LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    if (category && category.trim() && category.trim().toLowerCase() !== 'todas') {
      query += ` AND r.categoryRecipe = ?`;
      params.push(category.trim());
    }

    if (author && author.trim()) {
      query += ` AND r.usernameAuthor = ?`;
      params.push(author.trim());
    }

    query += ` GROUP BY r.idRecipe ORDER BY r.createdIn DESC`;

    const [recipes] = await pool.query(query, params);

    return res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    next(error);
  }
}

// Obtener detalle completo de una receta con sus ingredientes y autor
async function getRecipeById(req, res, next) {
  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Identificador de receta inválido.'
      });
    }

    const [recipes] = await pool.query(
      `SELECT 
        r.idRecipe,
        r.nameRecipe,
        r.categoryRecipe,
        r.descriptionRecipe,
        r.stepsRecipe,
        r.imageRecipe,
        r.usernameAuthor,
        r.createdIn,
        u.nameUser AS authorName,
        u.lastnameUser AS authorLastname,
        u.imageUser AS authorImage
      FROM tb_recipes r
      LEFT JOIN tb_users u ON r.usernameAuthor = u.username
      WHERE r.idRecipe = ? LIMIT 1`,
      [recipeId]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada.'
      });
    }

    const recipe = recipes[0];

    // Obtener ingredientes ordenados
    const [ingredients] = await pool.query(
      `SELECT idIngredient, idRecipe, nameIngredient, quantityIngredient, orderIngredient 
       FROM tb_ingredients 
       WHERE idRecipe = ? 
       ORDER BY orderIngredient ASC, idIngredient ASC`,
      [recipeId]
    );

    recipe.ingredients = ingredients;

    return res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
}

// Crear una nueva receta con sus ingredientes (Transaccional)
async function createRecipe(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const rawIngredients = req.body.ingredients;
    const { isValid, errors, sanitized } = validateRecipeInput(req.body, rawIngredients);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Por favor revisa los campos de la receta.',
        errors
      });
    }

    const { nameRecipe, categoryRecipe, descriptionRecipe, stepsRecipe, ingredients } = sanitized;
    let imageRecipe = null;
    if (req.file) {
      imageRecipe = `/uploads/${req.file.filename}`;
    }

    await connection.beginTransaction();

    // Insertar receta
    const [result] = await connection.query(
      `INSERT INTO tb_recipes 
       (nameRecipe, categoryRecipe, descriptionRecipe, stepsRecipe, imageRecipe, usernameAuthor, createdIn)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [nameRecipe, categoryRecipe, descriptionRecipe, stepsRecipe, imageRecipe, req.user.username]
    );

    const newRecipeId = result.insertId;

    // Insertar ingredientes
    for (let idx = 0; idx < ingredients.length; idx++) {
      const ing = ingredients[idx];
      await connection.query(
        `INSERT INTO tb_ingredients 
         (idRecipe, nameIngredient, quantityIngredient, orderIngredient)
         VALUES (?, ?, ?, ?)`,
        [newRecipeId, ing.nameIngredient, ing.quantityIngredient, ing.orderIngredient || idx + 1]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Receta creada exitosamente.',
      recipeId: newRecipeId
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// Editar receta existente (Autor o Admin)
async function updateRecipe(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Identificador de receta inválido.'
      });
    }

    // Verificar existencia y propiedad
    const [existing] = await connection.query(
      'SELECT idRecipe, usernameAuthor, imageRecipe FROM tb_recipes WHERE idRecipe = ? LIMIT 1',
      [recipeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada.'
      });
    }

    const currentRecipe = existing[0];

    // Comprobación de autorización estricta en el servidor (Regla #6)
    const isAuthor = currentRecipe.usernameAuthor === req.user.username;
    const isAdmin = req.user.roleUser === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta receta.'
      });
    }

    const rawIngredients = req.body.ingredients;
    const { isValid, errors, sanitized } = validateRecipeInput(req.body, rawIngredients);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Por favor revisa los datos de la receta.',
        errors
      });
    }

    const { nameRecipe, categoryRecipe, descriptionRecipe, stepsRecipe, ingredients } = sanitized;
    let imageRecipe = currentRecipe.imageRecipe;

    // Si se subió una nueva imagen
    if (req.file) {
      imageRecipe = `/uploads/${req.file.filename}`;
    }

    await connection.beginTransaction();

    // Actualizar datos de receta
    await connection.query(
      `UPDATE tb_recipes 
       SET nameRecipe = ?, categoryRecipe = ?, descriptionRecipe = ?, stepsRecipe = ?, imageRecipe = ?
       WHERE idRecipe = ?`,
      [nameRecipe, categoryRecipe, descriptionRecipe, stepsRecipe, imageRecipe, recipeId]
    );

    // Reemplazar ingredientes (eliminar existentes y reinsertar nuevos)
    await connection.query('DELETE FROM tb_ingredients WHERE idRecipe = ?', [recipeId]);

    for (let idx = 0; idx < ingredients.length; idx++) {
      const ing = ingredients[idx];
      await connection.query(
        `INSERT INTO tb_ingredients 
         (idRecipe, nameIngredient, quantityIngredient, orderIngredient)
         VALUES (?, ?, ?, ?)`,
        [recipeId, ing.nameIngredient, ing.quantityIngredient, ing.orderIngredient || idx + 1]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: 'Receta actualizada exitosamente.',
      recipeId
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// Eliminar receta (Autor o Admin)
async function deleteRecipe(req, res, next) {
  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Identificador de receta inválido.'
      });
    }

    // Verificar existencia y propiedad
    const [existing] = await pool.query(
      'SELECT idRecipe, usernameAuthor FROM tb_recipes WHERE idRecipe = ? LIMIT 1',
      [recipeId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receta no encontrada.'
      });
    }

    const currentRecipe = existing[0];
    const isAuthor = currentRecipe.usernameAuthor === req.user.username;
    const isAdmin = req.user.roleUser === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta receta.'
      });
    }

    // Eliminar receta (FK CASCADE eliminará automáticamente ingredientes y comentarios asociados)
    await pool.query('DELETE FROM tb_recipes WHERE idRecipe = ?', [recipeId]);

    return res.json({
      success: true,
      message: 'Receta eliminada exitosamente.'
    });
  } catch (error) {
    next(error);
  }
}

// Obtener todas las categorías disponibles
async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT categoryRecipe FROM tb_recipes WHERE categoryRecipe IS NOT NULL AND categoryRecipe != '' ORDER BY categoryRecipe ASC`
    );

    const defaultCategories = [
      'Platos fuertes',
      'Postres',
      'Sopas',
      'Ensaladas',
      'Desayunos',
      'Bebidas',
      'Aperitivos'
    ];

    const dbCategories = rows.map(r => r.categoryRecipe);
    const allCategories = Array.from(new Set([...defaultCategories, ...dbCategories])).sort();

    return res.json({
      success: true,
      data: allCategories
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategories
};
