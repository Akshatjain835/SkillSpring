import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes/appRoutes";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  const router = createBrowserRouter(appRoutes);

  return (
    <main>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </main>
  );
}

export default App;
