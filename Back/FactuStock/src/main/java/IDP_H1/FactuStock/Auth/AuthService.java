package IDP_H1.FactuStock.Auth;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.getUsername(), request.getPassword()));

            Usuario usuario = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> {
                        logger.warn("Usuario {} no encontrado en la base de datos.", request.getUsername());
                        return new UsernameNotFoundException("Usuario no encontrado");
                    });

            logger.info("Usuario {} autenticado correctamente.", request.getUsername());

            // Ahora el token solo incluye el idUsuario
            String token = jwtService.getToken(usuario, usuario.getId());

            return AuthResponse.builder()
                    .token(token)
                    .build();

        } catch (BadCredentialsException e) {
            logger.error("Credenciales inválidas para el usuario {}: {}", request.getUsername(), e.getMessage());
            throw e;
        } catch (UsernameNotFoundException e) {
            logger.error("Usuario {} no encontrado: {}", request.getUsername(), e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error de inicio de sesión para el usuario {}: {}", request.getUsername(), e.getMessage(), e);
            throw e;
        }
    }

    public AuthResponse register(RegisterRequest request) {
        logger.info("Registro de nuevo usuario: {}", request.getUsername());

        try {
            Optional<Usuario> existingUser = userRepository.findByUsername(request.getUsername());
            if (existingUser.isPresent()) {
                logger.warn("Ya existe un usuario con el nombre: {}", request.getUsername());
                throw new IllegalArgumentException("Ya existe un usuario con ese nombre.");
            }

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

            // Generamos el token con el idUsuario en lugar del username
            String token = jwtService.getToken(savedUser, savedUser.getId());

            return AuthResponse.builder()
                    .token(token)
                    .build();

        } catch (Exception e) {
            logger.error("Error al registrar el usuario {}: {}", request.getUsername(), e.getMessage(), e);
            throw e;
        }
    }
}
