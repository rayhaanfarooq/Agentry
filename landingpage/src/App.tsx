import { HomePage } from "./pages/HomePage";
import { getLandingEnv } from "./lib/env";

function App() {
  try {
    getLandingEnv();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown environment configuration error.";

    return (
      <main className="boot-error">
        <div className="boot-error__panel">
          <p className="boot-error__eyebrow">Configuration Error</p>
          <h1>Invalid landing page environment</h1>
          <p>
            The marketing site could not start because required environment
            variables are missing or invalid.
          </p>
          <pre>{message}</pre>
        </div>
      </main>
    );
  }

  return <HomePage />;
}

export default App;
