import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import Perfil from '../pages/Perfil';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockAxios = vi.mocked(axios, true);

const renderComponent = () =>
    render(
        <BrowserRouter>
            <Perfil />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('Perfil', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('authToken', TOKEN);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renderiza correctamente y muestra la información del usuario', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            mail: 'test@example.com',
            nombre: 'Test',
            apellido: 'User',
            telefono: '1234567890',
            rol: 'VENDEDOR',
        };

        mockAxios.get.mockResolvedValueOnce({ data: mockUser });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByTestId('sidebar')).toBeInTheDocument();
            expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
            expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
            expect(screen.getByDisplayValue('User')).toBeInTheDocument();
            expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
            expect(screen.getByDisplayValue('VENDEDOR')).toBeInTheDocument();
        });
    });

    it('actualiza el perfil correctamente', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            mail: 'test@example.com',
            nombre: 'Test',
            apellido: 'User',
            telefono: '1234567890',
            rol: 'VENDEDOR',
        };

        mockAxios.get.mockResolvedValueOnce({ data: mockUser });
        mockAxios.put.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true });

        renderComponent();

        await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Updated Test' } });
        fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Updated User' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'updated@example.com' } });
        fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '9876543210' } });

        fireEvent.click(screen.getByText(/guardar cambios/i));

        await waitFor(() => {
            expect(mockAxios.put).toHaveBeenCalledWith(
                'http://localhost:8080/usuarios/1',
                expect.objectContaining({
                    nombre: 'Updated Test',
                    apellido: 'Updated User',
                    mail: 'updated@example.com',
                    telefono: '9876543210',
                }),
                expect.anything()
            );

            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Éxito',
                    text: 'Perfil actualizado correctamente.',
                    icon: 'success',
                })
            );
        });
    });

    it('muestra error cuando la actualización del perfil falla', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            mail: 'test@example.com',
            nombre: 'Test',
            apellido: 'User',
            telefono: '1234567890',
            rol: 'VENDEDOR',
        };

        mockAxios.get.mockResolvedValueOnce({ data: mockUser });
        mockAxios.put.mockRejectedValueOnce({ response: { data: { message: 'Error de actualización' } } });
        vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true });

        renderComponent();

        await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Updated Test' } });
        fireEvent.click(screen.getByText(/guardar cambios/i));

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Error',
                    text: 'Error de actualización',
                    icon: 'error',
                })
            );
        });
    });

    it('abre y cierra el modal de cambio de contraseña', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            mail: 'test@example.com',
            nombre: 'Test',
            apellido: 'User',
            telefono: '1234567890',
            rol: 'VENDEDOR',
        };

        mockAxios.get.mockResolvedValueOnce({ data: mockUser });

        renderComponent();

        await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument());

        fireEvent.click(screen.getByText(/cambiar contraseña/i));

        await waitFor(() => {
            expect(screen.getByText('Cambiar Contraseña', { selector: '.modal-title' })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/cerrar/i));

        await waitFor(() => {
            expect(screen.queryByText('Cambiar Contraseña', { selector: '.modal-title' })).not.toBeInTheDocument();
        });
    });

    it('maneja el cambio de contraseña correctamente', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            mail: 'test@example.com',
            nombre: 'Test',
            apellido: 'User',
            telefono: '1234567890',
            rol: 'VENDEDOR',
        };

        mockAxios.get.mockResolvedValueOnce({ data: mockUser });
        mockAxios.patch.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true });

        renderComponent();

        await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument());

        fireEvent.click(screen.getByText(/cambiar contraseña/i));

        fireEvent.change(screen.getByLabelText(/contraseña actual/i), { target: { value: 'oldPass123' } });
        fireEvent.change(screen.getByLabelText(/^nueva contraseña$/i), { target: { value: 'NewPass123!' } });
        fireEvent.change(screen.getByLabelText(/confirmar nueva contraseña/i), { target: { value: 'NewPass123!' } });

        fireEvent.click(screen.getByText(/actualizar contraseña/i));

        await waitFor(() => {
            expect(mockAxios.patch).toHaveBeenCalledWith(
                'http://localhost:8080/usuarios/1/password',
                { oldPassword: 'oldPass123', newPassword: 'NewPass123!' },
                expect.anything()
            );

            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Éxito',
                    text: 'Contraseña actualizada correctamente.',
                    icon: 'success',
                })
            );
        });
    });



    it('maneja errores en la obtención de datos del usuario', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Error de red'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error al obtener los datos: Error de red')).toBeInTheDocument();
        });
    });

    it('maneja token inválido', () => {
        localStorage.setItem('authToken', 'invalid.token');

        renderComponent();

        expect(screen.getByText('Token JWT no es válido.')).toBeInTheDocument();
    });

    it('maneja token sin ID de usuario', () => {
        localStorage.setItem('authToken', `header.${btoa(JSON.stringify({}))}.signature`);

        renderComponent();

        expect(screen.getByText('ID de usuario no encontrado en el token.')).toBeInTheDocument();
    });
});
