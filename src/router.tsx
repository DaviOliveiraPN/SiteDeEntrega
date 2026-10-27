import { createBrowserRouter, Navigate } from "react-router";
import Access from "./pages/Access.tsx";
import ClientPage from "./pages/ClientPage.tsx";
import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";

// Admin screens are lazy-loaded so guests never download admin code.
export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/access", element: <Access /> },
  { path: "/p/:slug", element: <ClientPage /> },
  { path: "/admin/login", lazy: async () => ({ Component: (await import("./pages/admin/Login.tsx")).default }) },
  {
    // Sidebar layout; its children render in the <Outlet />.
    path: "/admin",
    lazy: async () => ({ Component: (await import("./pages/admin/AdminLayout.tsx")).default }),
    children: [
      { index: true, element: <Navigate to="entregas" replace /> },
      { path: "entregas", lazy: async () => ({ Component: (await import("./pages/admin/Deliveries.tsx")).default }) },
      { path: "entregas/nova", lazy: async () => ({ Component: (await import("./pages/admin/NewDelivery.tsx")).default }) },
      { path: "entregas/:id", lazy: async () => ({ Component: (await import("./pages/admin/DeliveryDetail.tsx")).default }) },
      { path: "site", lazy: async () => ({ Component: (await import("./pages/admin/SiteEdit.tsx")).default }) },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
