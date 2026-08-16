/**
 * Validadores de entrada del servidor
 * Retornan un objeto de errores { campo: 'mensaje' }
 */

function validateRegisterInput(data) {
  const errors = {};
  const username = (data.username || '').trim();
  const nameUser = (data.nameUser || '').trim();
  const lastnameUser = (data.lastnameUser || '').trim();
  const passwordUser = (data.passwordUser || '').trim();

  // Username
  if (!username) {
    errors.username = 'El nombre de usuario es obligatorio.';
  } else if (username.length < 3) {
    errors.username = 'El nombre de usuario debe tener al menos 3 caracteres.';
  } else if (username.length > 100) {
    errors.username = 'El nombre de usuario no puede exceder los 100 caracteres.';
  } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    errors.username = 'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.';
  }

  // Name
  if (!nameUser) {
    errors.nameUser = 'El nombre es obligatorio.';
  } else if (nameUser.length > 100) {
    errors.nameUser = 'El nombre no puede superar los 100 caracteres.';
  }

  // Lastname
  if (!lastnameUser) {
    errors.lastnameUser = 'El apellido es obligatorio.';
  } else if (lastnameUser.length > 100) {
    errors.lastnameUser = 'El apellido no puede superar los 100 caracteres.';
  }

  // Password
  if (!passwordUser) {
    errors.passwordUser = 'La contraseña es obligatoria.';
  } else if (passwordUser.length < 6) {
    errors.passwordUser = 'La contraseña debe tener al menos 6 caracteres.';
  } else if (passwordUser.length > 255) {
    errors.passwordUser = 'La contraseña no puede superar los 255 caracteres.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      username,
      nameUser,
      lastnameUser,
      passwordUser
    }
  };
}

function validateLoginInput(data) {
  const errors = {};
  const username = (data.username || '').trim();
  const passwordUser = (data.passwordUser || '').trim();

  if (!username) {
    errors.username = 'El nombre de usuario es obligatorio.';
  }
  if (!passwordUser) {
    errors.passwordUser = 'La contraseña es obligatoria.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      username,
      passwordUser
    }
  };
}

function validateProfileUpdate(data) {
  const errors = {};
  const nameUser = (data.nameUser || '').trim();
  const lastnameUser = (data.lastnameUser || '').trim();

  if (!nameUser) {
    errors.nameUser = 'El nombre es obligatorio.';
  } else if (nameUser.length > 100) {
    errors.nameUser = 'El nombre no puede superar los 100 caracteres.';
  }

  if (!lastnameUser) {
    errors.lastnameUser = 'El apellido es obligatorio.';
  } else if (lastnameUser.length > 100) {
    errors.lastnameUser = 'El apellido no puede superar los 100 caracteres.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      nameUser,
      lastnameUser
    }
  };
}

function validateRecipeInput(data, rawIngredients) {
  const errors = {};
  const nameRecipe = (data.nameRecipe || '').trim();
  const categoryRecipe = (data.categoryRecipe || '').trim();
  const descriptionRecipe = (data.descriptionRecipe || '').trim();
  const stepsRecipe = (data.stepsRecipe || '').trim();

  // Nombre de receta
  if (!nameRecipe) {
    errors.nameRecipe = 'El título de la receta es obligatorio.';
  } else if (nameRecipe.length > 200) {
    errors.nameRecipe = 'El título no puede superar los 200 caracteres.';
  }

  // Categoría
  if (!categoryRecipe) {
    errors.categoryRecipe = 'La categoría es obligatoria.';
  } else if (categoryRecipe.length > 100) {
    errors.categoryRecipe = 'La categoría no puede superar los 100 caracteres.';
  }

  // Descripción
  if (!descriptionRecipe) {
    errors.descriptionRecipe = 'La descripción de la receta es obligatoria.';
  } else if (descriptionRecipe.length > 500) {
    errors.descriptionRecipe = 'La descripción no puede superar los 500 caracteres.';
  }

  // Pasos
  if (!stepsRecipe) {
    errors.stepsRecipe = 'Los pasos de preparación son obligatorios.';
  } else if (stepsRecipe.length > 500) {
    errors.stepsRecipe = 'Los pasos de preparación no pueden superar los 500 caracteres.';
  }

  // Ingredientes
  let parsedIngredients = [];
  if (typeof rawIngredients === 'string') {
    try {
      parsedIngredients = JSON.parse(rawIngredients);
    } catch {
      errors.ingredients = 'Formato de ingredientes inválido.';
    }
  } else if (Array.isArray(rawIngredients)) {
    parsedIngredients = rawIngredients;
  }

  const ingredientErrors = [];
  const sanitizedIngredients = [];
  const seenIngredientNames = new Set();

  if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
    errors.ingredients = 'Una receta requiere al menos un ingrediente para poder guardarse.';
  } else {
    parsedIngredients.forEach((ing, index) => {
      const name = (ing.nameIngredient || '').trim();
      const quantity = (ing.quantityIngredient || '').trim();
      const order = ing.orderIngredient !== undefined && ing.orderIngredient !== null && ing.orderIngredient !== ''
        ? parseInt(ing.orderIngredient, 10)
        : index + 1;

      const itemErr = {};

      if (!name) {
        itemErr.nameIngredient = 'El nombre del ingrediente es obligatorio.';
      } else if (name.length > 255) {
        itemErr.nameIngredient = 'El nombre del ingrediente no puede superar los 255 caracteres.';
      } else {
        const lowerName = name.toLowerCase();
        if (seenIngredientNames.has(lowerName)) {
          itemErr.nameIngredient = 'No se permite repetir el mismo ingrediente en la receta.';
        } else {
          seenIngredientNames.add(lowerName);
        }
      }

      if (!quantity) {
        itemErr.quantityIngredient = 'La cantidad es obligatoria.';
      } else if (quantity.length > 100) {
        itemErr.quantityIngredient = 'La cantidad no puede superar los 100 caracteres.';
      }

      if (Object.keys(itemErr).length > 0) {
        ingredientErrors[index] = itemErr;
      } else {
        sanitizedIngredients.push({
          nameIngredient: name,
          quantityIngredient: quantity,
          orderIngredient: order
        });
      }
    });

    if (ingredientErrors.length > 0) {
      errors.ingredientItems = ingredientErrors;
      if (!errors.ingredients) {
        errors.ingredients = 'Hay errores en la lista de ingredientes.';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      nameRecipe,
      categoryRecipe,
      descriptionRecipe,
      stepsRecipe,
      ingredients: sanitizedIngredients
    }
  };
}

function validateCommentInput(data) {
  const errors = {};
  const bodyComment = (data.bodyComment || '').trim();

  if (!bodyComment) {
    errors.bodyComment = 'El comentario no puede estar vacío.';
  } else if (bodyComment.length > 500) {
    errors.bodyComment = 'El comentario no puede exceder los 500 caracteres.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      bodyComment
    }
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateProfileUpdate,
  validateRecipeInput,
  validateCommentInput
};
