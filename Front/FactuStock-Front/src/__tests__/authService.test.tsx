import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import auth from "../services/authService";

describe("auth service", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("login exitoso guarda token y username en localStorage", async () => {
        const fakeToken = "token123";
        const username = "testuser";

        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(JSON.stringify({ token: fakeToken }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                })
            )
        );

        const token = await auth.login(username, "pass");
        expect(token).toBe(fakeToken);
        expect(localStorage.getItem("authToken")).toBe(fakeToken);
        expect(localStorage.getItem("username")).toBe(username);
    });

    it("login falla si response no es ok", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response("Unauthorized", {
                    status: 401,
                    statusText: "Unauthorized",
                })
            )
        );

        await expect(auth.login("user", "wrongpass")).rejects.toThrow(
            /Error: Unauthorized/
        );
    });

    it("login falla si no recibe token en respuesta", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(JSON.stringify({}), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                })
            )
        );

        await expect(auth.login("user", "pass")).rejects.toThrow("Token no recibido");
    });

    it("sendPasswordResetEmail exitoso devuelve texto de respuesta", async () => {
        const responseText = "Correo enviado";

        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(responseText, {
                    status: 200,
                    headers: { "Content-Type": "text/plain" },
                })
            )
        );

        const res = await auth.sendPasswordResetEmail("user@example.com");
        expect(res).toBe(responseText);
    });

    it("sendPasswordResetEmail falla si response no es ok", async () => {
        const errorText = "Error al enviar correo";

        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(errorText, {
                    status: 400,
                    statusText: "Bad Request",
                })
            )
        );

        await expect(auth.sendPasswordResetEmail("user@example.com")).rejects.toThrow(
            errorText
        );
    });

    it("register exitoso guarda token y username", async () => {
        const fakeToken = "regtoken456";
        const formData = { username: "newuser", password: "1234", organization: "Org" };

        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(JSON.stringify({ token: fakeToken }), {
                    status: 201,
                    headers: { "Content-Type": "application/json" },
                })
            )
        );

        const data = await auth.register(formData);
        expect(data.token).toBe(fakeToken);
        expect(localStorage.getItem("authToken")).toBe(fakeToken);
        expect(localStorage.getItem("username")).toBe(formData.username);
    });

    it("register falla si response no es ok", async () => {
        const errorMsg = "Error en registro";

        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(errorMsg, {
                    status: 400,
                    statusText: "Bad Request",
                })
            )
        );

        await expect(auth.register({})).rejects.toThrow(errorMsg);
    });

    it("isAuthenticated devuelve true si hay token en localStorage", () => {
        localStorage.setItem("authToken", "token");
        // Forzamos a booleano para evitar null/undefined
        expect(!!auth.isAuthenticated()).toBe(true);
    });

    it("isAuthenticated devuelve false si no hay token", () => {
        // Forzamos a booleano para evitar null/undefined
        expect(!!auth.isAuthenticated()).toBe(false);
    });

    it("logout elimina token y username de localStorage", () => {
        localStorage.setItem("authToken", "token");
        localStorage.setItem("username", "user");
        auth.logout();
        expect(localStorage.getItem("authToken")).toBeNull();
        expect(localStorage.getItem("username")).toBeNull();
    });

    it("getAuthToken devuelve token almacenado", () => {
        localStorage.setItem("authToken", "tokenXYZ");
        // Validamos que la función exista antes de llamar
        if (typeof auth.getAuthToken === "function") {
            expect(auth.getAuthToken()).toBe("tokenXYZ");
        } else {
            throw new Error("getAuthToken no está definido en authService");
        }
    });

    it("getAuthenticatedData exitoso devuelve datos", async () => {
        const fakeData = { protected: "info" };
        localStorage.setItem("authToken", "tokenXYZ");

        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(JSON.stringify(fakeData), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                })
            )
        );

        const data = await auth.getAuthenticatedData();
        expect(data).toEqual(fakeData);
    });

    it("getAuthenticatedData lanza error si no hay token", async () => {
        localStorage.removeItem("authToken");
        await expect(auth.getAuthenticatedData()).rejects.toThrow(
            "Usuario no autenticado"
        );
    });

    it("getAuthenticatedData lanza error si fetch no es ok", async () => {
        localStorage.setItem("authToken", "tokenXYZ");

        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response("Forbidden", {
                    status: 403,
                    statusText: "Forbidden",
                })
            )
        );

        await expect(auth.getAuthenticatedData()).rejects.toThrow(
            /Error al obtener datos protegidos: Forbidden/
        );
    });
    it("checkUsernameExists devuelve true/false según respuesta", async () => {
        const responseData = true;
        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(JSON.stringify(responseData), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                })
            )
        );

        const result = await auth.checkUsernameExists("someuser");
        expect(result).toBe(true);
    });

    it("checkUsernameExists lanza error si la respuesta falla", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response("Error", {
                    status: 500,
                    statusText: "Internal Server Error",
                })
            )
        );

        await expect(auth.checkUsernameExists("someuser")).rejects.toThrow(
            /Error al verificar username/
        );
    });

    it("checkEmailExists devuelve true/false según respuesta", async () => {
        const responseData = false;
        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response(JSON.stringify(responseData), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                })
            )
        );

        const result = await auth.checkEmailExists("email@example.com");
        expect(result).toBe(false);
    });

    it("checkEmailExists lanza error si la respuesta falla", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve(
                new Response("Error", {
                    status: 500,
                    statusText: "Internal Server Error",
                })
            )
        );

        await expect(auth.checkEmailExists("email@example.com")).rejects.toThrow(
            /Error al verificar email/
        );
    });

    it("decodeToken decodifica correctamente un token válido", () => {
        // Generamos un JWT simulado con payload { user: "test" }
        const payload = { user: "test" };
        const base64Payload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const fakeToken = `header.${base64Payload}.signature`;

        const result = auth.decodeToken(fakeToken);
        expect(result).toEqual(payload);
    });

    it("decodeToken devuelve null si el token es inválido", () => {
        const badToken = "malformed.token";
        const result = auth.decodeToken(badToken);
        expect(result).toBeNull();
    });

    it("getCurrentUser devuelve datos del token si existe", () => {
        const payload = { username: "testuser" };
        const base64Payload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const token = `header.${base64Payload}.signature`;

        localStorage.setItem("authToken", token);

        const result = auth.getCurrentUser();
        expect(result).toEqual(payload);
    });

    it("getCurrentUser devuelve null si no hay token", () => {
        localStorage.removeItem("authToken");
        expect(auth.getCurrentUser()).toBeNull();
    });


});
