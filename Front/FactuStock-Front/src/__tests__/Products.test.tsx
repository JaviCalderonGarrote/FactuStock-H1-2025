import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import Products from '../pages/Products';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import selectEvent from 'react-select-event';

vi.mock('axios');
vi.mock('sweetalert2');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockAxios = axios as vi.MockedObject<typeof axios>;

const renderComponent = () =>
    render(
        <BrowserRouter>
            <Products />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('Products', () => {
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
        expect(await screen.findByText('Error al obtener los productos.')).toBeInTheDocument();
    });

    it('carga y muestra los productos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 3, nombre: 'Producto A', precio: 10, cantidadStock: 100, iva: 21, categoria: { id: 1, nombre: 'Categoría A' } },
                    { id: 1, nombre: 'Producto B', precio: 20, cantidadStock: 200, iva: 10, categoria: { id: 2, nombre: 'Categoría B' } },
                ],
            })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Categoría A' }, { id: 2, nombre: 'Categoría B' }] });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Producto A')).toBeInTheDocument();
            expect(screen.getByText('Producto B')).toBeInTheDocument();
        });
    });

    it('puede buscar productos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [{ id: 1, nombre: 'Producto A', precio: 10, cantidadStock: 100, iva: 21, categoria: { id: 1, nombre: 'Categoría A' } }],
            })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Categoría A' }] });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Producto A');

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
                target: { value: 'xyz' },
            });
        });

        expect(screen.getByText('No hay productos disponibles.')).toBeInTheDocument();
    });

    it('abre y cierra el modal correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [] });

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Agregar Producto'));
        });
        expect(await screen.findByText('Guardar Producto')).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByText('Cerrar'));
        });
        await waitFor(() => {
            expect(screen.queryByText('Guardar Producto')).not.toBeInTheDocument();
        });
    });



    it('edita un producto existente', async () => {
        const producto = { id: 5, nombre: 'Producto A', precio: 10, cantidadStock: 100, iva: 21, categoria: { id: 1, nombre: 'Categoría A' } };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [producto] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Categoría A' }] })
            .mockResolvedValueOnce({ data: [{ id: 5, nombre: 'Producto A Editado', precio: 15, cantidadStock: 150, iva: 10, categoria: { id: 1, nombre: 'Categoría A' } }] });

        mockAxios.put.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Producto A');

        await act(async () => {
            fireEvent.click(screen.getByText('✏️'));
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Producto A Editado' } });
            fireEvent.change(screen.getByLabelText('Precio'), { target: { value: '15' } });
            fireEvent.change(screen.getByLabelText('Cantidad en Stock'), { target: { value: '150' } });
            fireEvent.change(screen.getByLabelText('IVA (%)'), { target: { value: '10' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Guardar Cambios'));
        });

        await waitFor(() => {
            expect(mockAxios.put).toHaveBeenCalledWith(
                `http://localhost:8080/productos/5`,
                expect.objectContaining({ nombre: 'Producto A Editado' }),
                expect.anything()
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Producto A Editado')).toBeInTheDocument();
        });
    });

    it('elimina un producto', async () => {
        const producto = { id: 2, nombre: 'Producto B', precio: 20, cantidadStock: 200, iva: 10, categoria: { id: 2, nombre: 'Categoría B' } };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [producto] })
            .mockResolvedValueOnce({ data: [{ id: 2, nombre: 'Categoría B' }] });

        mockAxios.delete.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Producto B');

        await act(async () => {
            fireEvent.click(screen.getByText('🗑️'));
        });

        await waitFor(() => {
            expect(mockAxios.delete).toHaveBeenCalledWith(
                `http://localhost:8080/productos/2`,
                expect.anything()
            );
        });

        await waitFor(() => {
            expect(screen.queryByText('Producto B')).not.toBeInTheDocument();
        });
    });

});
