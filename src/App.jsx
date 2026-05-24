import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { PiPProvider } from "./contexts/PiPContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAutoTheme } from "./hooks/useAutoTheme";
import PersistentPlayer from "./components/PersistentPlayer/PersistentPlayer";

/**
 * ThemeSync mount 1 lần ở root — gọi hook useAutoTheme để áp class
 * lên <body> theo themeMode từ context. Tách thành component riêng
 * để hook được đặt bên trong ThemeProvider.
 */
function ThemeSync() {
  useAutoTheme();
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <ThemeSync />
      <AuthProvider>
        <PiPProvider>
          {/* PersistentPlayer nằm ngoài router → không bao giờ unmount theo route */}
          <PersistentPlayer />
          <AppRoutes />
        </PiPProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
