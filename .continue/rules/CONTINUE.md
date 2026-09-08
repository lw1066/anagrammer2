# Project Guide: The Ana-gram-miser (anagrammer2)

---

## 1. Project Overview

### Purpose

**The Ana-gram-miser** is a feature-rich, interactive React application designed to help users solve anagrams, visualize letter combinations, check word definitions against dictionaries, and find valid anagram words (including support for wildcards/blank tiles).

### Key Technologies

- **Core Framework:** React 19 (`react`, `react-dom`) with TypeScript.
- **Build Tool & Bundler:** Vite (`vite`, `@vitejs/plugin-react`).
- **Styling:** Tailwind CSS (`tailwindcss`, `@tailwindcss/vite`).
- **Data Fetching & Caching:** SWR (`swr`).
- **Accessibility & UI Utilities:** `focus-trap-react`, `react-helmet-async`.
- **Testing:** Jest (`jest`, `ts-jest`, `jest-environment-jsdom`), Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`).
- **Code Quality:** ESLint (`eslint`, `typescript-eslint`).

### High-level Architecture

The application follows a modular, component-driven React architecture:

- **`src/App.tsx`**: Main entry component managing global state (tracked letters, anagram states, dictionary lookups, cheat mode parameters, and error modals).
- **`src/components/`**: Interactive UI components responsible for distinct steps of the user journey (inputting anagram letters, visual rearranging, final anagram display, dictionary lookup, cheat mode with infinite scrolling).
- **`src/services/`**: Helper modules (`CheatLookUpHelper.ts`, `GetDefinitionHelper.ts`) handling external API calls to Datamuse and dictionary services, wrapped securely with SWR and Vite proxy configuration.
- **`src/ui/`**: Reusable primitive components (e.g., custom buttons with proper accessibility and prop spreading).

---

## 2. Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn or pnpm

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd anagrammer2
npm install
```

### Running the Development Server

Start the local Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser at `http://localhost:5173`. (Note: Vite proxy is configured to route `/dictionary-api` requests cleanly to avoid CORS issues).

### Building for Production

To type-check (`tsc -b`) and bundle the production build:

```bash
npm run build
```

### Running Tests

Execute the Jest test suite:

```bash
npm run test
```

To run tests in watch mode or specific files, you can invoke Jest via `npx jest`.

---

## 3. Project Structure

```text
anagrammer2/
├── .continue/
│   └── rules/
│       └── CONTINUE.md       # Project guide and instructions for Continue
├── __mocks__/                # Jest mocks for static assets (e.g. fileMock.js)
├── public/                   # Static assets (icons.svg, etc.)
├── src/
│   ├── assets/               # Images and logo files
│   ├── components/           # Feature components
│   │   ├── AnagramDisplay.tsx
│   │   ├── AnagrammerInput.tsx
│   │   ├── CheatDataInfiniteScroll.tsx
│   │   ├── DictionaryCheck.tsx
│   │   ├── DictionaryDisplay.tsx
│   │   ├── DictionaryItem.tsx
│   │   ├── ErrorModal.tsx
│   │   ├── FinalAnagram.tsx
│   │   └── __tests__/        # Component tests
│   ├── services/             # API helpers & business logic
│   │   ├── CheatLookUpHelper.ts
│   │   └── GetDefinitionHelper.ts
│   ├── ui/                   # Reusable primitive UI elements (e.g. Button.tsx)
│   ├── App.tsx               # Root component & state orchestration
│   ├── App.test.tsx          # Root/Integration tests
│   ├── images.d.ts           # TypeScript declarations for image imports
└──   └── main.tsx              # React DOM mounting entry point
```

### Key Configuration Files

- `vite.config.ts`: Vite setup including React plugin, Tailwind CSS v4 plugin, and `/dictionary-api` proxy rules.
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`: TypeScript configurations.
- `jest.config.cjs` & `tsconfig.jest.json`: Jest test runner setup for TypeScript and JSDOM.
- `eslint.config.js`: Modern flat-config ESLint rules.

---

## 4. Development Workflow

### Coding Standards & Conventions

- **React 19 & Functional Components:** Write clean functional React components using hooks (`useState`, `useEffect`, `useCallback`).
- **TypeScript Strictness:** Maintain strong typing for props, state, and API response models. Avoid `any` where possible.
- **Tailwind CSS:** Utilize Tailwind utility classes for responsive design following existing project styling patterns.
- **Accessible UI Wrappers:** Custom UI components (buttons, inputs) must correctly forward rest props (`...rest`) to native elements so attributes like `data-testid`, `aria-*`, and `id` are preserved. Form inputs must have proper label associations (`htmlFor` or wrapping).

### Testing Approach

- Use **React Testing Library** and **Jest**.
- Follow accessible query priorities (`getByRole`, `getByLabelText` over `getByTestId` where applicable).
- Mock async data fetching (SWR, fetch, API helper services) in unit/integration tests rather than performing live network requests.

### Linting & Type Checking

Before committing code, ensure no lint or type errors exist:

```bash
npm run lint
npm run build
```

---

## 5. Key Concepts & Architecture

- **Tracked Letters (`TrackedLetter`):** Represents each individual letter in the pool, tracked by ID, character value, and whether it has been used (`isUsed`).
- **Wildcard Support (`?`):** Users can input wildcard characters representing unknown letters up to a defined limit (max 10), which are then resolved during anagram searching/cheating.
- **SWR Caching & Data Fetching:** Datamuse and dictionary requests are handled asynchronously via SWR hooks (`useDictSearch`, `useCheatSearch`), preventing redundant network requests and handling loading/error states gracefully.

---

## 6. Common Tasks

### Adding a New Component

1. Create your component in `src/components/YourComponent.tsx` (or `src/ui/` if primitive).
2. Ensure proper TypeScript props interface definitions.
3. Add a corresponding test file under `src/components/__tests__/YourComponent.test.tsx`.
4. Import and wire it into `src/App.tsx` or parent container as needed.

### Adding or Modifying API Services

1. Place helper logic inside `src/services/`.
2. Ensure error handling callbacks (`handleError`) are properly accepted and invoked.
3. Test service functions with mocked fetch/axios responses in Jest.

---

## 7. Troubleshooting

- **CORS Issues with External APIs:** Ensure `vite.config.ts` proxy rules are configured correctly for development endpoints (e.g. `/dictionary-api`).
- **Jest / TypeScript Resolution Issues:** Verify that `tsconfig.jest.json` and `jest.config.cjs` are correctly configured if adding new path aliases or transformer packages.

---

## 8. References & Documentation

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com)
- [SWR Documentation](https://swr.vercel.app)
- [Testing Library Documentation](https://testing-library.com)
