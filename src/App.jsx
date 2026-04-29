
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { PiPProvider } from "./contexts/PiPContext";
import PersistentPlayer from "./components/PersistentPlayer/PersistentPlayer";

function App() {
  return (
    <PiPProvider>
      {/* PersistentPlayer nằm ngoài router → không bao giờ unmount theo route */}
      <PersistentPlayer />
      <AppRoutes />
    </PiPProvider>
  );
}

export default App;
