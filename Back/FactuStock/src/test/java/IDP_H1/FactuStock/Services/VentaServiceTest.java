package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Venta;
import IDP_H1.FactuStock.Repositories.VentaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class VentaServiceTest {

  @InjectMocks
  private VentaService ventaService;

  @Mock
  private VentaRepository ventaRepository;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void testObtenerTodas() {
    List<Venta> ventas = List.of(new Venta(), new Venta());
    when(ventaRepository.findAll()).thenReturn(ventas);

    List<Venta> result = ventaService.obtenerTodas();
    assertEquals(2, result.size());
    verify(ventaRepository, times(1)).findAll();
  }

  @Test
  void testObtenerPorId() {
    Venta venta = new Venta();
    venta.setId(1L);
    when(ventaRepository.findById(1L)).thenReturn(Optional.of(venta));

    Optional<Venta> result = ventaService.obtenerPorId(1L);
    assertTrue(result.isPresent());
    assertEquals(1L, result.get().getId());
    verify(ventaRepository, times(1)).findById(1L);
  }

  @Test
  void testGuardar() {
    Venta venta = new Venta();
    when(ventaRepository.save(venta)).thenReturn(venta);

    Venta result = ventaService.guardar(venta);
    assertNotNull(result);
    verify(ventaRepository, times(1)).save(venta);
  }

  @Test
  void testEliminar() {
    doNothing().when(ventaRepository).deleteById(1L);

    ventaService.eliminar(1L);
    verify(ventaRepository, times(1)).deleteById(1L);
  }

  @Test
  void testObtenerVentasPorMes() {
    List<Map<String, Object>> ventasPorMes = new ArrayList<>();
    Map<String, Object> map = new HashMap<>();
    map.put("mes", 5);
    map.put("cantidad_ventas", 10L);
    ventasPorMes.add(map);

    when(ventaRepository.obtenerVentasPorMes(1L, 2025)).thenReturn(ventasPorMes);

    List<Map<String, Object>> result = ventaService.obtenerVentasPorMes(1L, 2025);
    assertFalse(result.isEmpty());
    assertEquals(5, result.get(0).get("mes"));
    verify(ventaRepository, times(1)).obtenerVentasPorMes(1L, 2025);
  }
}
