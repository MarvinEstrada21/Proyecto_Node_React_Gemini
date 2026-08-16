import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RecipeFormPage } from './pages/RecipeFormPage';
import { MyRecipesPage } from './pages/MyRecipesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route path="/recipes/new" element={<RecipeFormPage />} />
            <Route path="/recipes/edit/:id" element={<RecipeFormPage />} />
            <Route path="/my-recipes" element={<MyRecipesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
