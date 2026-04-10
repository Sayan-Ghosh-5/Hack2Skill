# MacroPlate Implementation Plan

This document outlines the systematic approach for building the MVP of MacroPlate, a performance nutrition delivery platform.

## Goal Description
Develop a production-ready Web App for MacroPlate focused on visually rich, data-heavy but clean UI with high-contrast theming, macro-precision meal customization, and educational content. The stack is React 18+, TypeScript, Tailwind CSS, Lucide React, and Framer Motion.

> [!IMPORTANT]
> **User Review Required**
> Please review the chosen dependencies and the phase breakdown. We will proceed to auto-scaffold using Vite if approved. Since this is an MVP without an actual backend, we rely entirely on `localStorage` for state persistence and use simulated initial delays where appropriate. Do you approve of using Vite as a bundler? Are there any additional specific requirements for the `framer-motion` implementation?

## Proposed Changes

We will build the MVP systematically through the following phases.

---

### Phase 1: Project Initialization & Foundation
- Scaffold a new project using Vite with React and TypeScript (`npx create-vite . --template react-ts`)
- Install critical dependencies: `tailwindcss`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`
- Setup custom Tailwind configuration (`tailwind.config.js`) integrating the dark-mode typography and exact color palettes specified.
- Introduce base CSS in `src/index.css`.

#### [NEW] `tailwind.config.js`
#### [MODIFY] `src/index.css`
#### [NEW] `src/utils/macroCalculator.ts`
#### [NEW] `src/utils/localStorage.ts`
#### [NEW] `src/data/meals.json`
#### [NEW] `src/data/videos.json`

---

### Phase 2: State Management & Persistence
Develop Context providers relying heavily on `localStorage` custom hooks to maintain persistence across sessions.
#### [NEW] `src/contexts/UserContext.tsx`
#### [NEW] `src/contexts/CartContext.tsx`
#### [NEW] `src/hooks/useLocalStorage.ts`

---

### Phase 3: Core Layout & Navigation
Construct sticky navigation, mobile hamburger layout, streak indicator, and cart count badges.
#### [NEW] `src/components/layout/Header.tsx`
#### [NEW] `src/components/layout/Footer.tsx`

---

### Phase 4: Macro Tracker Dashboard
The hero section to visualize the core value proposition.
#### [NEW] `src/components/dashboard/MacroTracker.tsx`
#### [NEW] `src/components/dashboard/GoalSelector.tsx`
#### [NEW] `src/components/dashboard/ProgressRings.tsx` 
Will leverage `framer-motion` for smooth initial loading and SVG circles for the rings.

---

### Phase 5: Menu & Meal Customization
The core domain interface for adding meals, adjusting portions, and seeing price/macro shifts in real-time.
#### [NEW] `src/components/meals/MealGrid.tsx`
#### [NEW] `src/components/meals/MealCard.tsx`
Will manage local active states (portion size, extra protein) and perform mathematical calculations using base data.

---

### Phase 6: Education Hub
Display horizontal scrollable rows of educational content using provided static data.
#### [NEW] `src/components/education/VideoCarousel.tsx`
#### [NEW] `src/components/education/VideoThumbnail.tsx`

---

### Phase 7: Application Assembly & Flow
Tie the components together within `App.tsx` and implement the first-time onboarding modal logic.
#### [MODIFY] `src/App.tsx`
#### [NEW] `src/components/shared/OnboardingModal.tsx`

## Verification Plan

### Manual Verification
1. **Responsiveness Checks:** Launch the app locally and test rendering on simulated mobile (320px), tablet (768px), and desktop (1440px) sizes.
2. **First-Time User Flow:** Verify onboarding calcuation correctness on a clean `localStorage` session.
3. **Progress Tracking Math:** Ensure adding a customized meal dynamically bumps the daily progress rings and cart total by exactly the mathematically predicted amount.
4. **Data Persistence:** Ensure refreshing the page retains cart items, selected preferences, and streak data.
