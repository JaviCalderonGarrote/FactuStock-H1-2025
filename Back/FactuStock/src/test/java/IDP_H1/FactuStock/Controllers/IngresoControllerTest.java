package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Services.IngresoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IngresoControllerTest {

  @Mock
  private IngresoService ingresoService;

  @InjectMocks
  private IngresoController ingresoController;

  private Ingreso ingreso;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    ingreso = new Ingreso();
    ingreso.setId(1L);
    ingreso.setMonto(100.0);
    ingreso.setFecha(LocalDateTime.now());
    // no seteamos caja, factura ni organizacion para simplificar
  }

  @Test
  void obtenerTodos_RetornaLista() {
    List<Ingreso> ingresos = Arrays.asList(ingreso);
    when(ingresoService.obtenerTodos()).thenReturn(ingresos);

    ResponseEntity<List<Ingreso>> response = ingresoController.obtenerTodos();

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(ingresos, response.getBody());
    verify(ingresoService).obtenerTodos();
  }

  @Test
  void obtenerPorId_Encontrado() {
    when(ingresoService.obtenerPorId(1L)).thenReturn(Optional.of(ingreso));

    ResponseEntity<Ingreso> response = ingresoController.obtenerPorId(1L);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(ingreso, response.getBody());
    verify(ingresoService).obtenerPorId(1L);
  }

  @Test
  void obtenerPorId_NoEncontrado() {
    when(ingresoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Ingreso> response = ingresoController.obtenerPorId(1L);

    assertEquals(404, response.getStatusCodeValue());
    assertNull(response.getBody());
    verify(ingresoService).obtenerPorId(1L);
  }

  @Test
  void obtenerPorOrganizacion_RetornaLista() {
    List<Ingreso> ingresos = Arrays.asList(ingreso);
    when(ingresoService.obtenerPorOrganizacion(10L)).thenReturn(ingresos);

    ResponseEntity<List<Ingreso>> response = ingresoController.obtenerPorOrganizacion(10L);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(ingresos, response.getBody());
    verify(ingresoService).obtenerPorOrganizacion(10L);
  }

  @Test
  void crear_RetornaIngresoCreado() {
    when(ingresoService.guardar(ArgumentMatchers.any(Ingreso.class))).thenReturn(ingreso);

    ResponseEntity<Ingreso> response = ingresoController.crear(ingreso);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(ingreso, response.getBody());
    verify(ingresoService).guardar(ingreso);
  }

  @Test
  void actualizar_Encontrado_RetornaIngresoActualizado() {
    Ingreso ingresoActualizado = new Ingreso();
    ingresoActualizado.setId(1L);
    ingresoActualizado.setMonto(200.0);

    when(ingresoService.obtenerPorId(1L)).thenReturn(Optional.of(ingreso));
    when(ingresoService.guardar(ArgumentMatchers.any(Ingreso.class))).thenReturn(ingresoActualizado);

    ResponseEntity<Ingreso> response = ingresoController.actualizar(1L, ingresoActualizado);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(ingresoActualizado, response.getBody());
    verify(ingresoService).obtenerPorId(1L);
    verify(ingresoService).guardar(ingresoActualizado);
  }

  @Test
  void actualizar_NoEncontrado_Retorna404() {
    when(ingresoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Ingreso> response = ingresoController.actualizar(1L, ingreso);

    assertEquals(404, response.getStatusCodeValue());
    assertNull(response.getBody());
    verify(ingresoService).obtenerPorId(1L);
    verify(ingresoService, never()).guardar(any());
  }

  @Test
  void eliminar_Encontrado_RetornaOk() {
    when(ingresoService.obtenerPorId(1L)).thenReturn(Optional.of(ingreso));
    doNothing().when(ingresoService).eliminar(1L);

    ResponseEntity<Void> response = ingresoController.eliminar(1L);

    assertEquals(200, response.getStatusCodeValue());
    verify(ingresoService).obtenerPorId(1L);
    verify(ingresoService).eliminar(1L);
  }

  @Test
  void eliminar_NoEncontrado_Retorna404() {
    when(ingresoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Void> response = ingresoController.eliminar(1L);

    assertEquals(404, response.getStatusCodeValue());
    verify(ingresoService).obtenerPorId(1L);
    verify(ingresoService, never()).eliminar(anyLong());
  }

  @Test
  void obtenerTotalIngresosPorAno_RetornaTotal() {
    when(ingresoService.obtenerTotalIngresosPorAno(10L, 2023)).thenReturn(500.0);

    ResponseEntity<Double> response = ingresoController.obtenerTotalIngresosPorAno(10L, 2023);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(500.0, response.getBody());
    verify(ingresoService).obtenerTotalIngresosPorAno(10L, 2023);
  }

  @Test
  void obtenerIngresosMensuales_RetornaLista() {
    List<Map<String, Object>> ingresosMensuales = new ArrayList<>();
    Map<String, Object> mes = new HashMap<>();
    mes.put("mes", "2023-01");
    mes.put("total", 100.0);
    ingresosMensuales.add(mes);

    when(ingresoService.obtenerIngresosMensuales(10L, 2023)).thenReturn(ingresosMensuales);

    ResponseEntity<List<Map<String, Object>>> response = ingresoController.obtenerIngresosMensuales(10L, 2023);

    assertEquals(200, response.getStatusCodeValue());
    assertEquals(ingresosMensuales, response.getBody());
    verify(ingresoService).obtenerIngresosMensuales(10L, 2023);
  }

  @Test
  void obtenerIngresosMensuales_IdOrganizacionInvalido_LanzaException() {
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      ingresoController.obtenerIngresosMensuales(0L, 2023);
    });
    assertEquals("El ID de organización debe ser un número positivo.", thrown.getMessage());
  }
}
