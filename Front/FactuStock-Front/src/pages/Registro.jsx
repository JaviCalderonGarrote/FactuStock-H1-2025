import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

// Patrón IBAN básico (puedes ajustarlo según país)
const IBAN_PATTERN = "^[A-Z]{2}\\d{2}[A-Z0-9]{1,30}$";

const InputField = ({ label, name, value, onChange, required = false, type = "text", pattern, title }) => (
    <div className="mb-3">
        <label htmlFor={name} className="form-label" style={{ color: "#6f9fd7" }}>
            {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
            id={name}
            type={type}
            name={name}
            className="form-control"
            value={value}
            onChange={onChange}
            required={required}
            style={{ borderRadius: "8px", borderColor: "#a7c5eb" }}
            pattern={pattern}
            title={title}
            autoComplete="off"
        />
    </div>
);

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    type: PropTypes.string,
    pattern: PropTypes.string,
    title: PropTypes.string,
};

const Registro = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
        nombre: "",
        apellido: "",
        mail: "",
        rol: "Administrador",
        organizacion: {
            nombre: "",
            direccion: "",
            telefono: "",
            nifCif: "",
            email: "",
            web: "",
            IBAN: "",
        },
    });

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("organizacion.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                organizacion: { ...prev.organizacion, [field]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Contraseña: 8+ caracteres, mayúscula, minúscula, número y especial
    const validarContraseña = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(password);
    };

    // URL simple (http(s)://...)
    const validarWeb = (web) => {
        if (!web) return true;
        const regex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;
        return regex.test(web);
    };

    // IBAN básico
    const validarIBAN = (iban) => {
        if (!iban) return true;
        const regex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;
        return regex.test(iban);
    };

    const validarUsuario = async () => {
        const { username, nombre, apellido, mail, password, confirmPassword } = formData;

        if (!username || !nombre || !apellido || !mail || !password || !confirmPassword) {
            await Swal.fire({
                title: "Campos incompletos",
                text: "Por favor, completa todos los campos obligatorios.",
                icon: "warning",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#3085d6"
            });
            return false;
        }

        if (password !== confirmPassword) {
            await Swal.fire({
                title: "Contraseñas no coinciden",
                text: "Las contraseñas ingresadas no coinciden.",
                icon: "warning",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#3085d6"
            });
            return false;
        }

        if (!validarContraseña(password)) {
            await Swal.fire({
                title: "Contraseña inválida",
                text: "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.",
                icon: "warning",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#3085d6"
            });
            return false;
        }

        try {
            const usernameExists = await authService.checkUsernameExists(username);
            if (usernameExists) {
                await Swal.fire({
                    title: "Usuario no válido",
                    text: "El nombre de usuario ya está en uso. Por favor, cambia el usuario.",
                    icon: "warning",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#3085d6"
                });
                return false;
            }

            const emailExists = await authService.checkEmailExists(mail);
            if (emailExists) {
                await Swal.fire({
                    title: "Correo no válido",
                    text: "El correo electrónico ya está en uso. Por favor, cambia el correo.",
                    icon: "warning",
                    confirmButtonText: "Entendido",
                    confirmButtonColor: "#3085d6"
                });
                return false;
            }
        } catch (error) {
            console.error("Error al verificar usuario/email:", error);
            await Swal.fire({
                title: "Error de conexión",
                text: "Error al verificar la información. Por favor, intenta de nuevo.",
                icon: "error",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#d33"
            });
            return false;
        }

        return true;
    };

    const validarOrganizacion = async () => {
        const { nombre, direccion, telefono, nifCif, email, web, IBAN } = formData.organizacion;
        if (!nombre || !direccion || !telefono || !nifCif || !email) {
            await Swal.fire({
                title: "Datos incompletos",
                text: "Por favor completa todos los campos obligatorios de la organización.",
                icon: "warning",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#3085d6"
            });
            return false;
        }
        if (web && !validarWeb(web)) {
            await Swal.fire({
                title: "Sitio web inválido",
                text: "Introduce una URL válida (ejemplo: https://www.ejemplo.com).",
                icon: "warning",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#3085d6"
            });
            return false;
        }
        if (IBAN && !validarIBAN(IBAN)) {
            await Swal.fire({
                title: "IBAN inválido",
                text: "Introduce un IBAN válido (ejemplo: ES9121000418450200051332).",
                icon: "warning",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#3085d6"
            });
            return false;
        }
        return true;
    };

    const handleContinue = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const isValid = await validarUsuario();
        setIsSubmitting(false);
        if (isValid) setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const orgValid = await validarOrganizacion();
        if (!orgValid) {
            setIsSubmitting(false);
            return;
        }

        try {
            await authService.register({ ...formData, rol: "Administrador" });
            await Swal.fire({
                title: "¡Registro exitoso!",
                text: "Tu cuenta ha sido creada correctamente. Serás redirigido al inicio de sesión.",
                icon: "success",
                confirmButtonText: "Continuar",
                confirmButtonColor: "#28a745"
            });
            navigate("/");
        } catch (err) {
            const errorMsg = err?.response?.data?.message || "Error al registrar. Verifica los datos e intenta nuevamente.";
            await Swal.fire({
                title: "Error en el registro",
                text: errorMsg,
                icon: "error",
                confirmButtonText: "Entendido",
                confirmButtonColor: "#d33"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
            <div className="card p-4 shadow" style={{ width: "50rem", borderRadius: "15px" }}>
                <div className="text-center mb-3">
                    <img src="/LOGO-Letras.png" alt="Logo" style={{ height: "100px" }} />
                </div>

                <h3 className="text-center mb-4" style={{ color: "#2c3e50", borderBottom: "2px solid #a7c5eb", paddingBottom: "10px" }}>
                    {step === 1 ? "Registro de Usuario" : "Registro de Organización"}
                </h3>

                <form onSubmit={step === 1 ? handleContinue : handleSubmit} data-testid="registro-form">
                    <div className="row">
                        {step === 1 ? (
                            <>
                                <div className="col-md-6">
                                    <InputField label="Username" name="username" value={formData.username} onChange={handleChange} required />
                                    <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                                    <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <InputField label="Correo electrónico" name="mail" type="email" value={formData.mail} onChange={handleChange} required />
                                    <InputField
                                        label="Contraseña"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                                        title="Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
                                    />
                                    <InputField
                                        label="Confirmar Contraseña"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$"
                                        title="Debe coincidir con la contraseña"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="col-md-6">
                                    <InputField label="Nombre de la organización" name="organizacion.nombre" value={formData.organizacion.nombre} onChange={handleChange} required />
                                    <InputField label="Dirección" name="organizacion.direccion" value={formData.organizacion.direccion} onChange={handleChange} required />
                                    <InputField label="Teléfono" name="organizacion.telefono" value={formData.organizacion.telefono} onChange={handleChange} required />
                                    <InputField label="NIF/CIF" name="organizacion.nifCif" value={formData.organizacion.nifCif} onChange={handleChange} required />
                                </div>
                                <div className="col-md-6">
                                    <InputField label="Email" name="organizacion.email" type="email" value={formData.organizacion.email} onChange={handleChange} required />
                                    <InputField
                                        label="Sitio Web"
                                        name="organizacion.web"
                                        value={formData.organizacion.web}
                                        onChange={handleChange}
                                        type="url"
                                        pattern="^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$"
                                        title="Introduce una URL válida (ejemplo: https://www.ejemplo.com)"
                                    />
                                    <InputField
                                        label="IBAN"
                                        name="organizacion.IBAN"
                                        value={formData.organizacion.IBAN}
                                        onChange={handleChange}
                                        required={false}
                                        type="text"
                                        pattern={IBAN_PATTERN}
                                        title="Introduce un IBAN válido (ejemplo: ES9121000418450200051332)"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        {step === 2 && (
                            <button
                                type="button"
                                className="btn flex-fill"
                                onClick={() => setStep(1)}
                                disabled={isSubmitting}
                                style={{ backgroundColor: "#a7c5eb", color: "#fff", borderRadius: "8px" }}
                            >
                                Volver
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn flex-fill"
                            style={{ backgroundColor: "#6f9fd7", color: "#fff", borderRadius: "8px" }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Procesando..." : (step === 1 ? "Continuar" : "Registrarse")}
                        </button>
                    </div>
                </form>
                <button
                    type="button"
                    className="btn btn-link mt-3"
                    onClick={() => navigate("/")}
                    style={{ color: "#6f9fd7" }}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
};

export default Registro;