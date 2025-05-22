package IDP_H1.FactuStock.Entities;

import IDP_H1.FactuStock.Entities.Usuario;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.mockito.InjectMocks;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
public class UsuarioTest {
  @InjectMocks private Usuario usuario;

  @Test
  void testSetPasswordResetToken_EmptyToken() {
    // Arrange
    String emptyToken = "";
    // Act
    usuario.setPasswordResetToken(emptyToken);
    // Assert
    assertEquals(emptyToken, usuario.getPasswordResetToken());
  }

  @Test
  void testSetPasswordResetToken_ValidToken() {
    // Arrange
    String validToken = "12345";
    // Act
    usuario.setPasswordResetToken(validToken);
    // Assert
    assertEquals(validToken, usuario.getPasswordResetToken());
  }

  @BeforeEach
  public void setUp() {
    // Initialize mocks if needed
  }

  @Test
  void testSetPasswordResetToken_NullToken() {
    // Arrange
    String nullToken = null;
    // Act
    usuario.setPasswordResetToken(nullToken);
    // Assert
    assertEquals(nullToken, usuario.getPasswordResetToken());
  }
}
