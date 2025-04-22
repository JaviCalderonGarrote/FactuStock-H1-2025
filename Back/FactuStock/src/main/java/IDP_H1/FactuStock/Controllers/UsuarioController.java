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
@CrossOrigin(origins = "http://localhost:5173") // Permitir solo a localhost:5173
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerTodos() {
        List<Usuario> usuarios = usuarioService.obtenerTodos();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.obtenerPorId(id);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Obtener usuario por username
    @GetMapping("/username/{username}")
    public ResponseEntity<Usuario> obtenerPorUsername(@PathVariable String username) {
        Optional<Usuario> usuario = usuarioService.obtenerPorUsername(username);
        return usuario.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nuevo usuario
    @PostMapping
    public ResponseEntity<Usuario> guardar(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioService.guardar(usuario);
        return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
    }

    // Actualizar usuario por ID
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @RequestBody Usuario usuarioActualizado) {
        Optional<Usuario> usuarioOpt = usuarioService.obtenerPorId(id);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setNombre(usuarioActualizado.getNombre());
            usuario.setApellido(usuarioActualizado.getApellido());
            usuario.setMail(usuarioActualizado.getMail());
            usuario.setTelefono(usuarioActualizado.getTelefono());
            usuario.setRol(usuarioActualizado.getRol());

            Usuario usuarioGuardado = usuarioService.guardar(usuario);
            return new ResponseEntity<>(usuarioGuardado, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Eliminar usuario por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.obtenerPorId(id);
        if (usuario.isPresent()) {
            usuarioService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Cambiar contraseña
    @PatchMapping("/{id}/password")
    public ResponseEntity<String> cambiarPassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La contraseña nueva no puede estar vacía.");
        }

        boolean success = usuarioService.cambiarPassword(id, oldPassword, newPassword);
        if (success) {
            return ResponseEntity.ok("Contraseña actualizada correctamente.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al cambiar la contraseña. Verifique la contraseña actual.");
        }
    }

    // Recuperar contraseña
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String usernameOrEmail = request.get("usernameOrEmail");

        // Buscar por username
        Optional<Usuario> usuarioOpt = usuarioService.obtenerPorUsername(usernameOrEmail);

        // Si no lo encontramos por username, buscar por email
        if (usuarioOpt.isEmpty()) {
            usuarioOpt = usuarioService.obtenerPorEmail(usernameOrEmail);
        }

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String token = usuarioService.generatePasswordResetToken(usuario);

            // Enviar el correo con el enlace de recuperación
            usuarioService.sendPasswordResetEmail(usuario, token);
            return ResponseEntity.ok("Se ha enviado un correo con instrucciones para cambiar la contraseña.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado.");
        }
    }

    // Restablecer contraseña con el token
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        // Llamar al servicio para restablecer la contraseña
        boolean result = usuarioService.resetPasswordWithToken(token, newPassword);

        if (result) {
            return ResponseEntity.ok("Contraseña restablecida exitosamente.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El token es inválido o ha expirado.");
        }
    }
}
