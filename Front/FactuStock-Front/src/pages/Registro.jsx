import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Registro = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "", // Nuevo campo
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
            logo: "",
            IBAN: ""
        },
    });

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("organizacion.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                organizacion: {
                    ...prev.organizacion,
                    [field]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const validarUsuario = () => {
        const { username, nombre, apellido, mail, password, confirmPassword } = formData;
        if (!(username.trim() && nombre.trim() && apellido.trim() && mail.trim() && password.trim() && confirmPassword.trim())) {
            setError("Por favor completa todos los campos obligatorios del usuario.");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return false;
        }
        return true;
    };

    const validarOrganizacion = () => {
        const org = formData.organizacion;
        return (
            org.nombre.trim() &&
            org.direccion.trim() &&
            org.telefono.trim() &&
            org.nifCif.trim() &&
            org.email.trim()
        );
    };

    const handleContinue = (e) => {
        e.preventDefault();
        if (!validarUsuario()) return;
        setError("");
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess("");

        if (!validarOrganizacion()) {
            setError("Por favor completa todos los campos obligatorios de la organización.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...formData,
            rol: "Administrador",
        };

        try {
            await authService.register(payload);
            setSuccess("Registro exitoso. Redirigiendo al inicio de sesión...");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            if (err.response?.data?.message?.includes("organización con ese nombre")) {
                setError("Ya existe una organización con ese nombre. Intenta con otro.");
            } else {
                setError("Error al registrar. Verifica los datos e intenta nuevamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: "600px" }}>
                {/* Logo de la aplicación (aquí puedes colocar tu logo) */}
                <div className="text-center mb-4">
                    <img src="/LOGO-Letras.png" alt="Logo de la aplicación" style={{ width: "100px", height: "auto" }} />
                </div>

                <h3 className="text-center mb-4">
                    {step === 1 ? "Registro de Usuario" : "Registro de Organización"}
                </h3>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={step === 1 ? handleContinue : handleSubmit}>
                    {step === 1 && (
                        <>
                            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} required />
                            <InputField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                            <InputField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
                            <InputField label="Correo electrónico" name="mail" type="email" value={formData.mail} onChange={handleChange} required />
                            <InputField label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} required />
                            <InputField label="Confirmar Contraseña" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />

                            <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                                Continuar
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <InputField label="Nombre de la organización" name="organizacion.nombre" value={formData.organizacion.nombre} onChange={handleChange} required />
                            <InputField label="Dirección" name="organizacion.direccion" value={formData.organizacion.direccion} onChange={handleChange} required />
                            <InputField label="Teléfono" name="organizacion.telefono" value={formData.organizacion.telefono} onChange={handleChange} required />
                            <InputField label="NIF/CIF" name="organizacion.nifCif" value={formData.organizacion.nifCif} onChange={handleChange} required />
                            <InputField label="Email" name="organizacion.email" type="email" value={formData.organizacion.email} onChange={handleChange} required />
                            <InputField label="Sitio Web" name="organizacion.web" value={formData.organizacion.web} onChange={handleChange} />

                            {/* Logo de la organización, solo si se ha ingresado una URL */}
                            {formData.organizacion.logo && (
                                <div className="text-center my-4">
                                    <img
                                        src={formData.organizacion.logo}
                                        alt="Logo de la organización"
                                        style={{ maxWidth: "150px", height: "auto" }}
                                    />
                                </div>
                            )}

                            <InputField label="IBAN" name="organizacion.IBAN" value={formData.organizacion.IBAN} onChange={handleChange} />

                            <button type="submit" className="btn btn-success w-100" disabled={isSubmitting}>
                                {isSubmitting ? "Registrando..." : "Registrarse"}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, required = false, type = "text" }) => (
    <div className="mb-2">
        <label className="form-label">{label}</label>
        <input
            type={type}
            name={name}
            className="form-control"
            value={value}
            onChange={onChange}
            required={required}
        />
    </div>
);

export default Registro;
