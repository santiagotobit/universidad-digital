import { AppRoutes } from "./routes/AppRoutes";
import { ToastContainer } from "./components/ToastContainer";
import { Navbar } from "./components/Navbar";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="layout-main">
      {isAuthenticated && <Navbar />}
      <AppRoutes />
      <ToastContainer />
    </div>
  );
}
