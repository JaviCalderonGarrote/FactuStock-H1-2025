package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.EmpresaOPersonaFisicaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmpresaPersonaFisicaServiceTest {

  @Mock
  private EmpresaOPersonaFisicaRepository repository;

  @InjectMocks
  private EmpresaPersonaFisicaService service;

  private EmpresaPersonaFisica empresa;
  private Organizacion organizacion;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    organizacion = new Organizacion();
    organizacion.setId(1L);

    empresa = new EmpresaPersonaFisica();
    empresa.setId(1L);
    empresa.setNombre("Empresa Test");
    empresa.setNifCif("12345678A");
    empresa.setMail("test@empresa.com");
    empresa.setOrganizacion(organizacion);
  }

  @Test
  void obtenerTodos_debeRetornarLista() {
    List<EmpresaPersonaFisica> lista = List.of(empresa);
    when(repository.findAll()).thenReturn(lista);

    List<EmpresaPersonaFisica> resultado = service.obtenerTodos();

    assertNotNull(resultado);
    assertEquals(1, resultado.size());
    verify(repository, times(1)).findAll();
  }

  @Test
  void obtenerPorOrganizacion_debeRetornarLista() {
    List<EmpresaPersonaFisica> lista = List.of(empresa);
    when(repository.findByOrganizacion(organizacion)).thenReturn(lista);

    List<EmpresaPersonaFisica> resultado = service.obtenerPorOrganizacion(organizacion);

    assertNotNull(resultado);
    assertEquals(1, resultado.size());
    verify(repository, times(1)).findByOrganizacion(organizacion);
  }

  @Test
  void obtenerPorId_debeRetornarEmpresaCuandoExiste() {
    when(repository.findById(1L)).thenReturn(Optional.of(empresa));

    Optional<EmpresaPersonaFisica> resultado = service.obtenerPorId(1L);

    assertTrue(resultado.isPresent());
    assertEquals("Empresa Test", resultado.get().getNombre());
    verify(repository, times(1)).findById(1L);
  }

  @Test
  void obtenerPorId_debeRetornarVacioCuandoNoExiste() {
    when(repository.findById(2L)).thenReturn(Optional.empty());

    Optional<EmpresaPersonaFisica> resultado = service.obtenerPorId(2L);

    assertFalse(resultado.isPresent());
    verify(repository, times(1)).findById(2L);
  }

  @Test
  void guardar_debeGuardarYRetornarEntidad() {
    when(repository.save(empresa)).thenReturn(empresa);

    EmpresaPersonaFisica resultado = service.guardar(empresa);

    assertNotNull(resultado);
    assertEquals("Empresa Test", resultado.getNombre());
    verify(repository, times(1)).save(empresa);
  }

  @Test
  void eliminar_debeEliminarPorId() {
    // No devuelve nada, solo verificar que se llame
    doNothing().when(repository).deleteById(1L);

    service.eliminar(1L);

    verify(repository, times(1)).deleteById(1L);
  }

  @Test
  void findByOrganizacion_debeRetornarListaPorIdOrganizacion() {
    List<EmpresaPersonaFisica> lista = List.of(empresa);
    when(repository.findByOrganizacionId(1L)).thenReturn(lista);

    List<EmpresaPersonaFisica> resultado = service.findByOrganizacion(1L);

    assertNotNull(resultado);
    assertEquals(1, resultado.size());
    verify(repository, times(1)).findByOrganizacionId(1L);
  }

  @Test
  void obtenerTop6EmpresasConConteos_debeRetornarListaDeMap() {
    Map<String, Object> mapa = new HashMap<>();
    mapa.put("nombre", "Empresa Test");
    mapa.put("facturas_count", 10L);
    List<Map<String, Object>> lista = List.of(mapa);

    when(repository.findTop6EmpresasWithFacturas(1L)).thenReturn(lista);

    List<Map<String, Object>> resultado = service.obtenerTop6EmpresasConConteos(1L);

    assertNotNull(resultado);
    assertEquals(1, resultado.size());
    assertEquals("Empresa Test", resultado.get(0).get("nombre"));
    assertEquals(10L, resultado.get(0).get("facturas_count"));
    verify(repository, times(1)).findTop6EmpresasWithFacturas(1L);
  }
}
