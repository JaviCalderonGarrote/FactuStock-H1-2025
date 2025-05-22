package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Gasto;
import IDP_H1.FactuStock.Repositories.GastoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GastoServiceTest {

  @InjectMocks
  private GastoService gastoService;

  @Mock
  private GastoRepository gastoRepository;

  private Gasto gastoEjemplo;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    gastoEjemplo = new Gasto();
    gastoEjemplo.setId(1L);
    gastoEjemplo.setMonto(100.0);
  }

  @Test
  void testObtenerTodos() {
    List<Gasto> lista = Arrays.asList(gastoEjemplo);
    when(gastoRepository.findAll()).thenReturn(lista);

    List<Gasto> result = gastoService.obtenerTodos();

    assertNotNull(result);
    assertEquals(1, result.size());
    verify(gastoRepository).findAll();
  }

  @Test
  void testObtenerPorIdEncontrado() {
    when(gastoRepository.findById(1L)).thenReturn(Optional.of(gastoEjemplo));

    Optional<Gasto> result = gastoService.obtenerPorId(1L);

    assertTrue(result.isPresent());
    assertEquals(gastoEjemplo, result.get());
    verify(gastoRepository).findById(1L);
  }

  @Test
  void testObtenerPorIdNoEncontrado() {
    when(gastoRepository.findById(1L)).thenReturn(Optional.empty());

    Optional<Gasto> result = gastoService.obtenerPorId(1L);

    assertFalse(result.isPresent());
    verify(gastoRepository).findById(1L);
  }

  @Test
  void testGuardar() {
    when(gastoRepository.save(any(Gasto.class))).thenReturn(gastoEjemplo);

    Gasto result = gastoService.guardar(gastoEjemplo);

    assertNotNull(result);
    assertEquals(gastoEjemplo, result);
    verify(gastoRepository).save(gastoEjemplo);
  }

  @Test
  void testEliminar() {
    doNothing().when(gastoRepository).deleteById(1L);

    gastoService.eliminar(1L);

    verify(gastoRepository).deleteById(1L);
  }

  @Test
  void testObtenerPorOrganizacion() {
    List<Gasto> lista = Arrays.asList(gastoEjemplo);
    when(gastoRepository.findByOrganizacionId(1L)).thenReturn(lista);

    List<Gasto> result = gastoService.obtenerPorOrganizacion(1L);

    assertNotNull(result);
    assertEquals(1, result.size());
    verify(gastoRepository).findByOrganizacionId(1L);
  }

  @Test
  void testObtenerTotalGastosPorAnoConValor() {
    when(gastoRepository.sumMontoByOrganizacionIdAndYear(1L, 2025)).thenReturn(500.0);

    Double total = gastoService.obtenerTotalGastosPorAno(1L, 2025);

    assertEquals(500.0, total);
    verify(gastoRepository).sumMontoByOrganizacionIdAndYear(1L, 2025);
  }

  @Test
  void testObtenerTotalGastosPorAnoNulo() {
    when(gastoRepository.sumMontoByOrganizacionIdAndYear(1L, 2025)).thenReturn(null);

    Double total = gastoService.obtenerTotalGastosPorAno(1L, 2025);

    assertEquals(0.0, total);
    verify(gastoRepository).sumMontoByOrganizacionIdAndYear(1L, 2025);
  }

  @Test
  void testObtenerGastosMensuales() {
    List<Map<String, Object>> gastosMensuales = new ArrayList<>();
    Map<String, Object> mes = new HashMap<>();
    mes.put("mes", "2025-05");
    mes.put("total", 1000.0);
    gastosMensuales.add(mes);

    when(gastoRepository.getGastosMensuales(1L, 2025)).thenReturn(gastosMensuales);

    List<Map<String, Object>> result = gastoService.obtenerGastosMensuales(1L, 2025);

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("2025-05", result.get(0).get("mes"));
    assertEquals(1000.0, result.get(0).get("total"));
    verify(gastoRepository).getGastosMensuales(1L, 2025);
  }

  @Test
  void testObtenerGastosMensualesConOrganizacionNull() {
    IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
      gastoService.obtenerGastosMensuales(null, 2025);
    });
    assertEquals("El id de organización no puede ser null", exception.getMessage());
  }
}
