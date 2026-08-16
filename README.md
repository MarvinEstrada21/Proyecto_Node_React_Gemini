# Recetario Gourmet - Aplicación Web Full-Stack

Aplicación web completa para un recetario en línea construida con **Node.js + Express** en el Backend y **React + TypeScript + Vite** en el Frontend, conectada a una base de datos **MySQL** preexistente.

---

## 1. Esquema Transcrito de la Base de Datos (`diagramaBD.png`)

### Tabla: `TB_Users`
- `username`: `VARCHAR(100)` **PRIMARY KEY** (No nulo)
- `nameUser`: `VARCHAR(100)` (No nulo)
- `lastnameUser`: `VARCHAR(100)` (No nulo)
- `passwordUser`: `VARCHAR(255)` (No nulo, hash seguro bcrypt)
- `imageUser`: `VARCHAR(500)` (Opcional / Nullable)
- `roleUser`: `VARCHAR(100)` (No nulo, 'user' | 'admin', por defecto 'user')
- `createdIn`: `TIMESTAMP` (DEFAULT `CURRENT_TIMESTAMP`, No nulo)

### Tabla: `TB_Recipes`
- `idRecipe`: `INT` **PRIMARY KEY** `AUTO_INCREMENT`
- `nameRecipe`: `VARCHAR(200)` (No nulo)
- `categoryRecipe`: `VARCHAR(100)` (No nulo)
- `descriptionRecipe`: `VARCHAR(500)` (No nulo)
- `stepsRecipe`: `VARCHAR(500)` (No nulo)
- `imageRecipe`: `VARCHAR(500)` (Opcional / Nullable)
- `usernameAuthor`: `VARCHAR(100)` **FOREIGN KEY** -> `TB_Users(username)` (ON DELETE RESTRICT ON UPDATE CASCADE)
- `createdIn`: `TIMESTAMP` (DEFAULT `CURRENT_TIMESTAMP`, No nulo)

### Tabla: `TB_Ingredients`
- `idIngredient`: `INT` **PRIMARY KEY** `AUTO_INCREMENT`
- `idRecipe`: `INT` **FOREIGN KEY** -> `TB_Recipes(idRecipe)` (ON DELETE CASCADE ON UPDATE CASCADE)
- `nameIngredient`: `VARCHAR(255)` (No nulo)
- `quantityIngredient`: `VARCHAR(100)` (No nulo)
- `orderIngredient`: `INT` (Opcional / Nullable)

### Tabla: `TB_Comments`
- `idComment`: `INT` **PRIMARY KEY** `AUTO_INCREMENT`
- `idRecipe`: `INT` **FOREIGN KEY** -> `TB_Recipes(idRecipe)` (ON DELETE CASCADE ON UPDATE CASCADE)
- `bodyComment`: `VARCHAR(500)` (No nulo)
- `usernameComment`: `VARCHAR(100)` **FOREIGN KEY** -> `TB_Users(username)` (ON DELETE RESTRICT ON UPDATE CASCADE)
- `createdIn`: `TIMESTAMP` (DEFAULT `CURRENT_TIMESTAMP`, No nulo)

### Supuestos Documentados:
- En `TB_Recipes`, el campo `descriptionRecipe` se muestra como `varchar(5...)` en el diagrama; se asume `VARCHAR(500)` para mantener consistencia con `stepsRecipe` y `bodyComment`.
- En `TB_Ingredients`, el campo `quantityIngredient` se muestra como `varchar(1...?)`; se asume `VARCHAR(100)` no nulo.
- En `TB_Users`, los roles soportados son `'user'` (usuario estándar) y `'admin'` (administrador con privilegios globales).

---

## 2. Comandos para Instalar y Levantar

### Backend
```bash
cd backend
npm install
npm run dev
# Servidor Express activo en: http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Aplicación Vite React activa en: http://localhost:5173
```

---

## 3. Características de Seguridad y Validaciones Implementadas

1. **Hashing de Contraseñas:** Algoritmo lento bcrypt con salt factor de 12 rondas.
2. **Rate Limiting:** Control de peticiones por dirección IP y bloqueo temporal por cuenta ante múltiples intentos fallidos en login.
3. **Mensajes de Error Genéricos:** "Credenciales inválidas" para evitar enumeración de usuarios.
4. **Protección de Datos Sensibles:** `passwordUser` nunca es retornado en respuestas HTTP.
5. **Autorización Servidor:** Comprobación estricta de autor o administrador antes de modificar o eliminar recetas y comentarios.
6. **Consultas Parametrizadas:** 100% de consultas SQL utilizan placeholders parametrizados `?` protegiendo contra SQL Injection.
7. **CORS Estricto:** Permitido únicamente para el origen del frontend (`http://localhost:5173`).
8. **Subida Segura de Archivos:** Validación de tipo MIME real (`image/jpeg`, `image/png`, `image/webp`), tamaño máximo 2MB, y almacenamiento con nombres criptográficos aleatorios en `uploads/`.
9. **Validación de Ingredientes:** Mínimo 1 ingrediente por receta y detección en tiempo real de nombres duplicados dentro de la misma receta.
10. **Preservación de Formularios:** Si un username ya existe al registrarse, se rechaza sin borrar el resto de datos ingresados en el formulario.
