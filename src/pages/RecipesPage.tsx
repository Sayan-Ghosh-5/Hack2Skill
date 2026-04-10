import React, { useState, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RecipeFilters } from '../components/recipes/RecipeFilters';
import recipesData from '../data/recipes.json';
import { ChefHat, Search } from 'lucide-react';

const RecipesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    difficulty: '',
    mealType: '',
    maxPrepTime: '',
    sortBy: 'rating',
  });
  const [search, setSearch] = useState('');

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredRecipes = useMemo(() => {
    let recipes = [...(recipesData as any[])];

    if (search) {
      const q = search.toLowerCase();
      recipes = recipes.filter((r) =>
        r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      );
    }

    if (filters.difficulty) recipes = recipes.filter((r) => r.difficulty === filters.difficulty);
    if (filters.mealType) recipes = recipes.filter((r) => r.mealType === filters.mealType);
    if (filters.maxPrepTime) {
      recipes = recipes.filter((r) => r.timing.total <= parseInt(filters.maxPrepTime));
    }

    switch (filters.sortBy) {
      case 'saves': recipes.sort((a, b) => b.stats.saves - a.stats.saves); break;
      case 'views': recipes.sort((a, b) => b.stats.views - a.stats.views); break;
      default: recipes.sort((a, b) => b.stats.rating - a.stats.rating); break;
    }

    return recipes;
  }, [filters, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative">
        {/* Hero */}
        <section className="py-16 md:py-24 relative overflow-hidden border-b border-dark-elevated">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-48 bg-neon-green/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-dark-elevated rounded-xl border border-dark-surface">
                <ChefHat size={28} className="text-electric-blue" />
              </div>
              <span className="text-sm font-bold text-electric-blue uppercase tracking-widest">DIY Kitchen</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">
              Cook Your Own<br />
              <span className="text-neon-green">Macro-Perfect</span> Meals
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl font-medium mt-4">
              Master the kitchen and hit your goals from home. Every recipe is precision-engineered for optimal macros.
            </p>

            {/* Search */}
            <div className="mt-8 relative max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-dark-surface border border-dark-elevated rounded-xl text-white placeholder:text-text-muted focus:outline-none focus:border-electric-blue/50 transition-colors font-medium"
              />
            </div>
          </div>
        </section>

        {/* Grid + Filters */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecipeFilters filters={filters} onChange={updateFilter} />

          {filteredRecipes.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-white mb-2">No recipes found</h3>
              <p className="text-text-secondary">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-muted font-semibold mb-6">
                Showing <span className="text-white font-bold">{filteredRecipes.length}</span> recipe{filteredRecipes.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe as any} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default RecipesPage;
