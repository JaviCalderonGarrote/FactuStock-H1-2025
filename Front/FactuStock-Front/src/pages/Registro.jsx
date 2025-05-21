import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Swal from "sweetalert2";

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
            logo: "",
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
            Swal.fire("Error", "Por favor completa todos los campos obligatorios del usuario.", "error");
            return false;
        }
        if (password !== confirmPassword) {
            Swal.fire("Error", "Las contraseñas no coinciden.", "error");
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
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validarOrganizacion()) {
            Swal.fire("Error", "Por favor completa todos los campos obligatorios de la organización.", "error");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            ...formData,
            rol: "Administrador",
        };

        try {
            await authService.register(payload);
            Swal.fire("Éxito", "Registro exitoso. Redirigiendo al inicio de sesión...", "success");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            let errorMsg = "Error al registrar. Verifica los datos e intenta nuevamente.";

            const backendMessage = err?.response?.data?.message;
            if (backendMessage && typeof backendMessage === "string") {
                errorMsg = backendMessage;
            }

            Swal.fire("Error", errorMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: "600px" }}>
                <div className="text-center mb-4">
                    <img src="/LOGO-Letras.png" alt="Logo de la aplicación" style={{ width: "100px", height: "auto" }} />
                </div>

                <h3 className="text-center mb-4">
                    {step === 1 ? "Registro de Usuario" : "Registro de Organización"}
                </h3>

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
                            <InputField label="Logo URL" name="organizacion.logo" value={formData.organizacion.logo} onChange={handleChange} />
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
