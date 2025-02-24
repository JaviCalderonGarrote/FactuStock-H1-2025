import { Routes, Route } from "react-router-dom";  // Asegúrate de importar Routes y Route
import Login from "./pages/login"; // Asegúrate de que las rutas sean correctas
import Home from "./pages/Home";
import './assets/styles.css'  // Asegúrate de importar el CSS aquí

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
};

export default App;
