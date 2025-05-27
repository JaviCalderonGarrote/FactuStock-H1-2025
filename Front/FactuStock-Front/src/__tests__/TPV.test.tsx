import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import TPV from '../pages/TPV';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

// Mocks
vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockAxios = axios;
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

const renderComponent = () =>
    render(
        <BrowserRouter>
            <TPV />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('TPV', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('authToken', TOKEN);
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
        Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('muestra loading inicialmente', () => {
        renderComponent();
        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('carga y muestra las categorías correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [{ id: 1, estado: 'ABIERTA' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Bebidas' }] })
            .mockResolvedValueOnce({ data: [] });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Bebidas')).toBeInTheDocument();
        });
    });

    it('abre modal de cliente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [{ id: 1, estado: 'ABIERTA' }] })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Añadir Cliente')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Añadir Cliente'));
        });

        expect(screen.getByText('Seleccionar Cliente')).toBeInTheDocument();
    });

    it('cancela venta', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [{ id: 1, estado: 'ABIERTA' }] })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Cancelar Venta')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Cancelar Venta'));
        });

        expect(Swal.fire).toHaveBeenCalledWith(
            'Venta cancelada',
            'Se han eliminado todos los productos del carrito',
            'info'
        );
    });

    it('muestra error al cobrar sin productos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [{ id: 1, estado: 'ABIERTA' }] })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Cobrar')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Cobrar'));
        });

        expect(Swal.fire).toHaveBeenCalledWith(
            'Error',
            'No hay productos seleccionados para cobrar.',
            'error'
        );
    });

    it('vuelve a categorías desde productos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [{ id: 1, estado: 'ABIERTA' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Bebidas' }] })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({
                data: [{
                    id: 1,
                    nombre: 'Coca Cola',
                    precio: 2.50,
                    cantidadStock: 10,
                    categoria: { id: 1 }
                }]
            });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Bebidas')).toBeInTheDocument();
        });

        await act(() => {
            fireEvent.click(screen.getByText('Bebidas'));
        });

        await waitFor(() => {
            expect(screen.getByText('Volver a Categorías')).toBeInTheDocument();
        });

        await act(() => {
            fireEvent.click(screen.getByText('Volver a Categorías'));
        });

        await waitFor(() => {
            expect(screen.getByText('Bebidas')).toBeInTheDocument();
            expect(screen.queryByText('Volver a Categorías')).not.toBeInTheDocument();
        });
    });


    it('muestra mensaje cuando no hay caja abierta', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] }); // No hay cajas abiertas

        const mockSwalFire = vi.mocked(Swal.fire);
        mockSwalFire.mockResolvedValue({ isConfirmed: false });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(mockSwalFire).toHaveBeenCalledWith({
                title: "No hay caja abierta",
                text: "Es necesario abrir una caja para usar el TPV",
                icon: "warning",
                confirmButtonText: "Ir a Gestión de Cajas",
                showCancelButton: true,
                cancelButtonText: "Cancelar"
            });
        });
    });
});
