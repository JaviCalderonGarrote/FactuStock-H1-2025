package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Services.CategoriaProductoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CategoriaProductoControllerTest {

  @Mock
  private CategoriaProductoService service;

  @InjectMocks
  private CategoriaProductoController controller;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void obtenerTodas_retornaOkConLista() {
    List<CategoriaProducto> lista = List.of(new CategoriaProducto(), new CategoriaProducto());
    when(service.obtenerTodas()).thenReturn(lista);

    ResponseEntity<List<CategoriaProducto>> response = controller.obtenerTodas();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(lista, response.getBody());
    verify(service).obtenerTodas();
  }

  @Test
  void obtenerPorId_encontrado_retornaOk() {
    CategoriaProducto cat = new CategoriaProducto();
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(cat));

    ResponseEntity<CategoriaProducto> response = controller.obtenerPorId(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(cat, response.getBody());
  }

  @Test
  void obtenerPorId_noEncontrado_retornaNotFound() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<CategoriaProducto> response = controller.obtenerPorId(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void obtenerCategoriasPorOrganizacion_conCategorias_retornaOk() {
    Organizacion org = new Organizacion();
    org.setId(1L);
    List<CategoriaProducto> lista = List.of(new CategoriaProducto());
    when(service.obtenerCategoriasPorOrganizacion(any())).thenReturn(lista);

    ResponseEntity<List<CategoriaProducto>> response = controller.obtenerCategoriasPorOrganizacion(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(lista, response.getBody());
    verify(service).obtenerCategoriasPorOrganizacion(any());
  }

  @Test
  void obtenerCategoriasPorOrganizacion_sinCategorias_retornaNoContent() {
    when(service.obtenerCategoriasPorOrganizacion(any())).thenReturn(Collections.emptyList());

    ResponseEntity<List<CategoriaProducto>> response = controller.obtenerCategoriasPorOrganizacion(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void guardar_retornaCreated() {
    CategoriaProducto cat = new CategoriaProducto();
    when(service.guardarCategoria(cat)).thenReturn(cat);

    ResponseEntity<CategoriaProducto> response = controller.guardar(cat);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(cat, response.getBody());
    verify(service).guardarCategoria(cat);
  }

  @Test
  void editar_existente_retornaOk() {
    CategoriaProducto catExistente = new CategoriaProducto();
    CategoriaProducto catUpdate = new CategoriaProducto();
    catUpdate.setId(5L);
    when(service.obtenerPorId(5L)).thenReturn(Optional.of(catExistente));
    when(service.guardarCategoria(any())).thenAnswer(i -> i.getArgument(0));

    ResponseEntity<CategoriaProducto> response = controller.editar(5L, catUpdate);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(5L, response.getBody().getId());
    verify(service).obtenerPorId(5L);
    verify(service).guardarCategoria(any());
  }

  @Test
  void editar_noExiste_retornaNotFound() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<CategoriaProducto> response = controller.editar(1L, new CategoriaProducto());

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void eliminar_existente_retornaNoContent() {
    CategoriaProducto cat = new CategoriaProducto();
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(cat));
    doNothing().when(service).eliminarCategoria(1L);

    ResponseEntity<?> response = controller.eliminar(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
  }

  @Test
  void eliminar_conProductosAsociados_retornaBadRequest() {
    CategoriaProducto cat = new CategoriaProducto();
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(cat));
    doThrow(DataIntegrityViolationException.class).when(service).eliminarCategoria(1L);

    ResponseEntity<?> response = controller.eliminar(1L);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("No se puede eliminar la categoría porque tiene productos asociados.", response.getBody());
  }

  @Test
  void eliminar_noExiste_retornaNotFound() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<?> response = controller.eliminar(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Categoría no encontrada", response.getBody());
  }
}
