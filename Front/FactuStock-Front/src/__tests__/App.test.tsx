// src/__tests__/App.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock de los componentes de las páginas
vi.mock('../pages/login', () => ({ default: () => <div>Login Page</div> }));
vi.mock('../pages/Home', () => ({ default: () => <div>Home Page</div> }));
vi.mock('../pages/Facturas.jsx', () => ({ default: () => <div>Facturas Page</div> }));
vi.mock('../pages/NuevaFacturaComponent.jsx', () => ({ default: () => <div>Nueva Factura Page</div> }));
vi.mock('../pages/products.jsx', () => ({ default: () => <div>Products Page</div> }));
vi.mock('../pages/CategoryProducts.jsx', () => ({ default: () => <div>Category Products Page</div> }));
vi.mock('../pages/CategoryGasto.jsx', () => ({ default: () => <div>Category Gasto Page</div> }));
vi.mock('../pages/Organizacion.jsx', () => ({ default: () => <div>Organizacion Page</div> }));
vi.mock('../pages/Perfil.jsx', () => ({ default: () => <div>Perfil Page</div> }));
vi.mock('../pages/Clientes.jsx', () => ({ default: () => <div>Clientes Page</div> }));
vi.mock('../pages/ResetPassword.jsx', () => ({ default: () => <div>Reset Password Page</div> }));
vi.mock('../pages/Registro.jsx', () => ({ default: () => <div>Registro Page</div> }));
vi.mock('../pages/Mail.jsx', () => ({ default: () => <div>Mail Page</div> }));
vi.mock('../pages/TPV.jsx', () => ({ default: () => <div>TPV Page</div> }));
vi.mock('../pages/Caja.jsx', () => ({ default: () => <div>Caja Page</div> }));
vi.mock('../pages/Gastos.jsx', () => ({ default: () => <div>Gastos Page</div> }));
vi.mock('../pages/ingresos.jsx', () => ({ default: () => <div>Ingresos Page</div> }));

describe('App Component', () => {
    it('renders login page by default', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders home page', () => {
        render(
            <MemoryRouter initialEntries={['/home']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders products page', () => {
        render(
            <MemoryRouter initialEntries={['/products']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Products Page')).toBeInTheDocument();
    });

    // Puedes añadir más tests para otras rutas aquí...

    it('renders ingresos page', () => {
        render(
            <MemoryRouter initialEntries={['/ingresos']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Ingresos Page')).toBeInTheDocument();
    });
});
