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

    // Setter para inyectar mock en tests
    public void setEmailSender(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @PostMapping("/enviar")
    public ResponseEntity<String> enviarCorreo(
            @RequestParam("cliente") String destinatario,
            @RequestParam("asunto") String asunto,
            @RequestParam("mensaje") String mensaje,
            @RequestParam("correoOrganizacion") String correoOrganizacion,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo) {

        try {
            MimeMessage mimeMessage = emailSender.createMimeMessage();
            boolean tieneAdjunto = archivo != null && !archivo.isEmpty();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, tieneAdjunto, "UTF-8");

            helper.setFrom("factustock.idp@gmail.com");
            helper.setTo(destinatario);
            if (correoOrganizacion != null && !correoOrganizacion.isEmpty()) {
                helper.addCc(correoOrganizacion);
            }
            helper.setSubject(asunto);
            helper.setText(mensaje, true);

            if (tieneAdjunto) {
                helper.addAttachment(archivo.getOriginalFilename(), archivo);
            }

            emailSender.send(mimeMessage);

            return ResponseEntity.ok("Correo enviado correctamente");
        } catch (MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error al enviar el correo: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error inesperado al enviar el correo: " + e.getMessage());
        }
    }

    @PostMapping("/enviar-simple")
    public ResponseEntity<String> enviarCorreoSimple(
            @RequestParam("cliente") String destinatario,
            @RequestParam("asunto") String asunto,
            @RequestParam("mensaje") String mensaje) {

        if (destinatario == null) {
            throw new NullPointerException("El destinatario no puede ser null");
        }
        if (asunto == null) {
            throw new NullPointerException("El asunto no puede ser null");
        }
        if (mensaje == null) {
            throw new NullPointerException("El mensaje no puede ser null");
        }

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
            return ResponseEntity.internalServerError()
                    .body("Error al enviar el correo simple: " + e.getMessage());
        }
    }
}