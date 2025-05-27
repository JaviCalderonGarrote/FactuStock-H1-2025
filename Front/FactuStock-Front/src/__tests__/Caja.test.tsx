import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import CajaComponent from '../pages/Caja';
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

const TOKEN = btoa(JSON.stringify({ idUsuario: 1 }));

describe('CajaComponent', () => {
    beforeEach(() => {
        localStorage.setItem('authToken', `header.${TOKEN}.signature`);
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <CajaComponent />
            </BrowserRouter>
        );
    };

    it('muestra error si no hay token', async () => {
        localStorage.removeItem('authToken');
        renderComponent();
        expect(await screen.findByText('No se encontró un token de autenticación.')).toBeInTheDocument();
    });

    it('muestra error si el ID de usuario no está en el token', async () => {
        localStorage.setItem('authToken', 'header.invalidToken.signature');
        renderComponent();
        expect(await screen.findByText('Error al obtener las cajas.')).toBeInTheDocument();
    });

    it('renderiza cajas correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } }) // usuario
            .mockResolvedValueOnce({ data: [ // cajas
                    {
                        id: 1,
                        nombre: 'Caja Test',
                        fechaInicio: new Date().toISOString(),
                        fechaFin: null,
                        totalIngresado: 100,
                        cantidadVentas: 3,
                        estado: 'ABIERTA'
                    }
                ] });

        renderComponent();

        expect(await screen.findByText('Caja Test')).toBeInTheDocument();
        expect(screen.getByText('Abierta')).toBeInTheDocument();
        expect(screen.getByTitle('Cerrar Caja')).toBeInTheDocument();
    });

    it('puede buscar cajas', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Caja ABC', fechaInicio: new Date().toISOString(), fechaFin: null, totalIngresado: 50, cantidadVentas: 2, estado: 'ABIERTA' }] });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Caja ABC')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText('Buscar...'), { target: { value: 'xyz' } });
        expect(screen.getByText('No hay cajas disponibles')).toBeInTheDocument();
    });

    it('abre el modal para crear caja', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] });

        renderComponent();

        fireEvent.click(screen.getByText(/Crear nueva Caja/i));
        expect(await screen.findByText('Crear Nueva Caja')).toBeInTheDocument();
    });

    it('muestra confirmación si ya hay una caja abierta al crear', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 1, estado: 'ABIERTA', nombre: 'Caja Test', fechaInicio: new Date().toISOString(), cantidadVentas: 2, totalIngresado: 100 }
                ]
            });

        Swal.fire = vi.fn().mockResolvedValue({ isConfirmed: true });

        renderComponent();
        await screen.findByText('Caja Test');

        fireEvent.click(screen.getByText(/Crear nueva Caja/i));
        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            title: '¿Cerrar caja actual?'
        }));
    });

    it('cierra una caja correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 1,
                        nombre: 'Caja Cerrar',
                        estado: 'ABIERTA',
                        fechaInicio: new Date().toISOString(),
                        fechaFin: null,
                        totalIngresado: 100,
                        cantidadVentas: 1
                    }
                ]
            });

        mockAxios.put.mockResolvedValue({ status: 200 });

        Swal.fire = vi.fn().mockResolvedValueOnce({ isConfirmed: true }).mockResolvedValueOnce({});

        renderComponent();
        await screen.findByText('Caja Cerrar');

        fireEvent.click(screen.getByTitle('Cerrar Caja'));
        expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
            title: '¿Cerrar caja?'
        }));

        await waitFor(() => {
            expect(mockAxios.put).toHaveBeenCalled();
        });
    });

    it('muestra error si intenta cerrar una caja ya cerrada', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [
                    {
                        id: 1,
                        nombre: 'Caja Cerrada',
                        estado: 'CERRADA',
                        fechaInicio: new Date().toISOString(),
                        fechaFin: new Date().toISOString(),
                        totalIngresado: 0,
                        cantidadVentas: 0
                    }
                ]
            });

        Swal.fire = vi.fn();

        renderComponent();
        await screen.findByText('Caja Cerrada');
        expect(screen.queryByTitle('Cerrar Caja')).not.toBeInTheDocument();
    });

    it('crea una nueva caja correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] });

        mockAxios.post.mockResolvedValueOnce({ data: { id: 2, nombre: 'Nueva Caja', estado: 'ABIERTA' } });

        Swal.fire = vi.fn().mockResolvedValue({});

        renderComponent();

        fireEvent.click(screen.getByText(/Crear nueva Caja/i));

        const input = await screen.findByPlaceholderText('Dejar en blanco para nombre automático');
        fireEvent.change(input, { target: { value: 'Nueva Caja' } });

        fireEvent.click(screen.getByText('Crear Caja'));

        await waitFor(() => {
            expect(mockAxios.post).toHaveBeenCalledWith(
                'http://localhost:8080/cajas',
                expect.objectContaining({ nombre: 'Nueva Caja' }),
                expect.anything()
            );
        });

        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Nueva caja creada correctamente', 'success');
    });

    it('maneja la paginación correctamente', async () => {
        const cajas = Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            nombre: `Caja ${i + 1}`,
            fechaInicio: new Date().toISOString(),
            fechaFin: null,
            totalIngresado: 100 * (i + 1),
            cantidadVentas: i + 1,
            estado: i % 2 === 0 ? 'ABIERTA' : 'CERRADA'
        }));

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: cajas });

        renderComponent();

        await screen.findByText('Caja 1');
        expect(screen.queryByText('Caja 10')).not.toBeInTheDocument();

        const nextPageButton = screen.getByLabelText('Next page');
        fireEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.queryByText('Caja 1')).not.toBeInTheDocument();
        }, { timeout: 3000 });

        await waitFor(() => {
            expect(screen.getByText('Caja 10')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
