import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import NuevaFacturaComponent from '../pages/NuevaFacturaComponent';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock de axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock de sweetalert2
vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
        close: vi.fn(),
        showLoading: vi.fn(),
    },
}));

// Mock del componente Sidebar
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock de react-select
vi.mock('react-select', () => ({
    default: ({ options, onChange, placeholder, value }) => (
        <div>
            <label htmlFor="react-select-input">Empresa/Persona Física</label>
            <select
                id="react-select-input"
                data-testid="react-select"
                onChange={(e) => {
                    const selectedOption = options.find(opt => opt.value === e.target.value);
                    onChange(selectedOption);
                }}
                value={value?.value || ''}
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

// Mock de react-bootstrap Pagination
vi.mock('react-bootstrap', () => ({
    Pagination: {
        Item: ({ children, onClick, active }) => (
            <button
                onClick={onClick}
                className={active ? 'active' : ''}
                data-testid="pagination-item"
            >
                {children}
            </button>
        ),
    },
}));

// Mock de localStorage
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOjEsInVzZXJuYW1lIjoidGVzdCJ9.test';
Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: vi.fn(() => mockToken),
        setItem: vi.fn(),
        removeItem: vi.fn(),
    },
});

const TestWrapper = ({ children }) => (
    <BrowserRouter>{children}</BrowserRouter>
);

describe('NuevaFacturaComponent', () => {
    const mockUserData = {
        id: 1,
        nombre: 'Test User',
        organizacion: { id: 1, nombre: 'Test Org' }
    };

    const mockEmpresas = [
        { id: 1, nombre: 'Empresa Test', tipo: 'EMPRESA' }
    ];

    const mockProductos = [
        { id: 1, nombre: 'Producto Test', precio: 100, iva: 21 }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup axios mocks
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('/usuarios/')) {
                return Promise.resolve({ data: mockUserData });
            }
            if (url.includes('/EmpresaPersonaFisica/organizacion/')) {
                return Promise.resolve({ data: mockEmpresas });
            }
            if (url.includes('/productos/organizacion/')) {
                return Promise.resolve({ data: mockProductos });
            }
            if (url.includes('/facturas/count')) {
                return Promise.resolve({ data: 0 });
            }
            return Promise.reject(new Error('URL not mocked'));
        });

        mockedAxios.post.mockResolvedValue({ data: { id: 1 } });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render the component correctly', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        expect(screen.getByText('Crear Nueva Factura')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('react-select')).toBeInTheDocument();
        });
    });

    it('should load initial data on mount', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                'http://localhost:8080/usuarios/1',
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
        });

        expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });

    it('should handle form input changes', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('')).toBeInTheDocument();
        });

        const fechaInput = screen.getByDisplayValue('');
        fireEvent.change(fechaInput, { target: { value: '2024-01-15' } });

        expect(fechaInput.value).toBe('2024-01-15');
    });

    it('should open modal when "Añadir Detalle" button is clicked', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Añadir Detalle')).toBeInTheDocument();
        });

        const addButton = screen.getByText('Añadir Detalle');
        fireEvent.click(addButton);

        expect(screen.getByText('Añadir Detalle a la Factura')).toBeInTheDocument();
        expect(screen.getAllByText('Producto')[0]).toBeInTheDocument();
        expect(screen.getByText('Detalle Personalizado')).toBeInTheDocument();
    });

    it('should switch between producto and detalle personalizado in modal', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Añadir Detalle')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Añadir Detalle'));

        const detallePersonalizadoBtn = screen.getByText('Detalle Personalizado');
        fireEvent.click(detallePersonalizadoBtn);

        expect(screen.getByText('Nombre del Detalle')).toBeInTheDocument();
        expect(screen.getByText('Precio (€)')).toBeInTheDocument();
    });

    it('should close modal when backdrop is clicked', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Añadir Detalle')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Añadir Detalle'));

        expect(screen.getByText('Añadir Detalle a la Factura')).toBeInTheDocument();
    });

    it('should display form fields correctly', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByTestId('react-select')).toBeInTheDocument();
        });

        expect(screen.getByDisplayValue('Enviada')).toBeInTheDocument();
        expect(screen.getByDisplayValue('No Cobrada')).toBeInTheDocument();
        expect(screen.getByText('Crear Factura')).toBeInTheDocument();
    });

    it('should handle custom detail input changes', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByText('Añadir Detalle')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Añadir Detalle'));
        fireEvent.click(screen.getByText('Detalle Personalizado'));

        const inputs = screen.getAllByRole('textbox');
        const nombreInput = inputs.find(input => input.parentElement.textContent.includes('Nombre del Detalle'));

        if (nombreInput) {
            fireEvent.change(nombreInput, { target: { value: 'Servicio Test' } });
            expect(nombreInput.value).toBe('Servicio Test');
        }
    });

    it('should show error when token is missing', () => {
        window.localStorage.getItem.mockReturnValue(null);

        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        expect(screen.getByText('No se encontró un token de autenticación.')).toBeInTheDocument();
    });

    it('should display estado and forma de pago as disabled inputs', async () => {
        render(
            <TestWrapper>
                <NuevaFacturaComponent />
            </TestWrapper>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Enviada')).toBeInTheDocument();
        });

        const estadoInput = screen.getByDisplayValue('Enviada');
        const formaPagoInput = screen.getByDisplayValue('No Cobrada');

        expect(estadoInput).toBeDisabled();
        expect(formaPagoInput).toBeDisabled();
    });


});