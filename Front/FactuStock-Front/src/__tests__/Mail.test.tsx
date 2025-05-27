import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import Mail from '../pages/Mail';
import axios from 'axios';
import Swal from 'sweetalert2';

// Mocks
vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}));

describe('Mail Component', () => {
    const mockUserData = {
        organizacion: { email: 'org@example.com', id: 'org1' }
    };
    const mockClientes = [
        { mail: 'cliente1@example.com', nombre: 'Cliente 1' },
        { mail: 'cliente2@example.com', nombre: 'Cliente 2' }
    ];

    beforeEach(() => {
        localStorage.setItem('authToken', 'fake-token');
        axios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: mockUserData });
            }
            if (url.includes('/EmpresaPersonaFisica/organizacion/')) {
                return Promise.resolve({ data: mockClientes });
            }
            return Promise.reject(new Error('not found'));
        });
    });

    it('renders correctly and loads data', async () => {
        render(<Router><Mail /></Router>);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Enviar Correo/i })).toBeDefined();
            expect(screen.getByTestId('sidebar')).toBeDefined();
            expect(screen.getByLabelText('Seleccionar Cliente o Escribir Correo')).toBeDefined();
            expect(screen.getByLabelText('Asunto')).toBeDefined();
            expect(screen.getByLabelText('Mensaje')).toBeDefined();
            expect(screen.getByLabelText('Adjuntar archivo')).toBeDefined();
            expect(screen.getByRole('button', { name: /Enviar Correo/i })).toBeDefined();
        });
    });

    it('handles form input changes', async () => {
        render(<Router><Mail /></Router>);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Asunto'), { target: { value: 'Test Subject' } });
            fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Test Message' } });

            expect(screen.getByLabelText('Asunto')).toHaveValue('Test Subject');
            expect(screen.getByLabelText('Mensaje')).toHaveValue('Test Message');
        });
    });

    it('handles file input', async () => {
        render(<Router><Mail /></Router>);

        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        const fileInput = screen.getByLabelText('Adjuntar archivo');

        await waitFor(() => {
            fireEvent.change(fileInput, { target: { files: [file] } });
            expect(fileInput.files[0]).toBe(file);
        });
    });

    it('shows error for invalid email', async () => {
        render(<Router><Mail /></Router>);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Asunto'), { target: { value: 'Test' } });
            fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Test' } });
            fireEvent.submit(screen.getByRole('button', { name: /Enviar Correo/i }));
        });

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            icon: 'warning',
            title: 'Correo inválido'
        }));
    });

    it('handles successful form submission', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true });

        render(<Router><Mail /></Router>);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Seleccionar Cliente o Escribir Correo'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('Asunto'), { target: { value: 'Test Subject' } });
            fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Test Message' } });
            fireEvent.submit(screen.getByRole('button', { name: /Enviar Correo/i }));
        });

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            icon: 'success',
            title: 'Correo enviado'
        }));
    });

    it('handles failed form submission', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: false });

        render(<Router><Mail /></Router>);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Seleccionar Cliente o Escribir Correo'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('Asunto'), { target: { value: 'Test Subject' } });
            fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Test Message' } });
            fireEvent.submit(screen.getByRole('button', { name: /Enviar Correo/i }));
        });

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            icon: 'error',
            title: 'Error'
        }));
    });

    it('handles network error during form submission', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        render(<Router><Mail /></Router>);

        await waitFor(() => {
            fireEvent.change(screen.getByLabelText('Seleccionar Cliente o Escribir Correo'), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText('Asunto'), { target: { value: 'Test Subject' } });
            fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Test Message' } });
            fireEvent.submit(screen.getByRole('button', { name: /Enviar Correo/i }));
        });

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            icon: 'error',
            title: 'Error de red'
        }));
    });
});
