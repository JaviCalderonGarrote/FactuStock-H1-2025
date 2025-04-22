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
    private JavaMailSender mailSender;  // Inyectamos JavaMailSender

    // Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return repository.findAll();
    }

    // Obtener usuario por ID
    public Optional<Usuario> obtenerPorId(Long id) {
        return repository.findById(id);
    }

    // Obtener usuario por username
    public Optional<Usuario> obtenerPorUsername(String username) {
        return repository.findByUsername(username);
    }

    // Obtener usuario por email
    public Optional<Usuario> obtenerPorEmail(String mail) {
        return repository.findByMail(mail);  // Cambiado a findByMail
    }

    // Guardar o actualizar usuario
    public Usuario guardar(Usuario usuario) {
        return repository.save(usuario);
    }

    // Eliminar usuario por ID
    public void eliminar(Long id) {
        repository.deleteById(id);
    }

    // Cambiar contraseña del usuario
    public boolean cambiarPassword(Long id, String oldPassword, String newPassword) {
        Optional<Usuario> usuarioOpt = repository.findById(id);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            // Verificar la contraseña actual
            if (!passwordEncoder.matches(oldPassword, usuario.getPassword())) {
                return false; // La contraseña actual no coincide
            }

            // Codificar la nueva contraseña
            usuario.setPassword(passwordEncoder.encode(newPassword));

            // Guardar usuario con la nueva contraseña
            repository.save(usuario);
            return true;
        }
        return false; // Usuario no encontrado
    }

    // Método para generar un token para la recuperación de contraseña
    public String generatePasswordResetToken(Usuario usuario) {
        String token = UUID.randomUUID().toString();
        usuario.setPasswordResetToken(token); // Necesitas agregar este campo en la entidad Usuario
        repository.save(usuario);
        return token;
    }

    // Método para resetear la contraseña con el token
    public boolean resetPasswordWithToken(String token, String newPassword) {
        Optional<Usuario> usuarioOpt = repository.findByPasswordResetToken(token);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setPassword(passwordEncoder.encode(newPassword));
            usuario.setPasswordResetToken(null); // Limpiar el token
            repository.save(usuario);
            return true;
        }
        return false; // Token no válido
    }

    // Método para enviar un correo con el token para la recuperación de la contraseña
    public void sendPasswordResetEmail(Usuario usuario, String token) {
        String resetUrl = "http://localhost:5173/usuarios/reset-password?token=" + token; // URL de tu API para el reset
        String subject = "Recuperación de Contraseña";
        String text = "Hola " + usuario.getNombre() + ",\n\n" +
                "Hemos recibido una solicitud para restablecer tu contraseña. Si fuiste tú, por favor haz clic en el siguiente enlace para cambiar tu contraseña:\n\n" +
                resetUrl + "\n\n" +
                "Si no solicitaste este cambio, por favor ignora este mensaje.";

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);

        try {
            helper.setTo(usuario.getMail());
            helper.setSubject(subject);
            helper.setText(text);

            mailSender.send(mimeMessage);  // Enviar el correo
        } catch (MessagingException e) {
            e.printStackTrace();
            // Manejar el error de envío de correo
        }
    }
}
