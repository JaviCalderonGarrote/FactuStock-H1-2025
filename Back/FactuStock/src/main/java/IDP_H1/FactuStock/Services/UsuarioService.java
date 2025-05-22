package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Usuario;
import IDP_H1.FactuStock.Repositories.UsuarioRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    public List<Usuario> obtenerTodos() {
        return repository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    public Optional<Usuario> obtenerPorUsername(String username) {
        return repository.findByUsername(username);
    }

    public Optional<Usuario> obtenerPorEmail(String mail) {
        return repository.findByMail(mail);
    }

    public Usuario guardar(Usuario usuario) {
        return repository.save(usuario);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    public boolean cambiarPassword(Long id, String oldPassword, String newPassword) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            if (!passwordEncoder.matches(oldPassword, usuario.getPassword())) {
                return false;
            }

            usuario.setPassword(passwordEncoder.encode(newPassword));
            repository.save(usuario);
            return true;
        }
        return false;
    }

    public String generatePasswordResetToken(Usuario usuario) {
        String token = UUID.randomUUID().toString();
        usuario.setPasswordResetToken(token);
        repository.save(usuario);
        return token;
    }

    public boolean resetPasswordWithToken(String token, String newPassword) {
        Optional<Usuario> usuarioOpt = repository.findByPasswordResetToken(token);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setPassword(passwordEncoder.encode(newPassword));
            usuario.setPasswordResetToken(null);
            repository.save(usuario);
            return true;
        }
        return false;
    }

    public void sendPasswordResetEmail(Usuario usuario, String token) {
        if (usuario == null) {
            throw new NullPointerException("Usuario no puede ser null");
        }
        if (token == null) {
            throw new NullPointerException("Token no puede ser null");
        }

        String resetUrl = "http://localhost:5173/usuarios/reset-password?token=" + token;
        String subject = "Recuperación de Contraseña";

        String mensaje = "<html>" +
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
                ".button { display: inline-block; padding: 10px 20px; background-color: #2E6DA4; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h2>Recuperación de Contraseña</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Estimado/a <strong>" + usuario.getNombre() + "</strong>,</p>" +
                "<p>Hemos recibido una solicitud para restablecer tu contraseña. Si fuiste tú, por favor haz clic en el siguiente botón para cambiar tu contraseña:</p>" +
                "<a href='" + resetUrl + "' class='button'>Restablecer Contraseña</a>" +
                "<p>Si no solicitaste este cambio, por favor ignora este mensaje.</p>" +
                "<p>Este enlace expirará en 24 horas por razones de seguridad.</p>" +
                "<p>Si tienes alguna pregunta o necesitas ayuda adicional, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>" +
                "<p>Atentamente,</p>" +
                "<p><strong>El equipo de Soporte</strong></p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>----------------------------------------------------------</p>" +
                "<p><strong>AVISO DE SEGURIDAD:</strong> Nunca compartas tu contraseña con nadie. Nuestro equipo nunca te pedirá tu contraseña.</p>" +
                "<p><strong>PROTECCIÓN DE DATOS:</strong> De conformidad con lo dispuesto en el Reglamento (UE) 2016/679, le informamos de que los datos personales y la dirección de correo electrónico del interesado serán tratados únicamente para los fines de esta solicitud.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
            helper.setTo(usuario.getMail());
            helper.setSubject(subject);
            helper.setText(mensaje, true);  // Enviar contenido HTML

            mailSender.send(mimeMessage);

        } catch (MessagingException e) {
            // Envolvemos en RuntimeException para que Mockito pueda simularla en tests
            throw new RuntimeException("Error al enviar correo", e);
        }
    }
}
