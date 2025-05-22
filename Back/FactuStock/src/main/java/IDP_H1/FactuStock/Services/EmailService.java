package IDP_H1.FactuStock.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void enviarCorreoConAdjunto(String to, String subject, String body, MultipartFile adjunto) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true indica que el cuerpo es HTML

            if (adjunto != null && !adjunto.isEmpty()) {
                helper.addAttachment(adjunto.getOriginalFilename(), adjunto);
            }

            mailSender.send(message);
        } catch (Exception e) {
            // Lanzamos RuntimeException con el mensaje original para facilitar pruebas
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
