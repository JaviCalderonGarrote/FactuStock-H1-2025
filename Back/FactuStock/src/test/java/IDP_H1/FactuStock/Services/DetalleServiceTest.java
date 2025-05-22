package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Detalle;
import IDP_H1.FactuStock.Repositories.DetalleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DetalleServiceTest {

  @Mock
  private DetalleRepository detalleRepository;

  @InjectMocks
  private DetalleService detalleService;

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
  void obtenerTodos_DebeRetornarLista() {
    List<Detalle> lista = List.of(detalle);
    when(detalleRepository.findAll()).thenReturn(lista);

    List<Detalle> resultado = detalleService.obtenerTodos();

    assertFalse(resultado.isEmpty());
    assertEquals(1, resultado.size());
    verify(detalleRepository).findAll();
  }

  @Test
  void obtenerPorId_CuandoExiste_DebeRetornarDetalle() {
    when(detalleRepository.findById(1L)).thenReturn(Optional.of(detalle));

    Optional<Detalle> resultado = detalleService.obtenerPorId(1L);

    assertTrue(resultado.isPresent());
    assertEquals(detalle.getId(), resultado.get().getId());
    verify(detalleRepository).findById(1L);
  }

  @Test
  void obtenerPorId_CuandoNoExiste_DebeRetornarVacio() {
    when(detalleRepository.findById(1L)).thenReturn(Optional.empty());

    Optional<Detalle> resultado = detalleService.obtenerPorId(1L);

    assertFalse(resultado.isPresent());
    verify(detalleRepository).findById(1L);
  }

  @Test
  void guardar_DebeGuardarYRetornarDetalle() {
    when(detalleRepository.save(detalle)).thenReturn(detalle);

    Detalle resultado = detalleService.guardar(detalle);

    assertNotNull(resultado);
    assertEquals(detalle.getId(), resultado.getId());
    verify(detalleRepository).save(detalle);
  }

  @Test
  void eliminar_DebeEliminarDetalle() {
    doNothing().when(detalleRepository).deleteById(1L);

    detalleService.eliminar(1L);

    verify(detalleRepository).deleteById(1L);
  }

  @Test
  void actualizar_CuandoExiste_DebeActualizarYRetornarDetalle() {
    Detalle actualizado = new Detalle();
    actualizado.setCantidad(20);
    actualizado.setIva(10);
    actualizado.setPrecioUnitario(200.0);
    actualizado.setSubtotal(2200.0);

    when(detalleRepository.findById(1L)).thenReturn(Optional.of(detalle));
    when(detalleRepository.save(any(Detalle.class))).thenAnswer(i -> i.getArgument(0));

    Detalle resultado = detalleService.actualizar(1L, actualizado);

    assertNotNull(resultado);
    assertEquals(20, resultado.getCantidad());
    assertEquals(10, resultado.getIva());
    assertEquals(200.0, resultado.getPrecioUnitario());
    assertEquals(2200.0, resultado.getSubtotal());
    verify(detalleRepository).findById(1L);
    verify(detalleRepository).save(any(Detalle.class));
  }

  @Test
  void actualizar_CuandoNoExiste_DebeRetornarNull() {
    when(detalleRepository.findById(1L)).thenReturn(Optional.empty());

    Detalle resultado = detalleService.actualizar(1L, detalle);

    assertNull(resultado);
    verify(detalleRepository).findById(1L);
  }

  @Test
  void obtenerTop5ProductosMasVendidos_CuandoHayResultados_DebeRetornarMapa() {
    Object[] fila1 = new Object[]{"ProductoA", 50L};
    Object[] fila2 = new Object[]{"ProductoB", 40L};
    List<Object[]> resultados = List.of(fila1, fila2);

    when(detalleRepository.findTop5ProductosMasVendidos(1L)).thenReturn(resultados);

    Map<String, Long> top5 = detalleService.obtenerTop5ProductosMasVendidos(1L);

    assertEquals(2, top5.size());
    assertEquals(50L, top5.get("ProductoA"));
    assertEquals(40L, top5.get("ProductoB"));
    verify(detalleRepository).findTop5ProductosMasVendidos(1L);
  }

  @Test
  void obtenerTop5ProductosMasVendidos_CuandoNoHayResultados_DebeRetornarMapaVacio() {
    when(detalleRepository.findTop5ProductosMasVendidos(1L)).thenReturn(Collections.emptyList());

    Map<String, Long> top5 = detalleService.obtenerTop5ProductosMasVendidos(1L);

    assertTrue(top5.isEmpty());
    verify(detalleRepository).findTop5ProductosMasVendidos(1L);
  }

  @Test
  void obtenerTop5ProductosMasVendidos_CuandoConsultaDevuelveNull_DebeRetornarMapaVacio() {
    when(detalleRepository.findTop5ProductosMasVendidos(1L)).thenReturn(null);

    Map<String, Long> top5 = detalleService.obtenerTop5ProductosMasVendidos(1L);

    assertTrue(top5.isEmpty());
    verify(detalleRepository).findTop5ProductosMasVendidos(1L);
  }
}
