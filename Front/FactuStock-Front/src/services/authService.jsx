const API_URL = "http://localhost:8080/auth"; // Cambia según la URL de tu backend

// Función para hacer login
const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Credenciales inválidas");
  }

  const data = await response.json();
  const token = data.token;

  // Guardamos el token y el username en localStorage
  localStorage.setItem("authToken", token);
  localStorage.setItem("username", username); // Guardamos el username

  return token;
};

// Verificar si el usuario está autenticado
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return token && token !== "";
};

// Función de logout
const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username"); // Limpiamos también el username
};

export default {
  login,
  isAuthenticated,
  logout,
};
