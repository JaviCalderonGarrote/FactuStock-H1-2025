package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Gasto;
import IDP_H1.FactuStock.Services.GastoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/gastos")
public class GastoController {

    private static final Logger logger = LoggerFactory.getLogger(GastoController.class);

    @Autowired
    private GastoService gastoService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/organizacion/{organizacionId}")
    public ResponseEntity<List<Gasto>> obtenerPorOrganizacion(@PathVariable Long organizacionId) {
        logger.info("Obteniendo gastos para la organización con ID: {}", organizacionId);
        List<Gasto> gastos = gastoService.obtenerPorOrganizacion(organizacionId);
        logger.info("Se encontraron {} gastos para la organización", gastos.size());
        return new ResponseEntity<>(gastos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gasto> obtenerPorId(@PathVariable Long id) {
        logger.info("Obteniendo gasto con ID: {}", id);
        Optional<Gasto> gasto = gastoService.obtenerPorId(id);
        if (gasto.isPresent()) {
            logger.info("Gasto encontrado: {}", gasto.get());
            return new ResponseEntity<>(gasto.get(), HttpStatus.OK);
        } else {
            logger.warn("No se encontró gasto con ID: {}", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Gasto> guardar(@RequestPart("gasto") String gastoJson,
                                         @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        try {
            logger.info("Recibiendo solicitud para guardar nuevo gasto: {}", gastoJson);
            Gasto gasto = objectMapper.readValue(gastoJson, Gasto.class);

            if (archivo != null && !archivo.isEmpty()) {
                logger.info("Archivo adjunto recibido: {}", archivo.getOriginalFilename());
                gasto.setArchivoFactura(archivo.getBytes());
                gasto.setNombreArchivoFactura(archivo.getOriginalFilename());
            }
            Gasto nuevoGasto = gastoService.guardar(gasto);
            logger.info("Nuevo gasto guardado con ID: {}", nuevoGasto.getId());
            return new ResponseEntity<>(nuevoGasto, HttpStatus.CREATED);
        } catch (IOException e) {
            logger.error("Error al procesar la solicitud de guardar gasto", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gasto> actualizar(@PathVariable Long id, @RequestBody Gasto gasto) {
        logger.info("Actualizando gasto con ID: {}", id);
        Optional<Gasto> gastoData = gastoService.obtenerPorId(id);
        if (gastoData.isPresent()) {
            Gasto gastoActualizado = gastoData.get();
            gastoActualizado.setMonto(gasto.getMonto());
            gastoActualizado.setNumFactura(gasto.getNumFactura());
            gastoActualizado.setEstado(gasto.getEstado());
            gastoActualizado.setFormaPagoGasto(gasto.getFormaPagoGasto());
            gastoActualizado.setOrganizacion(gasto.getOrganizacion());
            gastoActualizado.setUsuario(gasto.getUsuario());
            gastoActualizado.setCategoriaGasto(gasto.getCategoriaGasto());
            gastoActualizado.setEmpresaPersonaFisica(gasto.getEmpresaPersonaFisica());
            Gasto savedGasto = gastoService.guardar(gastoActualizado);
            logger.info("Gasto actualizado: {}", savedGasto);
            return new ResponseEntity<>(savedGasto, HttpStatus.OK);
        } else {
            logger.warn("No se encontró gasto con ID: {} para actualizar", id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> eliminar(@PathVariable Long id) {
        try {
            logger.info("Eliminando gasto con ID: {}", id);
            gastoService.eliminar(id);
            logger.info("Gasto eliminado correctamente");
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error al eliminar gasto con ID: {}", id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<byte[]> descargarArchivo(@PathVariable Long id) {
        logger.info("Solicitando descarga de archivo para gasto con ID: {}", id);
        Optional<Gasto> gastoOpt = gastoService.obtenerPorId(id);
        if (gastoOpt.isPresent() && gastoOpt.get().getArchivoFactura() != null) {
            Gasto gasto = gastoOpt.get();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            String fileName = gasto.getNombreArchivoFactura();
            try {
                fileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");
            } catch (IOException e) {
                logger.warn("No se pudo codificar el nombre del archivo: {}", fileName);
            }

            headers.setContentDispositionFormData("attachment", fileName);

            logger.info("Enviando archivo '{}' para gasto con ID: {}", fileName, id);
            return new ResponseEntity<>(gasto.getArchivoFactura(), headers, HttpStatus.OK);
        }
        logger.warn("No se encontró archivo para gasto con ID: {}", id);
        return ResponseEntity.notFound().build();
    }
}
