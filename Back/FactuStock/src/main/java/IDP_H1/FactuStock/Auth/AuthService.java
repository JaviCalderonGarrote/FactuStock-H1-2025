package IDP_H1.FactuStock.Auth;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Usuario;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import IDP_H1.FactuStock.Repositories.UsuarioRepository;
import IDP_H1.FactuStock.Jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository userRepository;
    private final OrganizacionRepository organizacionRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        String normalizedUsername = request.getUsername().toLowerCase();
        logger.info("Intento de inicio de sesión para el usuario: {}", normalizedUsername);

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    normalizedUsername, request.getPassword()));

            Usuario usuario = userRepository.findByUsernameIgnoreCase(normalizedUsername)
                    .orElseThrow(() -> {
                        logger.warn("Usuario {} no encontrado en la base de datos.", normalizedUsername);
                        return new UsernameNotFoundException("Usuario no encontrado");
                    });

            logger.info("Usuario {} autenticado correctamente.", normalizedUsername);

            String token = jwtService.getToken(usuario, usuario.getId());

            return AuthResponse.builder()
                    .token(token)
                    .build();

        } catch (BadCredentialsException e) {
            logger.error("Credenciales inválidas para el usuario {}: {}", normalizedUsername, e.getMessage());
            throw e;
        } catch (UsernameNotFoundException e) {
            logger.error("Usuario {} no encontrado: {}", normalizedUsername, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error de inicio de sesión para el usuario {}: {}", normalizedUsername, e.getMessage(), e);
            throw e;
        }
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedUsername = request.getUsername().toLowerCase();
        logger.info("Registro de nuevo usuario: {}", normalizedUsername);

        try {
            Optional<Usuario> existingUser = userRepository.findByUsernameIgnoreCase(normalizedUsername);
            if (existingUser.isPresent()) {
                logger.warn("Ya existe un usuario con el nombre: {}", normalizedUsername);
                throw new IllegalArgumentException("Ya existe un usuario con ese nombre.");
            }

            // Guardamos la organización
            Organizacion organizacion = organizacionRepository.save(request.getOrganizacion());

            // Crear el usuario
            Usuario usuario = Usuario.builder()
                    .username(normalizedUsername)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .nombre(request.getNombre())
                    .apellido(request.getApellido())
                    .mail(request.getMail())
                    .rol(request.getRol())
                    .organizacion(organizacion)
                    .build();

            // Guardamos el usuario
            Usuario savedUser = userRepository.save(usuario);
            logger.info("Usuario {} registrado correctamente.", savedUser.getUsername());

            // Generar el token con el ID del usuario
            String token = jwtService.getToken(savedUser, savedUser.getId());

            return AuthResponse.builder()
                    .token(token)
                    .build();

        } catch (Exception e) {
            logger.error("Error al registrar el usuario {}: {}", normalizedUsername, e.getMessage(), e);
            throw e;
        }
    }
}
