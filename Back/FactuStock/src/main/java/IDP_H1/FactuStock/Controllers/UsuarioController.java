package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Usuario;
import IDP_H1.FactuStock.Services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodos() {
        List<Usuario> usuarios = usuarioService.obtenerTodos();
        return ResponseEntity.ok(usuarios);
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Obtener usuario por username
    @GetMapping("/username/{username}")
    public ResponseEntity<Usuario> obtenerPorUsername(@PathVariable String username) {
        return usuarioService.obtenerPorUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Guardar nuevo usuario
    @PostMapping
    public ResponseEntity<Usuario> guardar(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.guardar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @RequestBody Usuario datosActualizados) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerPorId(id);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setNombre(datosActualizados.getNombre());
            usuario.setApellido(datosActualizados.getApellido());
            usuario.setMail(datosActualizados.getMail());
            usuario.setTelefono(datosActualizados.getTelefono());
            usuario.setRol(datosActualizados.getRol());
            Usuario actualizado = usuarioService.guardar(usuario);
            return ResponseEntity.ok(actualizado);
        }
        return ResponseEntity.notFound().build();
    }

    // Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (usuarioService.obtenerPorId(id).isPresent()) {
            usuarioService.eliminar(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Cambiar contraseña (requiere oldPassword y newPassword)
    @PatchMapping("/{id}/password")
    public ResponseEntity<String> cambiarPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Faltan datos de contraseña.");
        }

        boolean cambio = usuarioService.cambiarPassword(id, oldPassword, newPassword);
        if (cambio) {
            return ResponseEntity.ok("Contraseña actualizada correctamente.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Contraseña actual incorrecta.");
        }
    }

    // Enviar email de recuperación de contraseña
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String usernameOrEmail = request.get("usernameOrEmail");
        if (usernameOrEmail == null || usernameOrEmail.isEmpty()) {
            return ResponseEntity.badRequest().body("Falta el nombre de usuario o correo.");
        }

        Optional<Usuario> usuarioOpt = usuarioService.obtenerPorUsername(usernameOrEmail);
        if (usuarioOpt.isEmpty()) {
            usuarioOpt = usuarioService.obtenerPorEmail(usernameOrEmail);
        }

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String token = usuarioService.generatePasswordResetToken(usuario);

            try {
                // Capturamos excepciones generales en vez de MessagingException específica
                usuarioService.sendPasswordResetEmail(usuario, token);
                return ResponseEntity.ok("Correo enviado con el enlace para restablecer la contraseña.");
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al enviar el correo.");
            }

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
        }
    }

    // Restablecer contraseña con token
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody(required = false) Map<String, String> request) {
        if (request == null) {
            return ResponseEntity.badRequest().body("Faltan datos para restablecer la contraseña.");
        }

        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Faltan datos para restablecer la contraseña.");
        }

        boolean success = usuarioService.resetPasswordWithToken(token, newPassword);
        if (success) {
            return ResponseEntity.ok("Contraseña restablecida correctamente.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token inválido o expirado.");
        }
    }
}
