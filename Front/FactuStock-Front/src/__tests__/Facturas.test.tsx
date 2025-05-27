import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FacturaComponent from '../pages/facturas';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const MOCK_TOKEN = 'header.eyJpZFVzdWFyaW8iOjF9.signature';

describe('FacturaComponent', () => {
    beforeEach(() => {
        localStorage.setItem('authToken', MOCK_TOKEN);
    });

    afterEach(() => {
        vi.resetAllMocks();
        localStorage.clear();
    });

    it('renders correctly and fetches data', async () => {
        const mockFacturas = [
            { id: 1, numeroFactura: 'F001', estado: 'ENVIADA', formaPago: 'NoCobrada' },
            { id: 2, numeroFactura: 'F002', estado: 'COMPLETADA', formaPago: 'EFECTIVO' }
        ];

        axios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: { organizacion: { id: 1 } } });
            } else if (url.includes('/facturas/organizacion/')) {
                return Promise.resolve({ data: mockFacturas });
            }
            return Promise.reject(new Error('Not found'));
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <FacturaComponent />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Facturas Emitidas')).toBeInTheDocument();
            expect(screen.getByText('F001')).toBeInTheDocument();
            expect(screen.getByText('F002')).toBeInTheDocument();
        });
    });

    it('filters facturas based on search query', async () => {
        const mockFacturas = [
            { id: 1, numeroFactura: 'F001', estado: 'ENVIADA', formaPago: 'NoCobrada' },
            { id: 2, numeroFactura: 'F002', estado: 'COMPLETADA', formaPago: 'EFECTIVO' }
        ];

        axios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: { organizacion: { id: 1 } } });
            } else if (url.includes('/facturas/organizacion/')) {
                return Promise.resolve({ data: mockFacturas });
            }
            return Promise.reject(new Error('Not found'));
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <FacturaComponent />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('F001')).toBeInTheDocument();
            expect(screen.getByText('F002')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Buscar...');
        fireEvent.change(searchInput, { target: { value: 'F001' } });

        await waitFor(() => {
            expect(screen.getByText('F001')).toBeInTheDocument();
            expect(screen.queryByText('F002')).not.toBeInTheDocument();
        });
    });

    it('opens edit modal and updates factura', async () => {
        const mockFactura = { id: 1, numeroFactura: 'F001', estado: 'ENVIADA', formaPago: 'NoCobrada' };

        axios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: { organizacion: { id: 1 } } });
            } else if (url.includes('/facturas/organizacion/')) {
                return Promise.resolve({ data: [mockFactura] });
            }
            return Promise.reject(new Error('Not found'));
        });

        axios.put.mockResolvedValueOnce({});

        await act(async () => {
            render(
                <BrowserRouter>
                    <FacturaComponent />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('F001')).toBeInTheDocument();
        });

        const editButton = screen.getByTitle('Editar Factura');
        fireEvent.click(editButton);

        await waitFor(() => {
            expect(screen.getByText('Editar Factura')).toBeInTheDocument();
        });

        const estadoSelect = screen.getByLabelText('Estado');
        const formaPagoSelect = screen.getByLabelText('Forma de Pago');

        fireEvent.change(estadoSelect, { target: { value: 'COMPLETADA' } });
        fireEvent.change(formaPagoSelect, { target: { value: 'EFECTIVO' } });

        fireEvent.click(screen.getByText('Guardar Cambios'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:8080/facturas/1',
                expect.objectContaining({
                    estado: 'COMPLETADA',
                    formaPago: 'EFECTIVO',
                }),
                expect.anything()
            );
        });
    });

    it('handles download of factura PDF', async () => {
        const mockFactura = { id: 1, numeroFactura: 'F001' };

        axios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: { organizacion: { id: 1 } } });
            } else if (url.includes('/facturas/organizacion/')) {
                return Promise.resolve({ data: [mockFactura] });
            } else if (url.includes('/facturas/1/pdf')) {
                return Promise.resolve({ data: new Blob(['pdf content']) });
            }
            return Promise.reject(new Error('Not found'));
        });

        global.URL.createObjectURL = vi.fn();
        global.URL.revokeObjectURL = vi.fn();

        await act(async () => {
            render(
                <BrowserRouter>
                    <FacturaComponent />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('F001')).toBeInTheDocument();
        });

        const downloadButton = screen.getByTitle('Descargar PDF');
        fireEvent.click(downloadButton);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                'http://localhost:8080/facturas/1/pdf',
                expect.anything()
            );
            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });
    });

    it('navigates to nueva-factura page', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: { organizacion: { id: 1 } } });
            } else if (url.includes('/facturas/organizacion/')) {
                return Promise.resolve({ data: [] });
            }
            return Promise.reject(new Error('Not found'));
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <FacturaComponent />
                </BrowserRouter>
            );
        });

        const createButton = screen.getByText(/crear nueva factura/i);
        fireEvent.click(createButton);

        expect(mockNavigate).toHaveBeenCalledWith('/nueva-factura');
    });

    it('handles pagination', async () => {
        const mockFacturas = Array(20).fill().map((_, index) => ({
            id: index + 1,
            numeroFactura: `F00${index + 1}`,
        }));

        axios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: { organizacion: { id: 1 } } });
            } else if (url.includes('/facturas/organizacion/')) {
                return Promise.resolve({ data: mockFacturas });
            }
            return Promise.reject(new Error('Not found'));
        });

        await act(async () => {
            render(
                <BrowserRouter>
                    <FacturaComponent />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('F001')).toBeInTheDocument();
        });

        const nextPageButton = screen.getByText('2');
        fireEvent.click(nextPageButton);

        await waitFor(() => {
            expect(screen.getByText('F0010')).toBeInTheDocument();
            expect(screen.queryByText('F001')).not.toBeInTheDocument();
        });
    });

    it('handles error when fetching data', async () => {
        axios.get.mockRejectedValue(new Error('API Error'));

        await act(async () => {
            render(
                <BrowserRouter>
                    <FacturaComponent />
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Error al obtener las facturas.')).toBeInTheDocument();
        });
    });
});
