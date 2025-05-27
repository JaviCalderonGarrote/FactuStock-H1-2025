import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import GastosComponent from '../pages/Gastos';
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
            <GastosComponent />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('GastosComponent', () => {
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

    it('muestra error si el token es inválido', async () => {
        localStorage.setItem('authToken', 'invalid.token.parts');
        mockAxios.get.mockRejectedValueOnce(new Error('Invalid token'));
        renderComponent();
        expect(await screen.findByText('Error al obtener los datos. Por favor, intente de nuevo más tarde.')).toBeInTheDocument();
    });

    it('carga y muestra los gastos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 1, numFactura: 'F001', empresaPersonaFisica: { nombre: 'Empresa A' }, categoriaGasto: { nombre: 'Categoría A' }, monto: 100, estado: 'RECIBIDO', formaPagoGasto: 'NO_PAGADA', fecha: '2023-01-01' },
                    { id: 2, numFactura: 'F002', empresaPersonaFisica: { nombre: 'Empresa B' }, categoriaGasto: { nombre: 'Categoría B' }, monto: 200, estado: 'COMPLETADO', formaPagoGasto: 'EFECTIVO', fecha: '2023-01-02' },
                ],
            })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Categoría A' }, { id: 2, nombre: 'Categoría B' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Empresa A' }, { id: 2, nombre: 'Empresa B' }] });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('F001')).toBeInTheDocument();
            expect(screen.getByText('F002')).toBeInTheDocument();
        });
    });

    it('puede buscar gastos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [{ id: 1, numFactura: 'F001', empresaPersonaFisica: { nombre: 'Empresa A' }, categoriaGasto: { nombre: 'Categoría A' }, monto: 100, estado: 'RECIBIDO', formaPagoGasto: 'NO_PAGADA', fecha: '2023-01-01' }],
            })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Categoría A' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Empresa A' }] });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('F001');

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
                target: { value: 'xyz' },
            });
        });

        expect(screen.queryByText('F001')).not.toBeInTheDocument();
    });

    it('abre y cierra el modal de nuevo gasto correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Añadir nuevo Gasto/i));
        });
        expect(await screen.findByText(/Nuevo Gasto/)).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByText(/Cerrar/i));
        });
        await waitFor(() => {
            expect(screen.queryByText(/Nuevo Gasto/)).not.toBeInTheDocument();
        });
    });





    it('descarga un archivo de factura', async () => {
        const gasto = { id: 1, numFactura: 'F001', empresaPersonaFisica: { nombre: 'Empresa A' }, categoriaGasto: { nombre: 'Categoría A' }, monto: 100, estado: 'RECIBIDO', formaPagoGasto: 'NO_PAGADA', fecha: '2023-01-01', nombreArchivoFactura: 'factura.pdf' };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [gasto] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Categoría A' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Empresa A' }] })
            .mockResolvedValueOnce({ data: new Blob(['fake pdf content'], { type: 'application/pdf' }) });

        global.URL.createObjectURL = vi.fn();

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('F001');

        await act(async () => {
            fireEvent.click(screen.getAllByTitle('Descargar Factura')[0]);
        });

        await waitFor(() => {
            expect(mockAxios.get).toHaveBeenCalledWith(
                `http://localhost:8080/gastos/1/archivo`,
                expect.objectContaining({ responseType: 'blob' })
            );
        });
    });
    it('edita un gasto existente correctamente', async () => {
        const gasto = {
            id: 1,
            numFactura: 'F001',
            empresaPersonaFisica: { nombre: 'Empresa A' },
            categoriaGasto: { nombre: 'Categoría A' },
            monto: 100,
            estado: 'RECIBIDO',
            formaPagoGasto: 'NO_PAGADA',
            fecha: '2023-01-01'
        };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [gasto] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Categoría A' }] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Empresa A' }] });

        mockAxios.put.mockResolvedValueOnce({ data: { ...gasto, estado: 'COMPLETADO', formaPagoGasto: 'EFECTIVO' } });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('F001');

        // Abrir modal de edición
        await act(async () => {
            fireEvent.click(screen.getAllByTitle('Editar Gasto')[0]);
        });

        // Cambiar estado y forma de pago
        await act(async () => {
            fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'COMPLETADO' } });
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Forma de Pago'), { target: { value: 'EFECTIVO' } });
        });

        // Guardar cambios
        await act(async () => {
            fireEvent.click(screen.getByText('Guardar Cambios'));
        });

        await waitFor(() => {
            expect(mockAxios.put).toHaveBeenCalledWith(
                'http://localhost:8080/gastos/1',
                expect.objectContaining({
                    estado: 'COMPLETADO',
                    formaPagoGasto: 'EFECTIVO'
                })
            );
        });

        // Verificar que el gasto se actualizó en la interfaz
        expect(await screen.findByText('Completado')).toBeInTheDocument();
        expect(await screen.findByText('Efectivo')).toBeInTheDocument();

        // Verificar que el modal se cerró
        expect(screen.queryByText('Editar Gasto')).not.toBeInTheDocument();

        // Verificar que se mostró el mensaje de éxito
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: 'success',
                title: 'Éxito',
                text: 'Gasto actualizado correctamente'
            })
        );
    });


});
