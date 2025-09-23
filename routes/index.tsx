import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
const MainRoutes: RouteObject[] = [
    {
        path: "/",
        element: (
            <Navigate to="/welcome" replace />
        )
    }
]
const router = createBrowserRouter([
  ...MainRoutes,
  {
    errorElement: <>erorr</>,
  },
]);