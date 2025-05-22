package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Service
public class OrganizacionService {

    private static final String LOGO_DIRECTORY = "src/main/resources/static/img-logo/";

    @Autowired
    private OrganizacionRepository organizacionRepository;

    // Crear una nueva organización
    public Organizacion crearOrganizacion(Organizacion organizacion) {
        return organizacionRepository.save(organizacion);
    }

    // Actualizar organización existente
    public Optional<Organizacion> actualizarOrganizacion(Long id, Organizacion organizacionActualizada) {
        Optional<Organizacion> organizacionExistente = organizacionRepository.findById(id);
        if (organizacionExistente.isPresent()) {
            Organizacion organizacion = organizacionExistente.get();
            organizacion.setNombre(organizacionActualizada.getNombre());
            organizacion.setDireccion(organizacionActualizada.getDireccion());
            organizacion.setTelefono(organizacionActualizada.getTelefono());
            organizacion.setNifCif(organizacionActualizada.getNifCif());
            organizacion.setEmail(organizacionActualizada.getEmail());
            organizacion.setWeb(organizacionActualizada.getWeb());
            organizacionRepository.save(organizacion);
            return Optional.of(organizacion);
        }
        return Optional.empty();
    }

    // Subir logo para organización
    public String uploadLogo(Long id, MultipartFile file) throws IOException {
        Optional<Organizacion> organizacionOptional = organizacionRepository.findById(id);
        if (organizacionOptional.isPresent()) {
            Organizacion organizacion = organizacionOptional.get();

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null ||
                    !(originalFilename.toLowerCase().endsWith(".png") || originalFilename.toLowerCase().endsWith(".jpg"))) {
                throw new IOException("Solo se permiten archivos PNG o JPG.");
            }

            // Eliminar logo anterior si existe
            if (organizacion.getLogo() != null) {
                File oldLogo = new File(LOGO_DIRECTORY + organizacion.getLogo());
                if (oldLogo.exists()) {
                    oldLogo.delete();
                }
            }

            // Guardar nuevo logo
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "Logo-" + id + extension;
            Path path = Paths.get(LOGO_DIRECTORY + newFilename);
            Files.createDirectories(path.getParent()); // Crear carpeta si no existe
            Files.write(path, file.getBytes());

            // Actualizar logo en la entidad y guardar
            organizacion.setLogo(newFilename);
            organizacionRepository.save(organizacion);

            return newFilename;
        }
        throw new IOException("Organización no encontrada.");
    }

    // Obtener logo desde archivo
    public byte[] getLogo(String filename) throws IOException {
        // Validar que filename no contenga rutas relativas peligrosas
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new IOException("Ruta inválida para el logo.");
        }

        Path path = Paths.get(LOGO_DIRECTORY + filename);
        if (!Files.exists(path)) {
            throw new IOException("Archivo no encontrado: " + path.toString());
        }
        return Files.readAllBytes(path);
    }
}
