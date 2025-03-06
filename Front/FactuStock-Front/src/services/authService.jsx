const API_URL = "http://localhost:8080/auth"; // Cambia según la URL de tu backend

// Función para hacer login
const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    // Verifica si la respuesta es exitosa (status 200)
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText || "Credenciales inválidas"}`);
    }

    const data = await response.json();

    // Verifica si el token está presente
    if (!data.token) {
      throw new Error("Token no recibido");
    }

    const token = data.token;

    // Guardamos el token y el username en localStorage
    localStorage.setItem("authToken", token);
    localStorage.setItem("username", username); // Guardamos el username

    return token;
  } catch (error) {
    console.error("Error al hacer login:", error.message);
    throw error; // Rethrow the error to be handled in the UI
  }
};

// Verificar si el usuario está autenticado
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return token && token !== "";
};

// Función de logout
const logout = () => {
  // Limpiar el token y el username de localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
};

// Obtener el token del localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Utiliza el token para realizar una solicitud con autenticación (como un ejemplo)
const getAuthenticatedData = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const response = await fetch(`${API_URL}/protected-resource`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener datos protegidos: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener datos autenticados:", error.message);
    throw error;
  }
};

export default {
  login,
  isAuthenticated,
  logout,
  getAuthenticatedData,
};
