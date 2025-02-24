package IDP_H1.FactuStock.Auth;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException; // Importa la excepción específica
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import IDP_H1.FactuStock.Entities.Usuario;
import IDP_H1.FactuStock.Repositories.UsuarioRepository;
import IDP_H1.FactuStock.Jwt.JwtService;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        logger.info("Intento de inicio de sesión para el usuario: {}", request.getUsername());

        try {
            // Log de los datos de la request antes de la autenticación
            logger.debug("Datos de la request: Username={}, Password (no se muestra por seguridad)", request.getUsername()); // No loguear la contraseña en producción

            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            UserDetails user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> {
                        logger.warn("Usuario {} no encontrado en la base de datos.", request.getUsername()); // Log específico para usuario no encontrado
                        return new UsernameNotFoundException("Usuario no encontrado");
                    });

            logger.info("Usuario {} autenticado correctamente.", request.getUsername());

            String token = jwtService.getToken(user);
            return AuthResponse.builder()
                    .token(token)
                    .build();

        } catch (BadCredentialsException e) {
            logger.error("Credenciales inválidas para el usuario {}: {}", request.getUsername(), e.getMessage()); // Log específico para credenciales inválidas
            throw e; // Re-lanza la excepción
        } catch (UsernameNotFoundException e) {
            logger.error("Usuario {} no encontrado: {}", request.getUsername(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error de inicio de sesión para el usuario {}: {}", request.getUsername(), e.getMessage(), e);
            throw e; // Re-lanza la excepción después de loguearla
        }
    }

    public AuthResponse register(RegisterRequest request) {
        logger.info("Registro de nuevo usuario: {}", request.getUsername());

        try {
            Optional<Usuario> existingUser = userRepository.findByUsername(request.getUsername());
            if (existingUser.isPresent()) {
                logger.warn("Ya existe un usuario con el nombre: {}", request.getUsername());
                throw new IllegalArgumentException("Ya existe un usuario con ese nombre."); // Lanza una excepción adecuada
            }

            // Log de los datos del usuario a registrar (sin la contraseña)
            logger.debug("Datos del usuario a registrar: Username={}, Nombre={}, Apellido={}, Mail={}, Rol={}, Organizacion={}",
                    request.getUsername(), request.getNombre(), request.getApellido(), request.getMail(), request.getRol(), request.getOrganizacion());

            Usuario usuario = Usuario.builder()
                    .username(request.getUsername())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .nombre(request.getNombre())
                    .apellido(request.getApellido())
                    .mail(request.getMail())
                    .rol(request.getRol())
                    .organizacion(request.getOrganizacion())
                    .build();

            Usuario savedUser = userRepository.save(usuario);
            logger.info("Usuario {} registrado correctamente.", savedUser.getUsername());

            return AuthResponse.builder()
                    .token(jwtService.getToken(savedUser))
                    .build();

        } catch (Exception e) {
            logger.error("Error al registrar el usuario {}: {}", request.getUsername(), e.getMessage(), e);
            throw e; // Re-lanza la excepción
        }
    }
}