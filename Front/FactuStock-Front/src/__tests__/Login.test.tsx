import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, vi, beforeEach, expect } from "vitest";
import Login from "../pages/Login";
import { BrowserRouter } from "react-router-dom";
import authService from "../services/authService";

vi.mock("../services/authService");

const mockAuthService = authService as vi.Mocked<typeof authService>;
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderComponent = () =>
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

describe("Login", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("renderiza el formulario y permite ingresar texto", () => {
        renderComponent();

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/contraseña/i);

        fireEvent.change(usernameInput, { target: { value: "user1" } });
        fireEvent.change(passwordInput, { target: { value: "pass1" } });

        expect(usernameInput).toHaveValue("user1");
        expect(passwordInput).toHaveValue("pass1");
    });

    it("realiza login exitoso y navega a /home", async () => {
        mockAuthService.login.mockResolvedValue("fake-token");

        renderComponent();

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "user1" } });
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "pass1" } });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
        });

        await waitFor(() => {
            expect(mockAuthService.login).toHaveBeenCalledWith("user1", "pass1");
            expect(mockNavigate).toHaveBeenCalledWith("/home");
        });
    });

    it("muestra error cuando login falla", async () => {
        mockAuthService.login.mockRejectedValue(new Error("Invalid credentials"));

        renderComponent();

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "user1" } });
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrongpass" } });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
        });

        expect(await screen.findByText(/usuario o contraseña incorrectos/i)).toBeInTheDocument();
    });

    it("abre y cierra modal de recuperación de contraseña", () => {
        renderComponent();

        fireEvent.click(screen.getByRole("button", { name: /¿olvidaste tu contraseña\?/i }));
        expect(screen.getByText(/recuperar contraseña/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
        expect(screen.queryByText(/recuperar contraseña/i)).not.toBeInTheDocument();
    });

    it("envía formulario de recuperación exitosamente", async () => {
        mockAuthService.sendPasswordResetEmail.mockResolvedValue(undefined);

        renderComponent();

        fireEvent.click(screen.getByRole("button", { name: /¿olvidaste tu contraseña\?/i }));

        const emailInput = screen.getByLabelText(/correo electrónico/i);
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
        });

        expect(mockAuthService.sendPasswordResetEmail).toHaveBeenCalledWith("test@example.com");
        expect(await screen.findByText(/correo de recuperación enviado con éxito/i)).toBeInTheDocument();
    });

    it("muestra error cuando falla el envío del correo de recuperación", async () => {
        mockAuthService.sendPasswordResetEmail.mockRejectedValue(new Error("Failed"));

        renderComponent();

        fireEvent.click(screen.getByRole("button", { name: /¿olvidaste tu contraseña\?/i }));

        fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: "fail@example.com" } });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));
        });

        expect(await screen.findByText(/no se pudo enviar el correo/i)).toBeInTheDocument();
    });
});
