import { RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import { router } from "@/app/router";
import { BootErrorState } from "@/components/common/BootErrorState";
import { getAppEnv } from "@/lib/env";

function App() {
  try {
    getAppEnv();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown environment configuration error.";

    return (
      <BootErrorState
        title="Invalid frontend environment"
        message="The dashboard could not start because required environment variables are missing or invalid."
        details={message}
      />
    );
  }

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
