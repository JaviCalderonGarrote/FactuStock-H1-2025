package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Entities.EstadoCaja;
import IDP_H1.FactuStock.Services.CajaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CajaControllerTest {

  @InjectMocks
  private CajaController cajaController;

  @Mock
  private CajaService cajaService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void obtenerTodas_RetornaListaCajas() {
    List<Caja> lista = List.of(new Caja(), new Caja());
    when(cajaService.obtenerTodas()).thenReturn(lista);

    ResponseEntity<List<Caja>> response = cajaController.obtenerTodas();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(lista, response.getBody());
    verify(cajaService).obtenerTodas();
  }

  @Test
  void obtenerPorOrganizacion_RetornaListaCajas() {
    Long orgId = 10L;
    List<Caja> lista = List.of(new Caja());
    when(cajaService.obtenerPorOrganizacion(orgId)).thenReturn(lista);

    ResponseEntity<List<Caja>> response = cajaController.obtenerPorOrganizacion(orgId);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(lista, response.getBody());
    verify(cajaService).obtenerPorOrganizacion(orgId);
  }

  @Test
  void obtenerPorId_CajaEncontrada_RetornaCaja() {
    Long id = 5L;
    Caja caja = new Caja();
    when(cajaService.obtenerPorId(id)).thenReturn(Optional.of(caja));

    ResponseEntity<Caja> response = cajaController.obtenerPorId(id);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(caja, response.getBody());
    verify(cajaService).obtenerPorId(id);
  }

  @Test
  void obtenerPorId_CajaNoEncontrada_Retorna404() {
    Long id = 5L;
    when(cajaService.obtenerPorId(id)).thenReturn(Optional.empty());

    ResponseEntity<Caja> response = cajaController.obtenerPorId(id);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
    verify(cajaService).obtenerPorId(id);
  }

  @Test
  void crearCaja_Exito_RetornaCreated() {
    Caja input = new Caja();
    Caja creado = new Caja();
    when(cajaService.abrirNuevaCaja(input)).thenReturn(creado);

    ResponseEntity<Caja> response = cajaController.crearCaja(input);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(creado, response.getBody());
    verify(cajaService).abrirNuevaCaja(input);
  }

  @Test
  void actualizarCaja_CajaExistente_RetornaActualizada() {
    Long id = 2L;
    Caja input = new Caja();
    Caja existente = new Caja();
    Caja actualizado = new Caja();

    when(cajaService.obtenerPorId(id)).thenReturn(Optional.of(existente));
    when(cajaService.actualizarCaja(any())).thenReturn(actualizado);

    ResponseEntity<Caja> response = cajaController.actualizarCaja(id, input);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(actualizado, response.getBody());
    verify(cajaService).obtenerPorId(id);
    verify(cajaService).actualizarCaja(any());
    assertEquals(id, input.getId());
  }

  @Test
  void actualizarCaja_CajaNoExiste_Retorna404() {
    Long id = 2L;
    Caja input = new Caja();

    when(cajaService.obtenerPorId(id)).thenReturn(Optional.empty());

    ResponseEntity<Caja> response = cajaController.actualizarCaja(id, input);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
    verify(cajaService).obtenerPorId(id);
    verify(cajaService, never()).actualizarCaja(any());
  }

  @Test
  void cerrarCaja_Exito_RetornaOk() {
    Long id = 3L;
    Caja cajaCerrada = new Caja();
    when(cajaService.cerrarCaja(id)).thenReturn(cajaCerrada);

    ResponseEntity<Caja> response = cajaController.cerrarCaja(id);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(cajaCerrada, response.getBody());
    verify(cajaService).cerrarCaja(id);
  }

  @Test
  void cerrarCaja_Error_RetornaBadRequest() {
    Long id = 3L;
    when(cajaService.cerrarCaja(id)).thenThrow(new RuntimeException("Error al cerrar"));

    ResponseEntity<Caja> response = cajaController.cerrarCaja(id);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNull(response.getBody());
    verify(cajaService).cerrarCaja(id);
  }

  @Test
  void handleException_RetornaErrorInterno() {
    Exception e = new Exception("Error grave");
    ResponseEntity<String> response = cajaController.handleException(e);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertTrue(response.getBody().contains("Error interno del servidor"));
  }

  @Test
  void obtenerCajaAbiertaPorOrganizacion_RetornaMapa() {
    Long orgId = 7L;
    Map<String, Object> mapa = Map.of("nombre", "Caja1", "totalIngresado", 100.0);
    when(cajaService.obtenerCajaAbiertaConTotal(orgId)).thenReturn(mapa);

    ResponseEntity<Map<String, Object>> response = cajaController.obtenerCajaAbiertaPorOrganizacion(orgId);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(mapa, response.getBody());
    verify(cajaService).obtenerCajaAbiertaConTotal(orgId);
  }
}
