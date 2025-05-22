package IDP_H1.FactuStock.Auth;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Rol;
import IDP_H1.FactuStock.Entities.Usuario;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import IDP_H1.FactuStock.Repositories.UsuarioRepository;
import IDP_H1.FactuStock.Jwt.JwtService;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

public class AuthServiceTest {

    @Mock
    private UsuarioRepository userRepository;

    @Mock
    private OrganizacionRepository organizacionRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JavaMailSender emailSender;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        when(emailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    // --- LOGIN TESTS ---

    @Test
    public void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");

        Usuario usuario = Usuario.builder()
                .username("user")
                .id(1L)
                .build();

        when(userRepository.findByUsernameIgnoreCase("user")).thenReturn(Optional.of(usuario));
        when(jwtService.getToken(usuario, 1L)).thenReturn("token123");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("token123", response.getToken());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository).findByUsernameIgnoreCase("user");
        verify(jwtService).getToken(usuario, 1L);
    }

    @Test
    public void testLogin_BadCredentials() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("wrongpass");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(request);
        });
        assertEquals("Credenciales inválidas", ex.getMessage());

        verify(authenticationManager).authenticate(any());
        verifyNoMoreInteractions(userRepository);
        verifyNoMoreInteractions(jwtService);
    }

    @Test
    public void testLogin_UserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");

        when(userRepository.findByUsernameIgnoreCase("user"))
                .thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(request);
        });
        assertEquals("Usuario no encontrado", ex.getMessage());

        verify(authenticationManager).authenticate(any());
        verify(userRepository).findByUsernameIgnoreCase("user");
        verifyNoMoreInteractions(jwtService);
    }

    // --- REGISTER TESTS ---

    @Test
    public void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setMail("email@example.com");
        request.setPassword("password");
        request.setNombre("Nombre");
        request.setApellido("Apellido");
        request.setRol(Rol.Administrador);
        Organizacion organizacion = new Organizacion();
        request.setOrganizacion(organizacion);

        when(userRepository.findByUsernameIgnoreCase("newuser")).thenReturn(Optional.empty());
        when(userRepository.findByMailIgnoreCase("email@example.com")).thenReturn(Optional.empty());
        when(organizacionRepository.save(organizacion)).thenReturn(organizacion);
        when(passwordEncoder.encode("password")).thenReturn("encodedPass");

        Usuario savedUser = Usuario.builder()
                .username("newuser")
                .mail("email@example.com")
                .nombre("Nombre")
                .apellido("Apellido")
                .rol(Rol.Administrador)
                .organizacion(organizacion)
                .id(42L)
                .build();

        when(userRepository.save(any(Usuario.class))).thenReturn(savedUser);
        when(jwtService.getToken(savedUser, 42L)).thenReturn("token456");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("token456", response.getToken());

        verify(userRepository).findByUsernameIgnoreCase("newuser");
        verify(userRepository).findByMailIgnoreCase("email@example.com");
        verify(organizacionRepository).save(organizacion);
        verify(passwordEncoder).encode("password");
        verify(userRepository).save(any(Usuario.class));
        verify(jwtService).getToken(savedUser, 42L);
        verify(emailSender).createMimeMessage();
        verify(emailSender).send(mimeMessage);
    }

    @Test
    public void testRegister_EmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setMail("existingemail@example.com");
        request.setRol(Rol.Administrador);
        request.setOrganizacion(new Organizacion());

        when(userRepository.findByUsernameIgnoreCase("newuser"))
                .thenReturn(Optional.empty());
        when(userRepository.findByMailIgnoreCase("existingemail@example.com"))
                .thenReturn(Optional.of(new Usuario()));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(request);
        });

        assertEquals("El correo electrónico ya está en uso.", ex.getMessage());

        verify(userRepository).findByUsernameIgnoreCase("newuser");
        verify(userRepository).findByMailIgnoreCase("existingemail@example.com");
        verifyNoMoreInteractions(userRepository);
    }
}
