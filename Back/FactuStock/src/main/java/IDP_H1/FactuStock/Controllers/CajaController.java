package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Services.CajaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/cajas")
public class CajaController {

    @Autowired
    private CajaService cajaService;

    // Obtener todas las cajas
    @GetMapping
    public ResponseEntity<List<Caja>> obtenerTodas() {
        List<Caja> cajas = cajaService.obtenerTodas();
        return new ResponseEntity<>(cajas, HttpStatus.OK);
    }

    // Obtener caja por ID
    @GetMapping("/{id}")
    public ResponseEntity<Caja> obtenerPorId(@PathVariable Long id) {
        Optional<Caja> caja = cajaService.obtenerPorId(id);
        return caja.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Guardar nueva caja
    @PostMapping
    public ResponseEntity<Caja> guardar(@RequestBody Caja caja) {
        Caja nuevaCaja = cajaService.guardar(caja);
        return new ResponseEntity<>(nuevaCaja, HttpStatus.CREATED);
    }

    // Eliminar caja por ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Optional<Caja> caja = cajaService.obtenerPorId(id);
        if (caja.isPresent()) {
            cajaService.eliminar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
