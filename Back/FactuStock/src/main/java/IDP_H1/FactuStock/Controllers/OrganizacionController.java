package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@RestController
@RequestMapping("/organizaciones")
@CrossOrigin(origins = "http://localhost:5173") // Ajusta según tu frontend
public class OrganizacionController {

    // Cambiar ruta a 'img-logo' en lugar de 'logos'
    private static final String LOGO_DIRECTORY = "src/main/resources/static/img-logo/";

    @Autowired
    private OrganizacionRepository organizacionRepository;

    // Actualizar organización (sin logo)
    @PutMapping("/{id}")
    public ResponseEntity<Organizacion> actualizarOrganizacion(@PathVariable Long id, @RequestBody Organizacion organizacionActualizada) {
        Optional<Organizacion> organizacionExistente = organizacionRepository.findById(id);

        if (organizacionExistente.isPresent()) {
            Organizacion organizacion = organizacionExistente.get();
            organizacion.setNombre(organizacionActualizada.getNombre());
            organizacion.setDireccion(organizacionActualizada.getDireccion());
            organizacion.setTelefono(organizacionActualizada.getTelefono());
            organizacion.setNifCif(organizacionActualizada.getNifCif());
            organizacion.setEmail(organizacionActualizada.getEmail());
            organizacion.setWeb(organizacionActualizada.getWeb());

            Organizacion organizacionGuardada = organizacionRepository.save(organizacion);
            return new ResponseEntity<>(organizacionGuardada, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Subir logo
    @PostMapping("/upload-logo/{id}")
    public ResponseEntity<String> uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("No se seleccionó ningún archivo.", HttpStatus.BAD_REQUEST);
        }

        Optional<Organizacion> organizacionOptional = organizacionRepository.findById(id);
        if (!organizacionOptional.isPresent()) {
            return new ResponseEntity<>("Organización no encontrada.", HttpStatus.NOT_FOUND);
        }

        Organizacion organizacion = organizacionOptional.get();

        try {
            // Validar extensión del archivo
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || (!originalFilename.endsWith(".png") && !originalFilename.endsWith(".jpg"))) {
                return new ResponseEntity<>("Solo se permiten archivos PNG o JPG.", HttpStatus.BAD_REQUEST);
            }

            // Eliminar el logo anterior si existe
            if (organizacion.getLogo() != null) {
                File oldLogo = new File(LOGO_DIRECTORY + organizacion.getLogo());
                if (oldLogo.exists()) {
                    oldLogo.delete();
                }
            }

            // Guardar el nuevo logo
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "Logo-" + id + extension;
            Path path = Paths.get(LOGO_DIRECTORY + newFilename);
            Files.createDirectories(path.getParent()); // Asegurar que la carpeta exista
            Files.write(path, file.getBytes());

            // Guardar en la base de datos
            organizacion.setLogo(newFilename);
            organizacionRepository.save(organizacion);

            return new ResponseEntity<>("Logo subido correctamente: " + newFilename, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>("Error al guardar el archivo.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Obtener la URL del logo
    @GetMapping("/logo/{filename}")
    public ResponseEntity<byte[]> getLogo(@PathVariable String filename) {
        try {
            Path path = Paths.get(LOGO_DIRECTORY + filename);
            byte[] image = Files.readAllBytes(path);
            return ResponseEntity.ok().body(image);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
