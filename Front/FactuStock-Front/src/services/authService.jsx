const API_URL = "http://localhost:8080/auth"; // URL para login y register
const USUARIOS_API_URL = "http://localhost:8080/usuarios"; // URL para forgot-password

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

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText || "Credenciales inválidas"}`);
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error("Token no recibido");
    }

    const token = data.token;

    // Guardamos el token y el username en localStorage
    localStorage.setItem("authToken", token);
    localStorage.setItem("username", username);

    return token;
  } catch (error) {
    console.error("Error al hacer login:", error.message);
    throw error;
  }
};

// ✅ Función para enviar email de recuperación de contraseña
const sendPasswordResetEmail = async (usernameOrEmail) => {
  try {
    const response = await fetch(`${USUARIOS_API_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usernameOrEmail }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(responseText || "No se pudo enviar el correo de recuperación");
    }

    return responseText;
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error.message);
    throw error;
  }
};

// ✅ NUEVA: Función para registrar usuario con organización
const register = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Error al registrar el usuario");
    }

    const data = await response.json();

    // Puedes guardar el token si quieres loguear automáticamente
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", formData.username);
    }

    return data;
  } catch (error) {
    console.error("Error al registrar:", error.message);
    throw error;
  }
};

// Verificar si el usuario está autenticado
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return token && token !== "";
};

// Función de logout
const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
};

// Obtener el token del localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Obtener datos protegidos con el token
const getAuthenticatedData = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const response = await fetch(`${API_URL}/protected-resource`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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

// Exportamos todas las funciones
export default {
  login,
  register, // ✅ ya incluida aquí
  isAuthenticated,
  logout,
  getAuthenticatedData,
  sendPasswordResetEmail,
};
