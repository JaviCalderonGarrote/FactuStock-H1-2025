package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.CategoriaGasto;
import IDP_H1.FactuStock.Repositories.CategoriaGastoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CategoriaGastoServiceTest {

  @Mock
  private CategoriaGastoRepository repository;

  @InjectMocks
  private CategoriaGastoService service;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void obtenerTodas_retornaLista() {
    List<CategoriaGasto> lista = List.of(new CategoriaGasto(), new CategoriaGasto());
    when(repository.findAll()).thenReturn(lista);

    List<CategoriaGasto> resultado = service.obtenerTodas();

    assertEquals(2, resultado.size());
    verify(repository).findAll();
  }

  @Test
  void obtenerPorId_retornaOptional() {
    CategoriaGasto cat = new CategoriaGasto();
    when(repository.findById(1L)).thenReturn(Optional.of(cat));

    Optional<CategoriaGasto> resultado = service.obtenerPorId(1L);

    assertTrue(resultado.isPresent());
    assertEquals(cat, resultado.get());
    verify(repository).findById(1L);
  }

  @Test
  void guardar_retornaCategoriaGuardada() {
    CategoriaGasto cat = new CategoriaGasto();
    when(repository.save(cat)).thenReturn(cat);

    CategoriaGasto resultado = service.guardar(cat);

    assertEquals(cat, resultado);
    verify(repository).save(cat);
  }

  @Test
  void eliminar_llamaDeleteById() {
    Long id = 1L;
    doNothing().when(repository).deleteById(id);

    service.eliminar(id);

    verify(repository).deleteById(id);
  }

  @Test
  void obtenerPorOrganizacion_valido_retornaLista() {
    Long idOrg = 1L;
    List<CategoriaGasto> lista = List.of(new CategoriaGasto());
    when(repository.findByOrganizacionId(idOrg)).thenReturn(lista);

    List<CategoriaGasto> resultado = service.obtenerPorOrganizacion(idOrg);

    assertEquals(lista, resultado);
    verify(repository).findByOrganizacionId(idOrg);
  }

  @Test
  void obtenerPorOrganizacion_nullId_lanzaExcepcion() {
    NullPointerException ex = assertThrows(NullPointerException.class, () -> {
      service.obtenerPorOrganizacion(null);
    });
    assertEquals("El ID de la organización no puede ser null", ex.getMessage());
  }
}
