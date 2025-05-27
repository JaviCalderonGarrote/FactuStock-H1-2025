import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import Home from '../pages/home';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import authService from "../services/authService";

vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('../services/authService');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
    Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
    Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

const mockAxios = axios as vi.MockedObject<typeof axios>;

const renderComponent = () =>
    render(
        <BrowserRouter>
            <Home />
        </BrowserRouter>
    );

describe('Home', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('authToken', 'header.eyJpZFVzdWFyaW8iOjF9.signature');
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders error state when API call fails', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('API Error'));
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Error al obtener los datos del usuario/)).toBeInTheDocument();
        });
    });

    it('renders home page with data', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { username: 'TestUser', organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: 1000 }) // ingresos
            .mockResolvedValueOnce({ data: 500 }) // gastos
            .mockResolvedValueOnce({ data: 5 }) // facturas no completadas
            .mockResolvedValueOnce({ data: { nombre: 'Caja 1', totalIngresado: 200 } }) // caja abierta
            .mockResolvedValueOnce({ data: { 'Producto A': 10, 'Producto B': 20 } }) // top 5 productos
            .mockResolvedValueOnce({ data: [{ mes: 1, cantidad_ventas: 100 }] }) // ventas por mes
            .mockResolvedValueOnce({ data: [{ mes: 1, ingresos: 1000 }] }) // ingresos mensuales
            .mockResolvedValueOnce({ data: [{ mes: 1, gastos: 500 }] }) // gastos mensuales
            .mockResolvedValueOnce({ data: [{ nombre: 'Empresa A', facturas_count: 10 }] }); // empresas facturas

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText(/TestUser/)).toBeInTheDocument();
            expect(screen.getByText('$500.00')).toBeInTheDocument(); // Balance
            expect(screen.getByText('5')).toBeInTheDocument(); // Facturas no completadas
            expect(screen.getByText('Caja 1')).toBeInTheDocument();
            expect(screen.getByText('Total: $200.00')).toBeInTheDocument();
            expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
            expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });
    });

    it('renders charts when data is loaded successfully', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { username: 'TestUser', organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: 1000 }) // ingresos
            .mockResolvedValueOnce({ data: 500 }) // gastos
            .mockResolvedValueOnce({ data: 5 }) // facturas no completadas
            .mockResolvedValueOnce({ data: { nombre: 'Caja 1', totalIngresado: 200 } }) // caja abierta
            .mockResolvedValueOnce({ data: { 'Producto A': 10, 'Producto B': 20 } }) // top 5 productos
            .mockResolvedValueOnce({ data: [{ mes: 1, cantidad_ventas: 100 }] }) // ventas por mes
            .mockResolvedValueOnce({ data: [{ mes: 1, ingresos: 1000 }] }) // ingresos mensuales
            .mockResolvedValueOnce({ data: [{ mes: 1, gastos: 500 }] }) // gastos mensuales
            .mockResolvedValueOnce({ data: [{ nombre: 'Empresa A', facturas_count: 10 }] }); // empresas facturas

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);
            expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });
    });
});
