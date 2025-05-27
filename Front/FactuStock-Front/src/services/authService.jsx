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

// ✅ NUEVA: Verificar si un username ya existe
const checkUsernameExists = async (username) => {
  try {
    const response = await fetch(`${API_URL}/check-username?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Error al verificar username: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Devuelve true/false
  } catch (error) {
    console.error("Error al verificar username:", error.message);
    throw error;
  }
};

// ✅ NUEVA: Verificar si un email ya existe
const checkEmailExists = async (email) => {
  try {
    const response = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Error al verificar email: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Devuelve true/false
  } catch (error) {
    console.error("Error al verificar email:", error.message);
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

// Decodificar el token JWT (sin verificación)
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};

// Obtener información del usuario actual del token
const getCurrentUser = () => {
  const token = localStorage.getItem("authToken");
  if (token) {
    return decodeToken(token);
  }
  return null;
};

// Exportamos todas las funciones
export default {
  login,
  register,
  checkUsernameExists,
  checkEmailExists,
  isAuthenticated,
  logout,
  getAuthenticatedData,
  sendPasswordResetEmail,
  getAuthToken,
  decodeToken,
  getCurrentUser,
};