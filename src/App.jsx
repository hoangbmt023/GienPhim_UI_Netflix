
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { PiPProvider } from "./contexts/PiPContext";
import { AuthProvider } from "./contexts/AuthContext";
import PersistentPlayer from "./components/PersistentPlayer/PersistentPlayer";

function App() {
  return (
    <AuthProvider>
      <PiPProvider>
        {/* PersistentPlayer nằm ngoài router → không bao giờ unmount theo route */}
        <PersistentPlayer />
        <AppRoutes />
      </PiPProvider>
    </AuthProvider>
  );
}

export default App;
