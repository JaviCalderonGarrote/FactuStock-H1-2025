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

    // Método para crear una nueva organización
    public Organizacion crearOrganizacion(Organizacion organizacion) {
        return organizacionRepository.save(organizacion);
    }

    // Método para actualizar una organización
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

    // Método para subir el logo de una organización
    public String uploadLogo(Long id, MultipartFile file) throws IOException {
        Optional<Organizacion> organizacionOptional = organizacionRepository.findById(id);
        if (organizacionOptional.isPresent()) {
            Organizacion organizacion = organizacionOptional.get();

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || (!originalFilename.endsWith(".png") && !originalFilename.endsWith(".jpg"))) {
                throw new IOException("Solo se permiten archivos PNG o JPG.");
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

            // Actualizar logo en la base de datos
            organizacion.setLogo(newFilename);
            organizacionRepository.save(organizacion);

            return newFilename;
        }
        throw new IOException("Organización no encontrada.");
    }

    // Método para obtener el logo de una organización
    public byte[] getLogo(String filename) throws IOException {
        Path path = Paths.get(LOGO_DIRECTORY + filename);
        return Files.readAllBytes(path);
    }
}
