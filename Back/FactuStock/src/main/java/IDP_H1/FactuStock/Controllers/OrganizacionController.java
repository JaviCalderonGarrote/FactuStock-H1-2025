package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/organizaciones")
@CrossOrigin(origins = "http://localhost:5173") // Reemplaza con el origen de tu frontend

public class OrganizacionController {

    @Autowired
    private OrganizacionRepository organizacionRepository;

    @PutMapping("/{id}")
    public ResponseEntity<Organizacion> actualizarOrganizacion(@PathVariable Long id, @RequestBody Organizacion organizacionActualizada) {
        Optional<Organizacion> organizacionExistente = organizacionRepository.findById(id);

        if (organizacionExistente.isPresent()) {
            Organizacion organizacion = organizacionExistente.get();
            // Actualizar los campos necesarios
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
}