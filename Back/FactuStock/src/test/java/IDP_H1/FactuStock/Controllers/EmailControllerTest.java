package IDP_H1.FactuStock.Controllers;
import jakarta.mail.MessagingException;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailControllerTest {

  @InjectMocks
  private EmailController emailController;

  @Mock
  private JavaMailSender emailSender;

  @Mock
  private MimeMessage mimeMessage;

  @Mock
  private MultipartFile archivoMock;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    when(emailSender.createMimeMessage()).thenReturn(mimeMessage);
    // Inyectamos el mock manualmente para cubrir setter
    emailController.setEmailSender(emailSender);
  }

  @Test
  void enviarCorreo_conArchivo_exitoso() throws Exception {
    when(archivoMock.isEmpty()).thenReturn(false);
    when(archivoMock.getOriginalFilename()).thenReturn("archivo.txt");

    ResponseEntity<String> response = emailController.enviarCorreo(
            "cliente@dominio.com",
            "Asunto",
            "Mensaje HTML <b>importante</b>",
            archivoMock);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals("Correo enviado correctamente", response.getBody());

    verify(emailSender).createMimeMessage();
    verify(emailSender).send(mimeMessage);
  }

  @Test
  void enviarCorreo_sinArchivo_exitoso() throws Exception {
    ResponseEntity<String> response = emailController.enviarCorreo(
            "cliente@dominio.com",
            "Asunto",
            "Mensaje sin archivo",
            null);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals("Correo enviado correctamente", response.getBody());

    verify(emailSender).createMimeMessage();
    verify(emailSender).send(mimeMessage);
  }


  @Test
  void enviarCorreo_mensajeExceptionGenerica() throws Exception {
    when(emailSender.createMimeMessage()).thenThrow(new RuntimeException("Error runtime"));

    ResponseEntity<String> response = emailController.enviarCorreo(
            "cliente@dominio.com",
            "Asunto",
            "Mensaje",
            null);

    assertEquals(500, response.getStatusCodeValue());
    assertTrue(response.getBody().contains("Error inesperado al enviar el correo"));
  }

  @Test
  void enviarCorreoSimple_exitoso() {
    doNothing().when(emailSender).send(any(SimpleMailMessage.class));

    ResponseEntity<String> response = emailController.enviarCorreoSimple(
            "cliente@dominio.com",
            "Asunto simple",
            "Mensaje simple");

    assertEquals(200, response.getStatusCodeValue());
    assertEquals("Correo simple enviado correctamente", response.getBody());

    verify(emailSender).send(any(SimpleMailMessage.class));
  }

  @Test
  void enviarCorreoSimple_nullDestinatario() {
    NullPointerException ex = assertThrows(NullPointerException.class, () -> {
      emailController.enviarCorreoSimple(null, "Asunto", "Mensaje");
    });
    assertEquals("El destinatario no puede ser null", ex.getMessage());
  }

  @Test
  void enviarCorreoSimple_nullAsunto() {
    NullPointerException ex = assertThrows(NullPointerException.class, () -> {
      emailController.enviarCorreoSimple("cliente@dominio.com", null, "Mensaje");
    });
    assertEquals("El asunto no puede ser null", ex.getMessage());
  }

  @Test
  void enviarCorreoSimple_nullMensaje() {
    NullPointerException ex = assertThrows(NullPointerException.class, () -> {
      emailController.enviarCorreoSimple("cliente@dominio.com", "Asunto", null);
    });
    assertEquals("El mensaje no puede ser null", ex.getMessage());
  }

  @Test
  void enviarCorreoSimple_errorEnvio() {
    doThrow(new RuntimeException("Error al enviar")).when(emailSender).send(any(SimpleMailMessage.class));

    ResponseEntity<String> response = emailController.enviarCorreoSimple(
            "cliente@dominio.com",
            "Asunto",
            "Mensaje");

    assertEquals(500, response.getStatusCodeValue());
    assertTrue(response.getBody().contains("Error al enviar el correo simple"));
  }
}
