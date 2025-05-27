import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import CategoryProducts from '../pages/CategoryProducts';
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
            <CategoryProducts />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('CategoryProducts', () => {
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
        expect(await screen.findByText('Error al obtener las categorías.')).toBeInTheDocument();
    });

    it('carga y muestra las categorías', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 3, nombre: 'Bebidas' },
                    { id: 1, nombre: 'Comida' },
                ],
            });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Bebidas')).toBeInTheDocument();
            expect(screen.getByText('Comida')).toBeInTheDocument();
        });
    });

    it('puede buscar categorías', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [{ id: 1, nombre: 'Lácteos' }],
            });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Lácteos');

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
                target: { value: 'xyz' },
            });
        });

        expect(screen.getByText('No hay categorías de productos disponibles.')).toBeInTheDocument();
    });

    it('abre y cierra el modal correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({ data: [] });

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Agregar Categoría de Producto/i));
        });
        expect(await screen.findByText(/Guardar Categoría/)).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByText(/Cerrar/i));
        });
        await waitFor(() => {
            expect(screen.queryByText(/Guardar Categoría/)).not.toBeInTheDocument();
        });
    });

    it('crea una categoría nueva', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [{ id: 1, nombre: 'Snacks' }] });

        mockAxios.post.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Agregar Categoría de Producto/i));
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Snacks' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Guardar Categoría/));
        });

        await waitFor(() => {
            expect(mockAxios.post).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByText('Snacks')).toBeInTheDocument();
        });
    });

    it('edita una categoría existente', async () => {
        const categoria = { id: 5, nombre: 'Abarrotes' };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [categoria] })
            .mockResolvedValueOnce({ data: [{ id: 5, nombre: 'Abarrotes Editado' }] });

        mockAxios.put.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Abarrotes');

        await act(async () => {
            fireEvent.click(screen.getByText('✏️'));
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Abarrotes Editado' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Guardar Cambios/));
        });

        await waitFor(() => {
            expect(mockAxios.put).toHaveBeenCalledWith(
                `http://localhost:8080/categoriasProducto/5`,
                expect.objectContaining({ nombre: 'Abarrotes Editado' }),
                expect.anything()
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Abarrotes Editado')).toBeInTheDocument();
        });
    });

    it('elimina una categoría', async () => {
        const categoria = { id: 2, nombre: 'Verduras' };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [categoria] });

        mockAxios.delete.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Verduras');

        await act(async () => {
            fireEvent.click(screen.getByText('🗑️'));
        });

        await waitFor(() => {
            expect(mockAxios.delete).toHaveBeenCalledWith(
                `http://localhost:8080/categoriasProducto/2`,
                expect.anything()
            );
        });

        await waitFor(() => {
            expect(screen.queryByText('Verduras')).not.toBeInTheDocument();
        });
    });

    it('muestra paginación y cambia página', async () => {
        const categorias = Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            nombre: `Cat${i + 1}`,
        }));

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: categorias });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Cat12');

        await act(async () => {
            fireEvent.click(screen.getByText('2'));
        });

        await waitFor(() => {
            expect(screen.getByText('Cat3')).toBeInTheDocument();
        });
    });

    it('valida nombre obligatorio al crear', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] });

        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as any);

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Agregar Categoría de Producto/i));
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Guardar Categoría/i));
        });

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                'Error',
                'El nombre de la categoría es obligatorio.',
                'error'
            );
        });
    });
});
