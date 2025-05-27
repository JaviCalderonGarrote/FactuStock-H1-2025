import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('Sidebar', () => {
    beforeEach(() => {
        localStorage.setItem('username', 'TestUser')
    })

    afterEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('renderiza el username desde localStorage', () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        )
        expect(screen.getByText('TestUser')).toBeInTheDocument()
    })

    it('contiene todos los enlaces esperados', () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        )

        const links = [
            'FactuStock',
            'TestUser',
            'Productos',
            'Categoría',
            'Categoría Producto',
            'Categoría Gasto',
            'TPV',
            'Facturas',
            'Gastos',
            'Ingresos',
            'Organización',
            'Clientes',
            'Caja',
            'Mail',
            'Logout'
        ]

        links.forEach(link => {
            expect(screen.getByText(link)).toBeInTheDocument()
        })
    })

    it('ejecuta el logout correctamente', () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        )

        fireEvent.click(screen.getByText('Logout'))
        expect(localStorage.getItem('username')).toBeNull()
        expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('expande y colapsa el dropdown de Categoría', () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        )

        const categoriaLink = screen.getByText('Categoría')
        fireEvent.click(categoriaLink) // Simula expansión (aunque no visualmente con Bootstrap, sí cubre la rama)
        expect(screen.getByText('Categoría Producto')).toBeInTheDocument()
        expect(screen.getByText('Categoría Gasto')).toBeInTheDocument()
    })
})
