package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Services.DetalleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DetalleControllerTest {

  @Mock
  private DetalleService detalleService;

  @InjectMocks
  private DetalleController detalleController;

  private Detalle detalle;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    detalle = new Detalle();
    detalle.setId(1L);
    detalle.setCantidad(10);
    detalle.setIva(21);
    detalle.setPrecioUnitario(100.0);
    detalle.setSubtotal(1210.0);
    detalle.setNombre("Producto Test");
  }

  @Test
  void obtenerTodos_CuandoHayDetalles_Retorna200ConLista() {
    List<Detalle> detalles = List.of(detalle);
    when(detalleService.obtenerTodos()).thenReturn(detalles);

    ResponseEntity<List<Detalle>> response = detalleController.obtenerTodos();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(detalles, response.getBody());
    verify(detalleService).obtenerTodos();
  }

  @Test
  void obtenerTodos_CuandoNoHayDetalles_Retorna204() {
    when(detalleService.obtenerTodos()).thenReturn(Collections.emptyList());

    ResponseEntity<List<Detalle>> response = detalleController.obtenerTodos();

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    assertNull(response.getBody());
    verify(detalleService).obtenerTodos();
  }

  @Test
  void obtenerPorId_CuandoExiste_Retorna200ConDetalle() {
    when(detalleService.obtenerPorId(1L)).thenReturn(Optional.of(detalle));

    ResponseEntity<Detalle> response = detalleController.obtenerPorId(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(detalle, response.getBody());
    verify(detalleService).obtenerPorId(1L);
  }

  @Test
  void obtenerPorId_CuandoNoExiste_Retorna404() {
    when(detalleService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Detalle> response = detalleController.obtenerPorId(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
    verify(detalleService).obtenerPorId(1L);
  }

  @Test
  void guardar_DebeGuardarYRetornar201() {
    when(detalleService.guardar(detalle)).thenReturn(detalle);

    ResponseEntity<Detalle> response = detalleController.guardar(detalle);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(detalle, response.getBody());
    verify(detalleService).guardar(detalle);
  }

  @Test
  void actualizar_CuandoExiste_DebeRetornar200ConDetalleActualizado() {
    when(detalleService.actualizar(1L, detalle)).thenReturn(detalle);

    ResponseEntity<Detalle> response = detalleController.actualizar(1L, detalle);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(detalle, response.getBody());
    verify(detalleService).actualizar(1L, detalle);
  }

  @Test
  void actualizar_CuandoNoExiste_DebeRetornar404() {
    when(detalleService.actualizar(1L, detalle)).thenReturn(null);

    ResponseEntity<Detalle> response = detalleController.actualizar(1L, detalle);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
    verify(detalleService).actualizar(1L, detalle);
  }

  @Test
  void eliminar_CuandoExiste_DebeRetornar204() {
    when(detalleService.obtenerPorId(1L)).thenReturn(Optional.of(detalle));
    doNothing().when(detalleService).eliminar(1L);

    ResponseEntity<Void> response = detalleController.eliminar(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    verify(detalleService).obtenerPorId(1L);
    verify(detalleService).eliminar(1L);
  }

  @Test
  void eliminar_CuandoNoExiste_DebeRetornar404() {
    when(detalleService.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<Void> response = detalleController.eliminar(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    verify(detalleService).obtenerPorId(1L);
    verify(detalleService, never()).eliminar(anyLong());
  }

  @Test
  void obtenerTop5ProductosMasVendidos_CuandoHayDatos_DebeRetornar200ConMapa() {
    Map<String, Long> top5 = Map.of("ProductoA", 50L, "ProductoB", 40L);
    when(detalleService.obtenerTop5ProductosMasVendidos(1L)).thenReturn(top5);

    ResponseEntity<Map<String, Long>> response = detalleController.obtenerTop5ProductosMasVendidos(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(top5, response.getBody());
    verify(detalleService).obtenerTop5ProductosMasVendidos(1L);
  }

  @Test
  void obtenerTop5ProductosMasVendidos_CuandoNoHayDatos_DebeRetornar204() {
    when(detalleService.obtenerTop5ProductosMasVendidos(1L)).thenReturn(Collections.emptyMap());

    ResponseEntity<Map<String, Long>> response = detalleController.obtenerTop5ProductosMasVendidos(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    assertNull(response.getBody());
    verify(detalleService).obtenerTop5ProductosMasVendidos(1L);
  }
}
