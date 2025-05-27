// src/__tests__/Clientes.test.tsx

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import EmpresaPersonaFisicaComponent from '../pages/Clientes';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as React from 'react';

vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>
}));

const mockAxios = axios as jest.Mocked<typeof axios>;

const VALID_TOKEN = btoa(JSON.stringify({ idUsuario: 1 }));
const INVALID_TOKEN = btoa(JSON.stringify({ otroCampo: 999 }));

describe('EmpresaPersonaFisicaComponent', () => {
    beforeEach(() => {
        localStorage.setItem('authToken', `header.${VALID_TOKEN}.signature`);
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <EmpresaPersonaFisicaComponent />
            </BrowserRouter>
        );
    };

    it('muestra error si no hay token', async () => {
        localStorage.removeItem('authToken');
        renderComponent();
        expect(await screen.findByText('No se encontró un token de autenticación.')).toBeInTheDocument();
    });

    it('muestra error si el ID de usuario no está en el token', async () => {
        localStorage.setItem('authToken', `header.${INVALID_TOKEN}.signature`);
        renderComponent();
        expect(await screen.findByText('ID de usuario no encontrado en el token.')).toBeInTheDocument();
    });

    it('renderiza empresas correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [{
                    id: 1,
                    nombre: 'Empresa Test',
                    nifCif: '12345678A',
                    telefono: '123456789',
                    direccion: 'Calle Test',
                    web: 'www.test.com',
                    mail: 'test@test.com',
                    tipo: 'CLIENTE'
                }]
            });

        renderComponent();

        expect(await screen.findByText('Empresa Test')).toBeInTheDocument();
        expect(screen.getByText('12345678A')).toBeInTheDocument();
        expect(screen.getByText('CLIENTE')).toBeInTheDocument();
    });

    it('puede buscar empresas', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 1, nombre: 'Empresa ABC', nifCif: '12345678A', telefono: '123456789', direccion: 'Calle ABC', web: 'www.abc.com', mail: 'abc@test.com', tipo: 'CLIENTE' },
                    { id: 2, nombre: 'Empresa XYZ', nifCif: '87654321B', telefono: '987654321', direccion: 'Calle XYZ', web: 'www.xyz.com', mail: 'xyz@test.com', tipo: 'PROVEEDOR' }
                ]
            });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Empresa ABC')).toBeInTheDocument();
            expect(screen.getByText('Empresa XYZ')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'xyz' } });

        await waitFor(() => {
            expect(screen.queryByText('Empresa ABC')).not.toBeInTheDocument();
            expect(screen.getByText('Empresa XYZ')).toBeInTheDocument();
        });
    });

    it('abre el modal para crear empresa', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Agregar Empresa/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Agregar Empresa/i));
        expect(screen.getAllByText(/Agregar Empresa/i).length).toBeGreaterThan(1);
    });

    it('crea una nueva empresa correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] });

        mockAxios.post.mockResolvedValueOnce({
            data: { id: 1, nombre: 'Nueva Empresa', nifCif: '12345678A', mail: 'nueva@test.com', tipo: 'CLIENTE' }
        });

        Swal.fire = vi.fn().mockResolvedValue({});

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Agregar Empresa/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Agregar Empresa/i));

        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Nueva Empresa' } });
        fireEvent.change(screen.getByLabelText(/NIF\/CIF/i), { target: { value: '12345678A' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'nueva@test.com' } });

        fireEvent.click(screen.getByText('Crear Empresa'));

        await waitFor(() => {
            expect(mockAxios.post).toHaveBeenCalledWith(
                'http://localhost:8080/EmpresaPersonaFisica',
                expect.objectContaining({
                    nombre: 'Nueva Empresa',
                    nifCif: '12345678A',
                    mail: 'nueva@test.com',
                    organizacion: { id: 1 }
                }),
                expect.anything()
            );
        });

        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Empresa creada correctamente', 'success');
    });

    it('edita una empresa existente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 1, nombre: 'Empresa Editar', nifCif: '12345678A', telefono: '123456789', direccion: 'Calle Editar', web: 'www.editar.com', mail: 'editar@test.com', tipo: 'CLIENTE' }
                ]
            });

        mockAxios.put.mockResolvedValueOnce({
            data: { id: 1, nombre: 'Empresa Editada', nifCif: '87654321B', mail: 'editada@test.com', tipo: 'PROVEEDOR' }
        });

        Swal.fire = vi.fn().mockResolvedValue({});

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Empresa Editar')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('✏️'));

        fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Empresa Editada' } });
        fireEvent.change(screen.getByLabelText(/NIF\/CIF/i), { target: { value: '87654321B' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'editada@test.com' } });
        fireEvent.change(screen.getByLabelText(/Tipo/i), { target: { value: 'PROVEEDOR' } });

        fireEvent.click(screen.getByText('Actualizar Empresa'));

        await waitFor(() => {
            expect(mockAxios.put).toHaveBeenCalledWith(
                'http://localhost:8080/EmpresaPersonaFisica/1',
                expect.objectContaining({
                    nombre: 'Empresa Editada',
                    nifCif: '87654321B',
                    mail: 'editada@test.com',
                    tipo: 'PROVEEDOR',
                    organizacion: { id: 1 }
                }),
                expect.anything()
            );
        });

        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Empresa actualizada correctamente', 'success');
    });

    it('elimina una empresa', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 1, nombre: 'Empresa Eliminar', nifCif: '12345678A', telefono: '123456789', direccion: 'Calle Eliminar', web: 'www.eliminar.com', mail: 'eliminar@test.com', tipo: 'CLIENTE' }
                ]
            });

        mockAxios.delete.mockResolvedValueOnce({});

        Swal.fire = vi.fn()
            .mockResolvedValueOnce({ isConfirmed: true })
            .mockResolvedValueOnce({});

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Empresa Eliminar')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('🗑️'));

        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            title: '¿Estás seguro?',
            text: 'Esta empresa será eliminada permanentemente.'
        }));

        await waitFor(() => {
            expect(mockAxios.delete).toHaveBeenCalledWith(
                'http://localhost:8080/EmpresaPersonaFisica/1',
                expect.anything()
            );
        });

        expect(Swal.fire).toHaveBeenCalledWith('Eliminado', 'La empresa ha sido eliminada correctamente', 'success');
    });

    it('maneja la paginación correctamente', async () => {
        const empresas = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            nombre: `Empresa ${i + 1}`,
            nifCif: `1234567${i}`,
            telefono: `12345678${i}`,
            direccion: `Calle ${i + 1}`,
            web: `www.empresa${i + 1}.com`,
            mail: `empresa${i + 1}@test.com`,
            tipo: i % 2 === 0 ? 'CLIENTE' : 'PROVEEDOR'
        }));

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: empresas });

        renderComponent();

        await screen.findByText('Empresa 1');
        expect(screen.queryByText('Empresa 10')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: '2' });
        fireEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.queryByText('Empresa 1')).not.toBeInTheDocument();
            expect(screen.getByText('Empresa 10')).toBeInTheDocument();
        });
    });

    it('maneja errores en la carga de datos', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Error de red'));

        renderComponent();

        expect(await screen.findByText(/Error al obtener los datos: Error de red/)).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay empresas', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: { message: 'No hay empresas' } });

        renderComponent();

        expect(await screen.findByText('No hay datos disponibles en la base de datos.')).toBeInTheDocument();
    });
});
