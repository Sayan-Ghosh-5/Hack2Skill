import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MacroTracker } from './components/dashboard/MacroTracker';
import { MealGrid } from './components/meals/MealGrid';
import { VideoCarousel } from './components/education/VideoCarousel';
import { OnboardingModal } from './components/shared/OnboardingModal';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';

// Home page assembled from dashboard sections
function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OnboardingModal />
      <main className="flex-1">
        <MacroTracker />
        <MealGrid />
        <VideoCarousel />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
