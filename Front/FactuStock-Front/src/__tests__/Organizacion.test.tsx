import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import Organizacion from '../pages/Organizacion';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockAxios = axios as vi.MockedObject<typeof axios>;

const renderComponent = () =>
    render(
        <BrowserRouter>
            <Organizacion />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('Organizacion Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('authToken', TOKEN);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('muestra error si no hay token', async () => {
        localStorage.removeItem('authToken');
        renderComponent();
        expect(await screen.findByText('No se encontró un token de autenticación.')).toBeInTheDocument();
    });

    it('carga y muestra la información de la organización', async () => {
        const orgData = {
            id: 1,
            nombre: 'Test Org',
            direccion: 'Test Address',
            telefono: '123456789',
            nifCif: 'A12345678',
            web: 'www.test.com',
            email: 'test@test.com',
            logo: 'logo.png'
        };

        mockAxios.get.mockResolvedValueOnce({ data: { organizacion: orgData } });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByDisplayValue('Test Org')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test Address')).toBeInTheDocument();
            expect(screen.getByDisplayValue('123456789')).toBeInTheDocument();
            expect(screen.getByDisplayValue('A12345678')).toBeInTheDocument();
            expect(screen.getByDisplayValue('www.test.com')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
        });
    });

    it('maneja cambios en los inputs', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { organizacion: {} } });

        await act(async () => {
            renderComponent();
        });

        const nombreInput = screen.getByLabelText('Nombre');
        fireEvent.change(nombreInput, { target: { value: 'Nueva Org' } });
        expect(nombreInput).toHaveValue('Nueva Org');
    });

    it('muestra error al subir archivo no válido', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { organizacion: {} } });
        vi.mocked(Swal.fire).mockResolvedValueOnce({} as any);

        await act(async () => {
            renderComponent();
        });

        const fileInput = screen.getByLabelText('Subir nuevo logo');
        const file = new File([''], 'test.txt', { type: 'text/plain' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(Swal.fire).toHaveBeenCalledWith({
            title: "Error",
            text: "Solo se permiten archivos JPG, JPEG o PNG.",
            icon: "error",
            confirmButtonText: "OK"
        });
    });

    it('envía formulario con datos válidos', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { organizacion: { id: 1 } } });
        mockAxios.put.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValueOnce({} as any);

        await act(async () => {
            renderComponent();
        });

        fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva Org' } });
        fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Nueva Dir' } });
        fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '987654321' } });
        fireEvent.change(screen.getByLabelText('NIF/CIF'), { target: { value: 'B87654321' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nuevo@test.com' } });

        await act(async () => {
            fireEvent.click(screen.getByText('Guardar Cambios'));
        });

        expect(mockAxios.put).toHaveBeenCalled();
        expect(Swal.fire).toHaveBeenCalledWith("Éxito", "Organización actualizada correctamente.", "success");
    });
    it('muestra error al enviar formulario incompleto', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { organizacion: { id: 1 } } });
        vi.mocked(Swal.fire).mockResolvedValueOnce({} as any);

        await act(async () => {
            renderComponent();
        });

        // Asegúrate de que todos los campos requeridos estén vacíos
        fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('NIF/CIF'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });

        await act(async () => {
            fireEvent.submit(screen.getByText('Guardar Cambios').closest('form'));
        });

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith("Error", "Por favor completa todos los campos correctamente.", "error");
        });
    });


});
