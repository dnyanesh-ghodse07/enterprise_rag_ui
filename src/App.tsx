import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";

import DocumentsPage from "./pages/DocumentsPage";
import DocumentDetailPage from "./pages/DocumentDetailPage";
import CollectionDetailPage from "./pages/CollectionDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import AppLayout from "./layout/app-layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/chat/conversations" replace />
      },
      {
        path: "/chat",
        element: <ChatPage />,
      },
      {
        path: "/chat/conversations",
        element: <ChatPage />,
      },
      {
        path: "/chat/conversations/:id",
        element: <ChatPage />,
      },
      {
        path: "/documents",
        element: <DocumentsPage />,
      },
      {
        path: "/documents/collection/:id",
        element: <CollectionDetailPage />,
      },
      {
        path: "/documents/collections/:id",
        element: <CollectionDetailPage />,
      },
      {
        path: "/documents/:id",
        element: <DocumentDetailPage />,
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />
  },
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App;