package IDP_H1.FactuStock.Services;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {

  @InjectMocks
  private EmailService emailService;

  @Mock
  private JavaMailSender mailSender;

  @Mock
  private MimeMessage mimeMessage;

  @Mock
  private MultipartFile adjunto;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
  }

  @Test
  void enviarCorreoConAdjunto_conAdjunto_exitoso() throws Exception {
    when(adjunto.isEmpty()).thenReturn(false);
    when(adjunto.getOriginalFilename()).thenReturn("archivo.pdf");

    assertDoesNotThrow(() -> emailService.enviarCorreoConAdjunto(
            "destinatario@dominio.com",
            "Asunto",
            "Mensaje HTML",
            adjunto));

    verify(mailSender).createMimeMessage();
    verify(mailSender).send(mimeMessage);
  }

  @Test
  void enviarCorreoConAdjunto_sinAdjunto_exitoso() {
    assertDoesNotThrow(() -> emailService.enviarCorreoConAdjunto(
            "destinatario@dominio.com",
            "Asunto",
            "Mensaje HTML",
            null));

    verify(mailSender).createMimeMessage();
    verify(mailSender).send(mimeMessage);
  }

  @Test
  void enviarCorreoConAdjunto_errorEnvio_lanzaRuntimeException() throws Exception {
    when(mailSender.createMimeMessage()).thenThrow(new RuntimeException("Error crear mensaje"));

    RuntimeException ex = assertThrows(RuntimeException.class, () -> {
      emailService.enviarCorreoConAdjunto(
              "destinatario@dominio.com",
              "Asunto",
              "Mensaje HTML",
              null);
    });

    assertTrue(ex.getMessage().contains("Error crear mensaje"));
  }
}
