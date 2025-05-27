import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Registro from '../pages/Registro';
import { BrowserRouter } from 'react-router-dom';
import authService from '../services/authService';
import Swal from 'sweetalert2';

vi.mock('../services/authService');
vi.mock('sweetalert2');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

const renderComponent = () =>
    render(
        <BrowserRouter>
            <Registro />
        </BrowserRouter>
    );

const fillUserForm = (userData = {}) => {
    const defaultData = {
        username: 'testuser',
        nombre: 'John',
        apellido: 'Doe',
        mail: 'test@test.com',
        password: 'Password1',
        confirmPassword: 'Password1'
    };
    const data = { ...defaultData, ...userData };

    fireEvent.change(screen.getByLabelText('Username *'), { target: { value: data.username } });
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: data.nombre } });
    fireEvent.change(screen.getByLabelText('Apellido *'), { target: { value: data.apellido } });
    fireEvent.change(screen.getByLabelText('Correo electrónico *'), { target: { value: data.mail } });
    fireEvent.change(screen.getByLabelText('Contraseña *'), { target: { value: data.password } });
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña *'), { target: { value: data.confirmPassword } });
};

const fillOrgForm = (orgData = {}) => {
    const defaultData = {
        nombre: 'Test Org',
        direccion: '123 Test St',
        telefono: '123456789',
        nifCif: 'A12345678',
        email: 'org@test.com',
        web: 'https://test.com',
        logo: 'https://test.com/logo.png',
        IBAN: 'ES1234567890123456789012'
    };
    const data = { ...defaultData, ...orgData };

    fireEvent.change(screen.getByLabelText('Nombre de la organización *'), { target: { value: data.nombre } });
    fireEvent.change(screen.getByLabelText('Dirección *'), { target: { value: data.direccion } });
    fireEvent.change(screen.getByLabelText('Teléfono *'), { target: { value: data.telefono } });
    fireEvent.change(screen.getByLabelText('NIF/CIF *'), { target: { value: data.nifCif } });
    fireEvent.change(screen.getByLabelText('Email *'), { target: { value: data.email } });
    fireEvent.change(screen.getByLabelText('Sitio Web'), { target: { value: data.web } });
    fireEvent.change(screen.getByLabelText('Logo URL'), { target: { value: data.logo } });
    fireEvent.change(screen.getByLabelText('IBAN'), { target: { value: data.IBAN } });
};

describe('Registro Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(Swal.fire).mockResolvedValue({});
        vi.mocked(authService.checkUsernameExists).mockResolvedValue(false);
        vi.mocked(authService.checkEmailExists).mockResolvedValue(false);
        vi.mocked(authService.register).mockResolvedValue({});
    });

    it('renderiza el formulario paso 1', () => {
        renderComponent();
        expect(screen.getByText('Registro de Usuario')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
        expect(screen.getByLabelText('Username *')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
        expect(screen.getByLabelText('Apellido *')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo electrónico *')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña *')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirmar Contraseña *')).toBeInTheDocument();
    });

    it('actualiza datos del formulario', () => {
        renderComponent();
        const input = screen.getByLabelText('Username *');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(input.value).toBe('test');
    });

    it('muestra error por campos vacíos', async () => {
        renderComponent();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Campos incompletos'
            }));
        });
    });

    it('valida contraseñas diferentes', async () => {
        renderComponent();
        fillUserForm({ password: 'Password1', confirmPassword: 'Different1' });
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Contraseñas no coinciden'
            }));
        });
    });

    it('valida contraseña inválida', async () => {
        renderComponent();
        fillUserForm({ password: 'weak', confirmPassword: 'weak' });
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Contraseña inválida'
            }));
        });
    });

    it('valida usuario existente', async () => {
        vi.mocked(authService.checkUsernameExists).mockResolvedValue(true);
        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Usuario no válido'
            }));
        });
    });

    it('valida email existente', async () => {
        vi.mocked(authService.checkEmailExists).mockResolvedValue(true);
        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Correo no válido'
            }));
        });
    });

    it('avanza al paso 2 con datos válidos', async () => {
        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(screen.getByText('Registro de Organización')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument();
        });
    });

    it('vuelve al paso 1 desde paso 2', async () => {
        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(screen.getByText('Registro de Organización')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
        expect(screen.getByText('Registro de Usuario')).toBeInTheDocument();
    });

    it('actualiza datos de organización', async () => {
        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(screen.getByText('Registro de Organización')).toBeInTheDocument();
        });

        const orgNameInput = screen.getByLabelText('Nombre de la organización *');
        fireEvent.change(orgNameInput, { target: { value: 'Test Organization' } });
        expect(orgNameInput.value).toBe('Test Organization');
    });

    it('valida campos obligatorios de organización', async () => {
        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(screen.getByText('Registro de Organización')).toBeInTheDocument();
        });

        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Datos incompletos'
            }));
        });
    });

    it('completa registro exitosamente', async () => {
        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(screen.getByText('Registro de Organización')).toBeInTheDocument();
        });

        fillOrgForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: '¡Registro exitoso!'
            }));
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('maneja errores de registro', async () => {
        vi.mocked(authService.register).mockRejectedValue({
            response: { data: { message: 'Error específico' } }
        });

        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(screen.getByText('Registro de Organización')).toBeInTheDocument();
        });

        fillOrgForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Error en el registro',
                text: 'Error específico'
            }));
        });
    });

    it('maneja errores de API', async () => {
        vi.mocked(authService.checkUsernameExists).mockRejectedValue(new Error('Error'));

        renderComponent();
        fillUserForm();
        fireEvent.submit(screen.getByTestId('registro-form'));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Error de conexión'
            }));
        });
    });

    it('navega al inicio', () => {
        renderComponent();
        fireEvent.click(screen.getByRole('button', { name: 'Volver al inicio' }));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('desactiva botones durante el procesamiento', async () => {
        renderComponent();
        fillUserForm();

        const submitBtn = screen.getByRole('button', { name: 'Continuar' });
        fireEvent.submit(screen.getByTestId('registro-form'));

        expect(submitBtn).toBeDisabled();
        expect(submitBtn.textContent).toBe('Procesando...');
    });

    it('renderiza logo correctamente', () => {
        renderComponent();
        const logo = screen.getByRole('img', { name: 'Logo' });
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/LOGO-Letras.png');
    });

    it('aplica estilos personalizados', () => {
        renderComponent();
        const card = screen.getByTestId('registro-form').closest('.card');
        expect(card).toHaveStyle('border-radius: 15px');
    });
});