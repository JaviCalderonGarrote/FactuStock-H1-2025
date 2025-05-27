import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import CategoriaGastoComponent from '../pages/CategoryGasto';
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
            <CategoriaGastoComponent />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('CategoriaGastoComponent', () => {
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

    it('carga y muestra las categorías de gasto', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({
                data: [
                    { id: 3, nombre: 'Suministros' },
                    { id: 1, nombre: 'Salarios' },
                ],
            });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Suministros')).toBeInTheDocument();
            expect(screen.getByText('Salarios')).toBeInTheDocument();
        });
    });

    it('puede buscar categorías de gasto', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({
                data: [{ id: 1, nombre: 'Impuestos' }],
            });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Impuestos');

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
                target: { value: 'xyz' },
            });
        });

        expect(screen.getByText('No hay categorías de gasto disponibles.')).toBeInTheDocument();
    });

    it('abre y cierra el modal correctamente', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({ data: [] });

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Agregar Categoría/i));
        });
        expect(await screen.findByText(/Guardar Categoría/)).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByText(/Cerrar/i));
        });
        await waitFor(() => {
            expect(screen.queryByText(/Guardar Categoría/)).not.toBeInTheDocument();
        });
    });

    it('crea una categoría de gasto nueva', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] });

        mockAxios.post.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Agregar Categoría/i));
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Alquiler' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Guardar Categoría/));
        });

        await waitFor(() => {
            expect(mockAxios.post).toHaveBeenCalled();
        });

        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Categoría creada correctamente', 'success');
    });

    it('edita una categoría de gasto existente', async () => {
        const categoria = { id: 5, nombre: 'Servicios', organizacion: { id: 1 } };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [categoria] });

        mockAxios.put.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Servicios');

        await act(async () => {
            fireEvent.click(screen.getByText('✏️'));
        });

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Servicios Editado' } });
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/Guardar Cambios/));
        });

        await waitFor(() => {
            expect(mockAxios.put).toHaveBeenCalledWith(
                `http://localhost:8080/categoriasgasto/5`,
                expect.objectContaining({ nombre: 'Servicios Editado' }),
                expect.anything()
            );
        });

        expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Categoría actualizada correctamente', 'success');
    });

    it('elimina una categoría de gasto', async () => {
        const categoria = { id: 2, nombre: 'Mantenimiento' };

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [categoria] });

        mockAxios.delete.mockResolvedValueOnce({});
        vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as any);

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('Mantenimiento');

        await act(async () => {
            fireEvent.click(screen.getByText('🗑️'));
        });

        await waitFor(() => {
            expect(mockAxios.delete).toHaveBeenCalledWith(
                `http://localhost:8080/categoriasgasto/2`,
                expect.anything()
            );
        });

        expect(Swal.fire).toHaveBeenCalledWith('Eliminada', 'La categoría ha sido eliminada correctamente', 'success');
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
});
