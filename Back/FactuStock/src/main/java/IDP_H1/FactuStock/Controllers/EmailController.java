package IDP_H1.FactuStock.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @Autowired
    private JavaMailSender emailSender;

    @PostMapping("/enviar")
    public ResponseEntity<String> enviarCorreo(
            @RequestParam("cliente") String destinatario,
            @RequestParam("asunto") String asunto,
            @RequestParam("mensaje") String mensaje,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) {
        try {
            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("factustock.idp@gmail.com");
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(mensaje, true);  // true indica que el contenido es HTML

            if (archivo != null && !archivo.isEmpty()) {
                helper.addAttachment(archivo.getOriginalFilename(), archivo);
            }

            emailSender.send(mimeMessage);

            return ResponseEntity.ok("Correo enviado correctamente");
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al enviar el correo: " + e.getMessage());
        }
    }

    @PostMapping("/enviar-simple")
    public ResponseEntity<String> enviarCorreoSimple(
            @RequestParam("cliente") String destinatario,
            @RequestParam("asunto") String asunto,
            @RequestParam("mensaje") String mensaje) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom("factustock.idp@gmail.com");
            mailMessage.setTo(destinatario);
            mailMessage.setSubject(asunto);
            mailMessage.setText(mensaje);

            emailSender.send(mailMessage);

            return ResponseEntity.ok("Correo simple enviado correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error al enviar el correo simple: " + e.getMessage());
        }
    }
}
