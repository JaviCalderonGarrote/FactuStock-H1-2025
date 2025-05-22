package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Rol;
import IDP_H1.FactuStock.Entities.Usuario;
import IDP_H1.FactuStock.Services.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioControllerTest {

  @Mock
  private UsuarioService usuarioService;

  @InjectMocks
  private UsuarioController usuarioController;

  private Usuario usuario;

  @BeforeEach
  void setup() {
    MockitoAnnotations.openMocks(this);

    usuario = Usuario.builder()
            .id(1L)
            .username("usuario1")
            .nombre("Nombre")
            .apellido("Apellido")
            .mail("email@test.com")
            .telefono("123456789")
            .rol(Rol.Administrador)  // Usamos el enum correcto
            .password("password")
            .build();
  }

  @Test
  void obtenerTodos_debeRetornarLista() {
    when(usuarioService.obtenerTodos()).thenReturn(List.of(usuario));

    ResponseEntity<List<Usuario>> response = usuarioController.obtenerTodos();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertFalse(response.getBody().isEmpty());
    verify(usuarioService).obtenerTodos();
  }

  @Test
  void obtenerPorId_usuarioExistente_retornaOk() {
    when(usuarioService.obtenerPorId(1L)).thenReturn(Optional.of(usuario));

    ResponseEntity<Usuario> response = usuarioController.obtenerPorId(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(usuario, response.getBody());
  }

  @Test
  void obtenerPorId_usuarioNoExistente_retornaNotFound() {
    when(usuarioService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Usuario> response = usuarioController.obtenerPorId(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void obtenerPorUsername_usuarioExistente_retornaOk() {
    when(usuarioService.obtenerPorUsername("usuario1")).thenReturn(Optional.of(usuario));

    ResponseEntity<Usuario> response = usuarioController.obtenerPorUsername("usuario1");

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(usuario, response.getBody());
  }

  @Test
  void obtenerPorUsername_usuarioNoExistente_retornaNotFound() {
    when(usuarioService.obtenerPorUsername("usuario1")).thenReturn(Optional.empty());

    ResponseEntity<Usuario> response = usuarioController.obtenerPorUsername("usuario1");

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
  }

  @Test
  void guardar_usuarioValido_retornaCreated() {
    when(usuarioService.guardar(usuario)).thenReturn(usuario);

    ResponseEntity<Usuario> response = usuarioController.guardar(usuario);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(usuario, response.getBody());
  }

  @Test
  void actualizar_usuarioExistente_retornaOk() {
    Usuario datosActualizados = Usuario.builder()
            .nombre("NuevoNombre")
            .apellido("NuevoApellido")
            .mail("nuevo@mail.com")
            .telefono("987654321")
            .rol(Rol.Gerente)  // Aquí otro rol válido
            .build();

    when(usuarioService.obtenerPorId(1L)).thenReturn(Optional.of(usuario));
    when(usuarioService.guardar(any())).thenReturn(usuario);

    ResponseEntity<Usuario> response = usuarioController.actualizar(1L, datosActualizados);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(usuarioService).guardar(any());
  }

  @Test
  void actualizar_usuarioNoExistente_retornaNotFound() {
    Usuario datosActualizados = new Usuario();

    when(usuarioService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Usuario> response = usuarioController.actualizar(1L, datosActualizados);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
  }

  @Test
  void eliminar_usuarioExistente_retornaNoContent() {
    when(usuarioService.obtenerPorId(1L)).thenReturn(Optional.of(usuario));
    doNothing().when(usuarioService).eliminar(1L);

    ResponseEntity<Void> response = usuarioController.eliminar(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    verify(usuarioService).eliminar(1L);
  }

  @Test
  void eliminar_usuarioNoExistente_retornaNotFound() {
    when(usuarioService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Void> response = usuarioController.eliminar(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
  }

  @Test
  void cambiarPassword_cambiosCorrectos_retornaOk() {
    Map<String, String> request = Map.of("oldPassword", "old", "newPassword", "new");

    when(usuarioService.cambiarPassword(1L, "old", "new")).thenReturn(true);

    ResponseEntity<String> response = usuarioController.cambiarPassword(1L, request);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("Contraseña actualizada correctamente.", response.getBody());
  }

  @Test
  void cambiarPassword_faltanDatos_retornaBadRequest() {
    Map<String, String> request = Map.of("oldPassword", "old");

    ResponseEntity<String> response = usuarioController.cambiarPassword(1L, request);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
  }

  @Test
  void cambiarPassword_contraseñaIncorrecta_retornaBadRequest() {
    Map<String, String> request = Map.of("oldPassword", "old", "newPassword", "new");

    when(usuarioService.cambiarPassword(1L, "old", "new")).thenReturn(false);

    ResponseEntity<String> response = usuarioController.cambiarPassword(1L, request);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("Contraseña actual incorrecta.", response.getBody());
  }

  @Test
  void forgotPassword_usuarioExistente_enviaCorreo_retornaOk() throws Exception {
    Map<String, String> request = Map.of("usernameOrEmail", "usuario1");

    when(usuarioService.obtenerPorUsername("usuario1")).thenReturn(Optional.of(usuario));
    when(usuarioService.generatePasswordResetToken(usuario)).thenReturn("token");
    doNothing().when(usuarioService).sendPasswordResetEmail(usuario, "token");

    ResponseEntity<String> response = usuarioController.forgotPassword(request);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("Correo enviado con el enlace para restablecer la contraseña.", response.getBody());
  }

  @Test
  void forgotPassword_usuarioNoExistente_retornaNotFound() {
    Map<String, String> request = Map.of("usernameOrEmail", "usuario1");

    when(usuarioService.obtenerPorUsername("usuario1")).thenReturn(Optional.empty());
    when(usuarioService.obtenerPorEmail("usuario1")).thenReturn(Optional.empty());

    ResponseEntity<String> response = usuarioController.forgotPassword(request);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Usuario no encontrado.", response.getBody());
  }

  @Test
  void forgotPassword_faltanDatos_retornaBadRequest() {
    Map<String, String> request = new HashMap<>();

    ResponseEntity<String> response = usuarioController.forgotPassword(request);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
  }

  @Test
  void forgotPassword_errorEnvioCorreo_retornaServerError() throws Exception {
    Map<String, String> request = Map.of("usernameOrEmail", "usuario1");

    when(usuarioService.obtenerPorUsername("usuario1")).thenReturn(Optional.of(usuario));
    when(usuarioService.generatePasswordResetToken(usuario)).thenReturn("token");
    doThrow(new RuntimeException()).when(usuarioService).sendPasswordResetEmail(usuario, "token");

    ResponseEntity<String> response = usuarioController.forgotPassword(request);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertEquals("Error al enviar el correo.", response.getBody());
  }

  @Test
  void resetPassword_tokenValido_retornaOk() {
    Map<String, String> request = Map.of("token", "token123", "newPassword", "newPass");

    when(usuarioService.resetPasswordWithToken("token123", "newPass")).thenReturn(true);

    ResponseEntity<String> response = usuarioController.resetPassword(request);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("Contraseña restablecida correctamente.", response.getBody());
  }

  @Test
  void resetPassword_tokenInvalido_retornaBadRequest() {
    Map<String, String> request = Map.of("token", "token123", "newPassword", "newPass");

    when(usuarioService.resetPasswordWithToken("token123", "newPass")).thenReturn(false);

    ResponseEntity<String> response = usuarioController.resetPassword(request);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("Token inválido o expirado.", response.getBody());
  }

  @Test
  void resetPassword_faltanDatos_retornaBadRequest() {
    ResponseEntity<String> response = usuarioController.resetPassword(null);
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

    Map<String, String> incompleteRequest = Map.of("token", "token123");
    response = usuarioController.resetPassword(incompleteRequest);
    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
  }
}
