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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.dao.DataIntegrityViolationException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository userRepository;
    private final OrganizacionRepository organizacionRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender emailSender;

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
            throw new IllegalArgumentException("Credenciales inválidas");
        } catch (UsernameNotFoundException e) {
            logger.error("Usuario {} no encontrado: {}", normalizedUsername, e.getMessage());
            throw new IllegalArgumentException("Usuario no encontrado");
        } catch (Exception e) {
            logger.error("Error de inicio de sesión para el usuario {}: {}", normalizedUsername, e.getMessage(), e);
            throw new IllegalArgumentException("Error en el inicio de sesión");
        }
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedUsername = request.getUsername().toLowerCase();
        String normalizedEmail = request.getMail().toLowerCase();
        logger.info("Registro de nuevo usuario: {}", normalizedUsername);

        try {
            // Verificar si el username ya existe
            if (userRepository.findByUsernameIgnoreCase(normalizedUsername).isPresent()) {
                logger.warn("Ya existe un usuario con el nombre: {}", normalizedUsername);
                throw new IllegalArgumentException("El nombre de usuario ya está en uso.");
            }

            // Verificar si el email ya existe
            if (userRepository.findByMailIgnoreCase(normalizedEmail).isPresent()) {
                logger.warn("Ya existe un usuario con el correo: {}", normalizedEmail);
                throw new IllegalArgumentException("El correo electrónico ya está en uso.");
            }

            // Guardamos la organización
            Organizacion organizacion = organizacionRepository.save(request.getOrganizacion());

            // Crear el usuario
            Usuario usuario = Usuario.builder()
                    .username(normalizedUsername)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .nombre(request.getNombre())
                    .apellido(request.getApellido())
                    .mail(normalizedEmail)
                    .rol(request.getRol())
                    .organizacion(organizacion)
                    .build();

            // Guardamos el usuario
            Usuario savedUser = userRepository.save(usuario);
            logger.info("Usuario {} registrado correctamente.", savedUser.getUsername());

            // Enviar correo de bienvenida
            enviarCorreoBienvenida(savedUser);

            // Generar el token con el ID del usuario
            String token = jwtService.getToken(savedUser, savedUser.getId());

            return AuthResponse.builder()
                    .token(token)
                    .build();

        } catch (IllegalArgumentException e) {
            logger.error("Error al registrar el usuario {}: {}", normalizedUsername, e.getMessage());
            throw e;
        } catch (DataIntegrityViolationException e) {
            logger.error("Error de integridad de datos al registrar el usuario {}: {}", normalizedUsername, e.getMessage());

            String message = e.getMessage() != null ? e.getMessage().toLowerCase() : "";

            if (message.contains("username") || message.contains("usuario") || message.contains("user")) {
                throw new IllegalArgumentException("El nombre de usuario ya está en uso.");
            } else if (message.contains("mail") || message.contains("email") || message.contains("correo")) {
                throw new IllegalArgumentException("El correo electrónico ya está en uso.");
            } else {
                throw new IllegalArgumentException("Error al registrar el usuario debido a un conflicto de datos.");
            }
        } catch (Exception e) {
            logger.error("Error inesperado al registrar el usuario {}: {}", normalizedUsername, e.getMessage(), e);
            throw new IllegalArgumentException("Error al registrar el usuario. Por favor, inténtalo de nuevo más tarde.");
        }
    }

    private void enviarCorreoBienvenida(Usuario usuario) {
        try {
            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("factustock.idp@gmail.com");
            helper.setTo(usuario.getMail());
            helper.setSubject("Bienvenido a FactuStock");
            helper.setText(generarHTMLCorreoBienvenida(usuario), true);

            // Adjuntar el PDF
            Resource pdfResource = new ClassPathResource("manual_uso_FACTUSTOCK.pdf");
            helper.addAttachment("Manual de Uso FactuStock.pdf", pdfResource);

            emailSender.send(mimeMessage);
            logger.info("Correo de bienvenida enviado a: {} con manual adjunto", usuario.getMail());
        } catch (MessagingException e) {
            logger.error("Error al enviar correo de bienvenida: {}", e.getMessage());
        }
    }

    private String generarHTMLCorreoBienvenida(Usuario usuario) {
        Organizacion organizacion = usuario.getOrganizacion();
        return "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }" +
                ".container { max-width: 600px; margin: 30px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }" +
                ".header { background-color: #2E6DA4; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".header h2 { margin: 0; font-size: 24px; }" +
                ".footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e1e1; }" +
                ".content { padding: 20px; }" +
                ".content h3 { color: #2E6DA4; font-size: 18px; }" +
                ".content ul { padding-left: 20px; }" +
                ".content li { margin-bottom: 10px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h2>Bienvenido a FactuStock</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Estimado/a <strong>" + usuario.getNombre() + " " + usuario.getApellido() + "</strong>,</p>" +
                "<p>Gracias por registrarte en FactuStock. Tu cuenta ha sido creada exitosamente.</p>" +
                "<h3>Datos de tu cuenta:</h3>" +
                "<ul>" +
                "    <li><strong>Nombre de usuario:</strong> " + usuario.getUsername() + "</li>" +
                "    <li><strong>Email:</strong> " + usuario.getMail() + "</li>" +
                "    <li><strong>Rol:</strong> " + usuario.getRol() + "</li>" +
                "</ul>" +
                "<h3>Datos de tu organización:</h3>" +
                "<ul>" +
                "    <li><strong>Nombre:</strong> " + organizacion.getNombre() + "</li>" +
                "    <li><strong>Dirección:</strong> " + organizacion.getDireccion() + "</li>" +
                "    <li><strong>Teléfono:</strong> " + organizacion.getTelefono() + "</li>" +
                "    <li><strong>Email:</strong> " + organizacion.getEmail() + "</li>" +
                "</ul>" +
                "<p>Hemos adjuntado un manual de uso de la aplicación en este correo. Por favor, revísalo para familiarizarte con FactuStock.</p>" +
                "<p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>" +
                "<p>Atentamente,</p>" +
                "<p><strong>El equipo de FactuStock</strong></p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>----------------------------------------------------------</p>" +
                "<p><strong>AVISO LEGAL:</strong> Este mensaje y sus archivos adjuntos van dirigidos exclusivamente a su destinatario, pudiendo contener información confidencial sometida a secreto profesional.</p>" +
                "<p><strong>PROTECCIÓN DE DATOS:</strong> De conformidad con lo dispuesto en el Reglamento (UE) 2016/679, le informamos de que los datos personales y la dirección de correo electrónico del interesado serán tratados para el envío de comunicaciones sobre nuestros productos y servicios.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
