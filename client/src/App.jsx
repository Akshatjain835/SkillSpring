import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { appRoutes } from "./routes/appRoutes";

function App() {
  const router = createBrowserRouter(appRoutes);

  return (
    <main>
      <RouterProvider router={router} />
    </main>
  );
}

export default App;
