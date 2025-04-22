package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Usuario;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(Usuario usuario, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String subject = "Solicitud de Cambio de Contraseña";
        String body = "Para cambiar tu contraseña, por favor haz clic en el siguiente enlace: " + resetUrl;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(usuario.getMail());
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}
