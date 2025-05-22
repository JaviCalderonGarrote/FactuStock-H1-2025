package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Gasto;
import IDP_H1.FactuStock.Entities.EstadoGasto;
import IDP_H1.FactuStock.Entities.FormaPagoGasto;
import IDP_H1.FactuStock.Services.GastoService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class GastoControllerTest {

  @InjectMocks
  private GastoController gastoController;

  @Mock
  private GastoService gastoService;

  @Mock
  private ObjectMapper objectMapper;

  @Mock
  private MultipartFile archivoMock;

  private Gasto gastoEjemplo;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    gastoEjemplo = new Gasto();
    gastoEjemplo.setId(1L);
    gastoEjemplo.setMonto(100.0);
    gastoEjemplo.setEstado(EstadoGasto.COMPLETADO);
    gastoEjemplo.setFormaPagoGasto(FormaPagoGasto.EFECTIVO);
    gastoEjemplo.setFecha(LocalDateTime.now());
  }

  @Test
  void testObtenerPorOrganizacion() {
    List<Gasto> gastos = List.of(gastoEjemplo);
    when(gastoService.obtenerPorOrganizacion(anyLong())).thenReturn(gastos);

    ResponseEntity<List<Gasto>> response = gastoController.obtenerPorOrganizacion(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(1, response.getBody().size());
    verify(gastoService).obtenerPorOrganizacion(1L);
  }

  @Test
  void testObtenerPorIdEncontrado() {
    when(gastoService.obtenerPorId(1L)).thenReturn(Optional.of(gastoEjemplo));

    ResponseEntity<Gasto> response = gastoController.obtenerPorId(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(gastoEjemplo, response.getBody());
  }

  @Test
  void testObtenerPorIdNoEncontrado() {
    when(gastoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Gasto> response = gastoController.obtenerPorId(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void testGuardarConArchivo() throws Exception {
    String gastoJson = "{}";

    when(objectMapper.readValue(eq(gastoJson), eq(Gasto.class))).thenReturn(gastoEjemplo);
    when(archivoMock.isEmpty()).thenReturn(false);
    when(archivoMock.getBytes()).thenReturn(new byte[]{1, 2, 3});
    when(archivoMock.getOriginalFilename()).thenReturn("factura.pdf");
    when(gastoService.guardar(any(Gasto.class))).thenReturn(gastoEjemplo);

    ResponseEntity<Gasto> response = gastoController.guardar(gastoJson, archivoMock);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(gastoEjemplo, response.getBody());
    assertNotNull(response.getBody().getArchivoFactura());
    assertEquals("factura.pdf", response.getBody().getNombreArchivoFactura());

    verify(objectMapper).readValue(eq(gastoJson), eq(Gasto.class));
    verify(gastoService).guardar(any(Gasto.class));
  }

  @Test
  void testGuardarSinArchivo() throws Exception {
    String gastoJson = "{}";

    when(objectMapper.readValue(eq(gastoJson), eq(Gasto.class))).thenReturn(gastoEjemplo);
    when(gastoService.guardar(any(Gasto.class))).thenReturn(gastoEjemplo);

    ResponseEntity<Gasto> response = gastoController.guardar(gastoJson, null);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(gastoEjemplo, response.getBody());
    assertNull(response.getBody().getArchivoFactura());

    verify(objectMapper).readValue(eq(gastoJson), eq(Gasto.class));
    verify(gastoService).guardar(any(Gasto.class));
  }

  @Test
  void testGuardarConError() throws Exception {
    // Aquí simulamos que readValue lanza una JsonProcessingException, que extiende IOException
    when(objectMapper.readValue(anyString(), eq(Gasto.class)))
            .thenThrow(new JsonProcessingException("Error de parseo") {});

    ResponseEntity<Gasto> response = gastoController.guardar("{}", null);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNull(response.getBody());

    verify(objectMapper).readValue(anyString(), eq(Gasto.class));
    verifyNoInteractions(gastoService);
  }

  @Test
  void testActualizarExistente() {
    Gasto gastoUpdate = new Gasto();
    gastoUpdate.setMonto(200.0);
    gastoUpdate.setNumFactura("123");
    gastoUpdate.setEstado(EstadoGasto.COMPLETADO);
    gastoUpdate.setFormaPagoGasto(FormaPagoGasto.TARJETA);
    gastoUpdate.setOrganizacion(null);
    gastoUpdate.setUsuario(null);
    gastoUpdate.setCategoriaGasto(null);
    gastoUpdate.setEmpresaPersonaFisica(null);

    when(gastoService.obtenerPorId(1L)).thenReturn(Optional.of(gastoEjemplo));
    when(gastoService.guardar(any(Gasto.class))).thenReturn(gastoEjemplo);

    ResponseEntity<Gasto> response = gastoController.actualizar(1L, gastoUpdate);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    verify(gastoService).guardar(any(Gasto.class));
  }

  @Test
  void testActualizarNoExistente() {
    when(gastoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Gasto> response = gastoController.actualizar(1L, new Gasto());

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    verify(gastoService, never()).guardar(any());
  }

  @Test
  void testEliminar() {
    doNothing().when(gastoService).eliminar(1L);

    ResponseEntity<HttpStatus> response = gastoController.eliminar(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    verify(gastoService).eliminar(1L);
  }

  @Test
  void testEliminarConError() {
    doThrow(new RuntimeException("Error")).when(gastoService).eliminar(1L);

    ResponseEntity<HttpStatus> response = gastoController.eliminar(1L);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    verify(gastoService).eliminar(1L);
  }

  @Test
  void testDescargarArchivoExistente() {
    gastoEjemplo.setArchivoFactura(new byte[]{1, 2, 3});
    gastoEjemplo.setNombreArchivoFactura("factura.pdf");

    when(gastoService.obtenerPorId(1L)).thenReturn(Optional.of(gastoEjemplo));

    ResponseEntity<byte[]> response = gastoController.descargarArchivo(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertArrayEquals(new byte[]{1, 2, 3}, response.getBody());
    assertEquals("application/pdf", response.getHeaders().getContentType().toString());
    assertTrue(response.getHeaders().getContentDisposition().getFilename().contains("factura.pdf"));
  }

  @Test
  void testDescargarArchivoNoExistente() {
    when(gastoService.obtenerPorId(1L)).thenReturn(Optional.of(new Gasto()));

    ResponseEntity<byte[]> response = gastoController.descargarArchivo(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void testObtenerTotalGastosPorAno() {
    when(gastoService.obtenerTotalGastosPorAno(1L, 2025)).thenReturn(1500.0);

    ResponseEntity<Double> response = gastoController.obtenerTotalGastosPorAno(1L, 2025);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(1500.0, response.getBody());
  }

  @Test
  void testObtenerGastosMensuales() {
    List<Map<String, Object>> gastosMensuales = new ArrayList<>();
    Map<String, Object> mes = new HashMap<>();
    mes.put("mes", "2025-05");
    mes.put("total", 500.0);
    gastosMensuales.add(mes);

    when(gastoService.obtenerGastosMensuales(1L, 2025)).thenReturn(gastosMensuales);

    ResponseEntity<List<Map<String, Object>>> response = gastoController.obtenerGastosMensuales(1L, 2025);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(gastosMensuales, response.getBody());
  }

}
