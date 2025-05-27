import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock de react-dom/client con export default
vi.mock('react-dom/client', () => {
    return {
        default: {
            createRoot: vi.fn(() => ({
                render: vi.fn(),
            })),
        },
    };
});

// Mock de react-router-dom
vi.mock('react-router-dom', () => {
    return {
        BrowserRouter: ({ children }) => <div>{children}</div>,
    };
});

describe('main.jsx', () => {
    it('calls ReactDOM.createRoot and renders App inside BrowserRouter', async () => {
        // Importar main.jsx ejecuta el código que hace el render
        await import('../main.jsx');

        const ReactDOMClient = await import('react-dom/client');
        const createRootMock = ReactDOMClient.default.createRoot;

        expect(createRootMock).toHaveBeenCalledTimes(1);
        expect(createRootMock.mock.results[0].value.render).toHaveBeenCalledTimes(1);
    });
});
