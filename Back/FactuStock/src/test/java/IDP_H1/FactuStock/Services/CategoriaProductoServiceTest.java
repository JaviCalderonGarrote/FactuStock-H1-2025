package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.CategoriaProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CategoriaProductoServiceTest {

  @Mock
  private CategoriaProductoRepository repository;

  @InjectMocks
  private CategoriaProductoService service;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void guardarCategoria_retornaGuardado() {
    CategoriaProducto cat = new CategoriaProducto();
    when(repository.save(cat)).thenReturn(cat);

    CategoriaProducto resultado = service.guardarCategoria(cat);

    assertEquals(cat, resultado);
    verify(repository).save(cat);
  }

  @Test
  void obtenerPorId_retornaOptional() {
    CategoriaProducto cat = new CategoriaProducto();
    when(repository.findById(1L)).thenReturn(Optional.of(cat));

    Optional<CategoriaProducto> resultado = service.obtenerPorId(1L);

    assertTrue(resultado.isPresent());
    assertEquals(cat, resultado.get());
    verify(repository).findById(1L);
  }

  @Test
  void obtenerTodas_retornaLista() {
    List<CategoriaProducto> lista = List.of(new CategoriaProducto(), new CategoriaProducto());
    when(repository.findAll()).thenReturn(lista);

    List<CategoriaProducto> resultado = service.obtenerTodas();

    assertEquals(2, resultado.size());
    verify(repository).findAll();
  }

  @Test
  void obtenerCategoriasPorOrganizacion_retornaLista() {
    Organizacion org = new Organizacion();
    org.setId(1L);
    List<CategoriaProducto> lista = List.of(new CategoriaProducto());
    when(repository.findByOrganizacion(org)).thenReturn(lista);

    List<CategoriaProducto> resultado = service.obtenerCategoriasPorOrganizacion(org);

    assertEquals(lista, resultado);
    verify(repository).findByOrganizacion(org);
  }

  @Test
  void existePorId_retornaTrueFalse() {
    when(repository.existsById(1L)).thenReturn(true);
    when(repository.existsById(2L)).thenReturn(false);

    assertTrue(service.existePorId(1L));
    assertFalse(service.existePorId(2L));

    verify(repository, times(2)).existsById(anyLong());
  }

  @Test
  void eliminarCategoria_llamaDeleteById() {
    doNothing().when(repository).deleteById(1L);

    service.eliminarCategoria(1L);

    verify(repository).deleteById(1L);
  }
}
