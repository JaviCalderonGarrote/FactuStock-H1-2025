package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Services.EmpresaPersonaFisicaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/empresas-personas-fisicas")
public class EmpresaPersonaFisicaController {

    @Autowired
    private EmpresaPersonaFisicaService empresaPersonaFisicaService;

    // Obtener todas las empresas/personas físicas
    @GetMapping
    public ResponseEntity<List<EmpresaPersonaFisica>> obtenerTodas() {
        List<EmpresaPersonaFisica> empresas = empresaPersonaFisicaService.obtenerTodas();
        return new ResponseEntity<>(empresas, HttpStatus.OK);
    }

    // Obtener empresa/persona física por ID
    @GetMapping("/{id}")
    public ResponseEntity<EmpresaPersonaFisica> obtenerPorId(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> empresa = empresaPersonaFisicaService.obtenerPorId(id);
        return empresa.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nueva empresa/persona física
    @PostMapping
    public ResponseEntity<EmpresaPersonaFisica> guardar(@RequestBody EmpresaPersonaFisica empresaPersonaFisica) {
        EmpresaPersonaFisica nuevaEmpresa = empresaPersonaFisicaService.guardar(empresaPersonaFisica);
        return new ResponseEntity<>(nuevaEmpresa, HttpStatus.CREATED);
    }

    // Eliminar empresa/persona física por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<EmpresaPersonaFisica> empresa = empresaPersonaFisicaService.obtenerPorId(id);
        if (empresa.isPresent()) {
            empresaPersonaFisicaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
