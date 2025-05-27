import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest';
import IngresosComponent from '../pages/ingresos';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

vi.mock('axios');
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

const mockAxios = axios as vi.Mocked<typeof axios>;

const renderComponent = () =>
    render(
        <BrowserRouter>
            <IngresosComponent />
        </BrowserRouter>
    );

const TOKEN = `header.${btoa(JSON.stringify({ idUsuario: 1 }))}.signature`;

describe('IngresosComponent', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('authToken', TOKEN);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renderiza Sidebar', () => {
        renderComponent();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('muestra error si no hay token', async () => {
        localStorage.removeItem('authToken');
        renderComponent();
        expect(
            await screen.findByText(
                'No se encontró un token de autenticación. Por favor, inicie sesión nuevamente.'
            )
        ).toBeInTheDocument();
    });

    it('muestra error si el token es inválido (formato JSON incorrecto)', async () => {
        localStorage.setItem('authToken', 'header.invalidjson.signature');
        renderComponent();
        expect(
            await screen.findByText(
                'Error al obtener los ingresos. Por favor, intente de nuevo más tarde.'
            )
        ).toBeInTheDocument();
    });

    it('muestra error si el token no tiene idUsuario', async () => {
        const badToken = `header.${btoa(JSON.stringify({ noUsuario: 123 }))}.signature`;
        localStorage.setItem('authToken', badToken);
        renderComponent();
        expect(await screen.findByText('ID de usuario no encontrado en el token.')).toBeInTheDocument();
    });

    it('muestra error si axios rechaza la consulta de usuario', async () => {
        mockAxios.get.mockRejectedValueOnce(new Error('Error axios usuario'));
        renderComponent();
        expect(
            await screen.findByText(
                'Error al obtener los ingresos. Por favor, intente de nuevo más tarde.'
            )
        ).toBeInTheDocument();
    });

    it('carga y muestra los ingresos ordenados por id descendente', async () => {
        const ingresos = [
            { id: 3, monto: 100.5, fecha: '2023-05-23T10:30:00', caja: { nombre: 'Caja 1' } },
            { id: 1, monto: 200.75, fecha: '2023-05-22T15:45:00', factura: { numeroFactura: 'FAC001' } },
        ];

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 2 } } })
            .mockResolvedValueOnce({ data: ingresos });

        await act(async () => {
            renderComponent();
        });

        // Comprobamos valores de monto con dos decimales y símbolo €
        await waitFor(() => {
            expect(screen.getByText('100.50€')).toBeInTheDocument();
            expect(screen.getByText('200.75€')).toBeInTheDocument();
            expect(screen.getByText('Caja 1')).toBeInTheDocument();
            expect(screen.getByText('FAC001')).toBeInTheDocument();
        });

        // Verificar orden descendente por id (filas excepto encabezado)
        const filas = screen.getAllByRole('row');
        expect(filas[1]).toHaveTextContent('3');
        expect(filas[2]).toHaveTextContent('1');
    });

    it('puede buscar ingresos y muestra mensaje sin resultados', async () => {
        const ingresos = [
            { id: 1, monto: 100.5, fecha: '2023-05-23T10:30:00', caja: { nombre: 'Caja 1' } },
        ];

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: ingresos });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('100.50€');

        await act(async () => {
            fireEvent.change(screen.getByPlaceholderText('Buscar...'), {
                target: { value: 'xyz' },
            });
        });

        expect(screen.getByText('No hay ingresos disponibles.')).toBeInTheDocument();
    });

    it('muestra paginación con menos de 5 páginas sin ellipsis', async () => {
        // 12 ingresos (9 por página => 2 páginas)
        const ingresos = Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            monto: 100 * (i + 1),
            fecha: `2023-05-${23 - i}T10:30:00`,
            caja: { nombre: `Caja ${i + 1}` },
        }));

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: ingresos });

        await act(async () => {
            renderComponent();
        });

        await screen.findByText('1200.00€');

        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByText('2'));
        });

        await waitFor(() => {
            expect(screen.getByText('300.00€')).toBeInTheDocument();
        });
    });

    it('muestra paginación con más de 5 páginas y ellipsis', async () => {
        // 50 ingresos, 9 por página => 6 páginas aprox
        const ingresos = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            monto: 10 * (i + 1),
            fecha: `2023-05-${(i % 28) + 1}T10:30:00`,
            caja: { nombre: `Caja ${i + 1}` },
        }));

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: ingresos });

        let container;
        await act(async () => {
            const renderResult = renderComponent();
            container = renderResult.container;
        });

        // Ver botones de páginas
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();

        // Comprobar que hay al menos un ellipsis ("...") mediante aria-label
        const ellipsis = screen.getAllByLabelText('ellipsis');
        expect(ellipsis.length).toBeGreaterThanOrEqual(1);

        // Cambiar a página 4
        await act(async () => {
            fireEvent.click(screen.getByText('6'));
        });

        expect(screen.getByText('6')).toHaveClass('active');
    });



    it('ordena los ingresos por ID descendente', async () => {
        const ingresos = [
            { id: 1, monto: 100.5, fecha: '2023-05-23T10:30:00', caja: { nombre: 'Caja 1' } },
            { id: 3, monto: 300.75, fecha: '2023-05-22T15:45:00', caja: { nombre: 'Caja 2' } },
            { id: 2, monto: 200.25, fecha: '2023-05-21T09:15:00', caja: { nombre: 'Caja 3' } },
        ];

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: ingresos });

        await act(async () => {
            renderComponent();
        });

        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('3');
        expect(rows[2]).toHaveTextContent('2');
        expect(rows[3]).toHaveTextContent('1');
    });

    it('maneja correctamente un array vacío de ingresos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: [] });

        await act(async () => {
            renderComponent();
        });

        expect(screen.getByText('No hay ingresos disponibles.')).toBeInTheDocument();
    });

    it('maneja correctamente errores en la respuesta de ingresos', async () => {
        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockRejectedValueOnce(new Error('Error al obtener ingresos'));

        await act(async () => {
            renderComponent();
        });

        expect(
            screen.getByText(
                'Error al obtener los ingresos. Por favor, intente de nuevo más tarde.'
            )
        ).toBeInTheDocument();
    });
    it('cambia estilos del input de búsqueda al enfocar y desenfocar', async () => {
        const ingresos = [
            { id: 1, monto: 100.5, fecha: '2023-05-23T10:30:00', caja: { nombre: 'Caja 1' } },
        ];

        mockAxios.get
            .mockResolvedValueOnce({ data: { id: 1, organizacion: { id: 1 } } })
            .mockResolvedValueOnce({ data: ingresos });

        await act(async () => {
            renderComponent();
        });

        const input = screen.getByPlaceholderText('Buscar...');

        // Estilo inicial sin focus ni texto: fondo azul, texto blanco
        expect(input).toHaveStyle({ backgroundColor: '#6f9fd7', color: '#fff' });

        // Simular focus
        fireEvent.focus(input);
        expect(input).toHaveStyle({ backgroundColor: '#ffffff', color: '#000' });

        // Simular blur sin texto
        fireEvent.blur(input);
        expect(input).toHaveStyle({ backgroundColor: '#6f9fd7', color: '#fff' });

        // Ingresar texto para que el input tenga valor
        fireEvent.change(input, { target: { value: 'Caja' } });
        // Ahora, aunque pierda el focus, los estilos deben reflejar que hay texto
        fireEvent.blur(input);
        expect(input).toHaveStyle({ backgroundColor: '#ffffff', color: '#000' });
    });


});
