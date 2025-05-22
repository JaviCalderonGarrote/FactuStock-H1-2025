package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Usuario;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceTest {

  @InjectMocks
  private UsuarioService usuarioService;

  @Mock
  private JavaMailSender mailSender;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void testSendPasswordResetEmail_NullToken() {
    Usuario usuario = new Usuario();
    usuario.setMail("test@example.com");
    usuario.setNombre("Test User");

    assertThrows(
            NullPointerException.class,
            () -> usuarioService.sendPasswordResetEmail(usuario, null)
    );
  }

  @Test
  void testSendPasswordResetEmail_NullUsuario() {
    String token = "testToken";

    assertThrows(
            NullPointerException.class,
            () -> usuarioService.sendPasswordResetEmail(null, token)
    );
  }

  @Test
  void testSendPasswordResetEmail_Success() {
    Usuario usuario = new Usuario();
    usuario.setMail("test@example.com");
    usuario.setNombre("Test User");
    String token = "testToken";

    MimeMessage mimeMessage = mock(MimeMessage.class);
    when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

    assertDoesNotThrow(() -> usuarioService.sendPasswordResetEmail(usuario, token));

    verify(mailSender, times(1)).createMimeMessage();
    verify(mailSender, times(1)).send(mimeMessage);
  }

}
