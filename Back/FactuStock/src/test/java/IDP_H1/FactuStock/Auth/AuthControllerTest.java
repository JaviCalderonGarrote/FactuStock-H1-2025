package IDP_H1.FactuStock.Auth;

import IDP_H1.FactuStock.Auth.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthControllerTest {

  @Mock
  private AuthService authService;

  @InjectMocks
  private AuthController authController;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void testLogin_Success() {
    LoginRequest request = new LoginRequest(); // Rellenar si tiene campos obligatorios
    AuthResponse expectedResponse = new AuthResponse(); // Simula la respuesta esperada

    when(authService.login(request)).thenReturn(expectedResponse);

    ResponseEntity<?> response = authController.login(request);

    assertEquals(200, response.getStatusCodeValue());
    assertSame(expectedResponse, response.getBody());
    verify(authService).login(request);
  }

  @Test
  public void testLogin_IllegalArgumentException() {
    LoginRequest request = new LoginRequest();
    String errorMsg = "Invalid login";

    when(authService.login(request)).thenThrow(new IllegalArgumentException(errorMsg));

    ResponseEntity<?> response = authController.login(request);

    assertEquals(400, response.getStatusCodeValue());
    assertTrue(response.getBody() instanceof ErrorResponse);
    assertEquals(errorMsg, ((ErrorResponse)response.getBody()).getMessage());
    verify(authService).login(request);
  }

  @Test
  public void testLogin_GenericException() {
    LoginRequest request = new LoginRequest();

    when(authService.login(request)).thenThrow(new RuntimeException("Unexpected error"));

    ResponseEntity<?> response = authController.login(request);

    assertEquals(500, response.getStatusCodeValue());
    assertTrue(response.getBody() instanceof ErrorResponse);
    assertEquals("Error en el inicio de sesión", ((ErrorResponse)response.getBody()).getMessage());
    verify(authService).login(request);
  }

  @Test
  public void testRegister_Success() {
    RegisterRequest request = new RegisterRequest(); // Rellenar si tiene campos obligatorios
    AuthResponse expectedResponse = new AuthResponse();

    when(authService.register(request)).thenReturn(expectedResponse);

    ResponseEntity<?> response = authController.register(request);

    assertEquals(200, response.getStatusCodeValue());
    assertSame(expectedResponse, response.getBody());
    verify(authService).register(request);
  }

  @Test
  public void testRegister_IllegalArgumentException() {
    RegisterRequest request = new RegisterRequest();
    String errorMsg = "Invalid register";

    when(authService.register(request)).thenThrow(new IllegalArgumentException(errorMsg));

    ResponseEntity<?> response = authController.register(request);

    assertEquals(400, response.getStatusCodeValue());
    assertTrue(response.getBody() instanceof ErrorResponse);
    assertEquals(errorMsg, ((ErrorResponse)response.getBody()).getMessage());
    verify(authService).register(request);
  }

  @Test
  public void testRegister_GenericException() {
    RegisterRequest request = new RegisterRequest();

    when(authService.register(request)).thenThrow(new RuntimeException("Unexpected error"));

    ResponseEntity<?> response = authController.register(request);

    assertEquals(500, response.getStatusCodeValue());
    assertTrue(response.getBody() instanceof ErrorResponse);
    assertEquals("Error en el registro", ((ErrorResponse)response.getBody()).getMessage());
    verify(authService).register(request);
  }

  @Test
  public void testSetMessageAndGetMessage() {
    String msg = "Test Message";
    authController.setMessage(msg);
    assertEquals(msg, authController.getMessage());
  }
}
