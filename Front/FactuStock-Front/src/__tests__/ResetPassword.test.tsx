import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import axios from 'axios';
import Swal from 'sweetalert2';
import ResetPassword from '../pages/ResetPassword';

// Mocks
vi.mock('axios', () => ({
    default: {
        post: vi.fn(),
    }
}));

vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
    },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSwal = Swal as unknown as jest.Mocked<typeof Swal>;

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ResetPassword Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly and handles password reset', async () => {
        mockedAxios.post.mockResolvedValue({ status: 200 });
        mockedSwal.fire.mockResolvedValue({ isConfirmed: true } as any);

        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/Nueva Contraseña/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Restablecer Contraseña/i })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { value: 'newpassword123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'newpassword123' } });

        fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }));

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(
                "http://localhost:8080/usuarios/reset-password",
                expect.objectContaining({
                    newPassword: 'newpassword123',
                })
            );
        });

        expect(mockedSwal.fire).toHaveBeenCalledWith("Éxito", "Contraseña actualizada correctamente.", "success");
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it('shows error for mismatched passwords', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { value: 'password1' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'password2' } });
        fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }));

        await waitFor(() => {
            expect(mockedSwal.fire).toHaveBeenCalledWith("Error", "Las contraseñas no coinciden.", "error");
        });
    });

    it('shows error for short password', async () => {
        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { value: 'short' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'short' } });
        fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }));

        await waitFor(() => {
            expect(mockedSwal.fire).toHaveBeenCalledWith("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
        });
    });

    it('handles API error', async () => {
        mockedAxios.post.mockRejectedValue(new Error('API Error'));
        mockedSwal.fire.mockResolvedValue({ isConfirmed: true } as any);

        render(
            <BrowserRouter>
                <ResetPassword />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { value: 'validpassword' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'validpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /Restablecer Contraseña/i }));

        await waitFor(() => {
            expect(mockedSwal.fire).toHaveBeenCalledWith("Error", "Hubo un error al restablecer la contraseña.", "error");
        });
    });
});
