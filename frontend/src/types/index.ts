export interface User {
  username: string;
  nameUser: string;
  lastnameUser: string;
  imageUser?: string | null;
  roleUser: 'user' | 'admin' | string;
  createdIn?: string;
}

export interface Ingredient {
  idIngredient?: number;
  idRecipe?: number;
  nameIngredient: string;
  quantityIngredient: string;
  orderIngredient?: number;
}

export interface Comment {
  idComment: number;
  idRecipe: number;
  bodyComment: string;
  usernameComment: string;
  createdIn: string;
  nameUser?: string;
  lastnameUser?: string;
  imageUser?: string | null;
  roleUser?: string;
}

export interface Recipe {
  idRecipe: number;
  nameRecipe: string;
  categoryRecipe: string;
  descriptionRecipe: string;
  stepsRecipe: string;
  imageRecipe?: string | null;
  usernameAuthor: string;
  createdIn: string;
  authorName?: string;
  authorLastname?: string;
  authorImage?: string | null;
  commentsCount?: number;
  ingredientsCount?: number;
  ingredients?: Ingredient[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string | Record<string, string>>;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  errors?: Record<string, string>;
}

export interface IngredientInput {
  nameIngredient: string;
  quantityIngredient: string;
  orderIngredient?: number;
}

export interface RecipeFormData {
  nameRecipe: string;
  categoryRecipe: string;
  descriptionRecipe: string;
  stepsRecipe: string;
  imageRecipe?: File | null;
  ingredients: IngredientInput[];
}
