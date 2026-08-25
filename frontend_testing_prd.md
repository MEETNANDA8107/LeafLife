# Product Requirements Document: AgriSathi Frontend Testing

## 1. Objective
The goal of this initiative is to establish a robust, maintainable, and comprehensive frontend testing suite for the **AgriSathi** application. Since the application relies heavily on client-side state (React Context, `localStorage`) and complex client-side algorithms (KNN recommendation, linear regression, rule-based engines), ensuring high reliability of the frontend is critical.

## 2. Scope of Testing
**In Scope:**
*   **Unit Tests:** Pure functions (services, utilities, calculation engines), custom hooks, and isolated UI components.
*   **Integration Tests:** Component interactions, Context providers (Auth, User), routing, and page-level data fetching/rendering.
*   **End-to-End (E2E) Tests:** Critical user journeys (Signup, Login, Dashboard interactions, Navigation).

**Out of Scope:**
*   Backend testing (since AgriSathi is currently a local-first SPA without a custom backend).
*   Load/Stress testing (not applicable for client-side execution).

---

## 3. Recommended Tech Stack
Given the project is built with **Vite + React 19**, the following testing stack is recommended for optimal speed and compatibility:

*   **Test Runner & Unit/Integration:** [Vitest](https://vitest.dev/) (Native Vite integration, fast, Jest-compatible API).
*   **Component Testing:** [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/) (Tests components from a user's perspective).
*   **E2E Testing:** [Playwright](https://playwright.dev/) or [Cypress](https://www.cypress.io/) (For testing full workflows in actual browsers).
*   **Mocking:** `msw` (Mock Service Worker) to intercept Open-Meteo API requests, or native `vi.mock` for intercepting local `fetch` of JSON datasets.

---

## 4. Testing Strategy & Layers

### 4.1. Unit Testing (Services & Logic)
The core intelligence of AgriSathi lives in its services. These must be rigorously tested with various inputs.

*   **`cropRecommender.js`**: 
    *   Test the KNN algorithm with expected NPK/Weather values to ensure it returns the correct crop.
    *   Test edge cases (missing data, extreme weather values).
*   **`irrigationEngine.js`**: 
    *   Verify calculation formulas (e.g., if it rains 10mm, irrigation duration should decrease).
    *   Test different soil types (Sandy vs. Clayey water retention rules).
*   **`pricePrediction.js`**: 
    *   Test linear regression outputs against known historical arrays to verify trend ('up', 'down', 'stable') and % changes.
*   **`chatbot.js`**: 
    *   Test intent detection by passing specific string inputs ("predict wheat price", "do I need to water?") and asserting the correct service is invoked.

### 4.2. Integration Testing (Pages & Context)
Ensure that pages correctly render data fetched from services and respond to Context changes.

*   **Auth Flow**: 
    *   Render the `<AuthProvider>` and test the `login` function. Assert that `localStorage` is updated and `isAuthenticated` becomes true.
*   **Dashboard Page**: 
    *   Mock the `getCurrentWeather` and `loadData` responses.
    *   Assert that the Weather Card displays the mocked temperature.
    *   Assert that Loading Skeletons appear initially, and Error States appear if the mock rejects.
*   **Protected Routes**: 
    *   Attempt to access `/dashboard` without an active session and assert redirection to `/login`.

### 4.3. End-to-End (E2E) Testing (Critical User Journeys)
Automate a real browser to step through the application just like a user would.

*   **Scenario 1: Onboarding Workflow**
    1. Navigate to `/signup`.
    2. Fill out Step 1 (Basic Info) -> Click Next.
    3. Fill out Location -> Click Next.
    4. Fill out Farm details -> Select "Loamy", "Sprinkler".
    5. Complete signup -> Verify redirection to `/login`.
*   **Scenario 2: Login to Dashboard**
    1. Navigate to `/login`.
    2. Enter valid email and password.
    3. Assert redirection to `/` (Dashboard).
    4. Assert greeting includes the user's name.
*   **Scenario 3: Interacting with the Assistant**
    1. Click the floating Chat icon.
    2. Type "what is the weather?" and hit send.
    3. Assert that a bot response bubble appears in the chat window.

---

## 5. Success Metrics & Quality Gates

*   **Test Coverage**: Achieve minimum **80%** code coverage for `src/services/` (business logic) and **70%** overall coverage.
*   **CI/CD Integration**: Run `vitest run` on every Git push or Pull Request (e.g., via GitHub Actions).
*   **Zero Critical Path Failures**: E2E tests for Login, Signup, and Dashboard must pass 100% of the time before any deployment.

## 6. Next Implementation Steps
If approved, the engineering tasks to execute this PRD would be:
1. Initialize Vitest and React Testing Library in the Vite project.
2. Configure `vite.config.js` with test environment (`jsdom`).
3. Write the first unit test suite for `src/services/irrigationEngine.js` as a proof-of-concept.
4. Set up Playwright for the E2E Signup/Login flow.
