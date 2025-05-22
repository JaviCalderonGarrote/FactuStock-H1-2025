package IDP_H1.FactuStock.Jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

  private JwtService jwtService;
  private UserDetails userDetails;

  @BeforeEach
  void setUp() {
    jwtService = new JwtService();
    userDetails = new UserDetails() {
      @Override
      public String getUsername() {
        return "testUser";
      }

      @Override
      public String getPassword() {
        return "password";
      }

      @Override
      public boolean isAccountNonExpired() {
        return true;
      }

      @Override
      public boolean isAccountNonLocked() {
        return true;
      }

      @Override
      public boolean isCredentialsNonExpired() {
        return true;
      }

      @Override
      public boolean isEnabled() {
        return true;
      }

      @Override
      public java.util.Collection<org.springframework.security.core.GrantedAuthority> getAuthorities() {
        return null;
      }
    };
  }

  @Test
  void testGenerateTokenAndExtractUsernameAndId() {
    Long idUsuario = 42L;

    String token = jwtService.getToken(userDetails, idUsuario);
    assertNotNull(token);

    String usernameFromToken = jwtService.getUsernameFromToken(token);
    assertEquals(userDetails.getUsername(), usernameFromToken);

    Long idFromToken = jwtService.getIdUsuarioFromToken(token);
    assertEquals(idUsuario, idFromToken);
  }

  @Test
  void testTokenValidation() {
    Long idUsuario = 42L;
    String token = jwtService.getToken(userDetails, idUsuario);

    assertTrue(jwtService.isTokenValid(token, userDetails));
  }



  @Test
  void testExtractClaimWithInvalidToken() {
    String invalidToken = "invalid.token.value";

    assertThrows(RuntimeException.class, () -> {
      jwtService.getUsernameFromToken(invalidToken);
    });
  }

  @Test
  void testExtractClaimWithNullToken() {
    assertThrows(IllegalArgumentException.class, () -> {
      jwtService.getUsernameFromToken(null);
    });
  }
}
