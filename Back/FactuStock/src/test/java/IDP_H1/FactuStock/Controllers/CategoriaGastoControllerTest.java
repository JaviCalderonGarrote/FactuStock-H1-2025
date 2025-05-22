package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.CategoriaGasto;
import IDP_H1.FactuStock.Services.CategoriaGastoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CategoriaGastoControllerTest {

  @Mock
  private CategoriaGastoService service;

  @InjectMocks
  private CategoriaGastoController controller;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void obtenerTodas_retornaLista() {
    List<CategoriaGasto> lista = List.of(new CategoriaGasto(), new CategoriaGasto());
    when(service.obtenerTodas()).thenReturn(lista);

    List<CategoriaGasto> resultado = controller.obtenerTodas();

    assertEquals(2, resultado.size());
    verify(service).obtenerTodas();
  }

  @Test
  void obtenerPorId_encontrado_retornaOk() {
    CategoriaGasto cat = new CategoriaGasto();
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(cat));

    ResponseEntity<CategoriaGasto> response = controller.obtenerPorId(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(cat, response.getBody());
  }

  @Test
  void obtenerPorId_noEncontrado_retornaNotFound() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<CategoriaGasto> response = controller.obtenerPorId(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void obtenerPorOrganizacion_conCategorias_retornaOk() {
    List<CategoriaGasto> lista = List.of(new CategoriaGasto());
    when(service.obtenerPorOrganizacion(1L)).thenReturn(lista);

    ResponseEntity<List<CategoriaGasto>> response = controller.obtenerPorOrganizacion(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(lista, response.getBody());
  }

  @Test
  void obtenerPorOrganizacion_sinCategorias_retornaNoContent() {
    List<CategoriaGasto> listaVacia = Collections.emptyList();
    when(service.obtenerPorOrganizacion(1L)).thenReturn(listaVacia);

    ResponseEntity<List<CategoriaGasto>> response = controller.obtenerPorOrganizacion(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    assertEquals(listaVacia, response.getBody());
  }

  @Test
  void guardar_retornaCategoriaGuardada() {
    CategoriaGasto cat = new CategoriaGasto();
    when(service.guardar(cat)).thenReturn(cat);

    ResponseEntity<CategoriaGasto> response = controller.guardar(cat);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(cat, response.getBody());
  }

  @Test
  void editarCategoria_existente_retornaOk() {
    CategoriaGasto catExistente = new CategoriaGasto();
    catExistente.setNombre("Viejo");
    CategoriaGasto catUpdate = new CategoriaGasto();
    catUpdate.setNombre("Nuevo");

    when(service.obtenerPorId(1L)).thenReturn(Optional.of(catExistente));
    when(service.guardar(any(CategoriaGasto.class))).thenAnswer(i -> i.getArgument(0));

    ResponseEntity<CategoriaGasto> response = controller.editarCategoria(1L, catUpdate);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals("Nuevo", response.getBody().getNombre());
  }

  @Test
  void editarCategoria_noExiste_retornaNotFound() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<CategoriaGasto> response = controller.editarCategoria(1L, new CategoriaGasto());

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
  }

  @Test
  void eliminar_existente_retornaNoContent() {
    CategoriaGasto cat = new CategoriaGasto();
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(cat));
    doNothing().when(service).eliminar(1L);

    ResponseEntity<?> response = controller.eliminar(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
  }

  @Test
  void eliminar_conGastosAsociados_retornaBadRequest() {
    CategoriaGasto cat = new CategoriaGasto();
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(cat));
    doThrow(DataIntegrityViolationException.class).when(service).eliminar(1L);

    ResponseEntity<?> response = controller.eliminar(1L);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("No se puede eliminar la categoría porque tiene gastos asociados.", response.getBody());
  }

  @Test
  void eliminar_noExiste_retornaNotFound() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<?> response = controller.eliminar(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Categoría no encontrada", response.getBody());
  }
}
