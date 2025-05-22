package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.*;
import IDP_H1.FactuStock.Repositories.FacturaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FacturaServiceTest {

  @InjectMocks
  FacturaService facturaService;

  @Mock
  FacturaRepository facturaRepository;

  @Mock
  IngresoService ingresoService;

  Factura factura;
  Organizacion organizacion;

  @BeforeEach
  void setup() {
    MockitoAnnotations.openMocks(this);

    organizacion = new Organizacion();
    organizacion.setId(1L);

    factura = new Factura();
    factura.setId(1L);
    factura.setOrganizacion(organizacion);
    factura.setFecha(LocalDateTime.of(2025, 5, 22, 0, 0));
    factura.setEstado(EstadoFactura.ENVIADA);
    factura.setTotal(100.0);
    factura.setNumeroFactura(null);
  }

  @Test
  void testGuardarFactura_NuevoNumeroFacturaGeneradoYGuardadoCorrectamente() {
    when(facturaRepository.countByMonthAndYear(anyInt(), anyInt())).thenReturn(0);
    when(facturaRepository.save(any(Factura.class))).thenAnswer(i -> i.getArgument(0));

    Factura result = facturaService.guardar(factura);

    assertNotNull(result.getNumeroFactura());
    assertTrue(result.getNumeroFactura().contains("Fac_1_25/05/"));
    verify(facturaRepository, times(1)).save(factura);
    verify(ingresoService, never()).guardar(any());
  }

  @Test
  void testGuardarFactura_FacturaEstadoCompletada_CreaIngreso() {
    factura.setEstado(EstadoFactura.COMPLETADA);
    when(facturaRepository.countByMonthAndYear(anyInt(), anyInt())).thenReturn(0);
    when(facturaRepository.save(any(Factura.class))).thenAnswer(i -> i.getArgument(0));

    Factura result = facturaService.guardar(factura);

    verify(ingresoService, times(1)).guardar(any(Ingreso.class));
    assertEquals(EstadoFactura.COMPLETADA, result.getEstado());
  }

  @Test
  void testGuardarFactura_NumeroFacturaYaExiste_ReintentaYGeneraNuevoNumero() {
    when(facturaRepository.countByMonthAndYear(anyInt(), anyInt())).thenReturn(0);
    // En el primer intento lanza excepción, luego funciona
    when(facturaRepository.save(any(Factura.class)))
            .thenThrow(DataIntegrityViolationException.class)
            .thenAnswer(i -> i.getArgument(0));

    Factura result = facturaService.guardar(factura);

    verify(facturaRepository, times(2)).save(any(Factura.class));
    assertNotNull(result.getNumeroFactura());
  }

  @Test
  void testGuardarFactura_NoSePuedeGenerarNumero_UnNumeroUnicoException() {
    when(facturaRepository.countByMonthAndYear(anyInt(), anyInt())).thenReturn(0);
    // Siempre lanza excepción para simular 100 intentos fallidos
    when(facturaRepository.save(any(Factura.class))).thenThrow(DataIntegrityViolationException.class);

    RuntimeException exception = assertThrows(RuntimeException.class,
            () -> facturaService.guardar(factura));

    assertTrue(exception.getMessage().contains("No se pudo generar un número de factura único"));
    verify(facturaRepository, times(100)).save(any(Factura.class));
  }

  @Test
  void testObtenerFacturasPorOrganizacion() {
    List<Factura> lista = Collections.singletonList(factura);
    when(facturaRepository.findByOrganizacion(organizacion)).thenReturn(lista);

    List<Factura> result = facturaService.obtenerFacturasPorOrganizacion(organizacion);

    assertEquals(1, result.size());
    verify(facturaRepository).findByOrganizacion(organizacion);
  }

  @Test
  void testCountByMonthAndYear() {
    when(facturaRepository.countByMonthAndYear(5, 2025)).thenReturn(5);

    int count = facturaService.countByMonthAndYear(5, 2025);

    assertEquals(5, count);
    verify(facturaRepository).countByMonthAndYear(5, 2025);
  }

  @Test
  void testObtenerTodas() {
    List<Factura> lista = Collections.singletonList(factura);
    when(facturaRepository.findAll()).thenReturn(lista);

    List<Factura> result = facturaService.obtenerTodas();

    assertEquals(1, result.size());
    verify(facturaRepository).findAll();
  }

  @Test
  void testObtenerPorId_FacturaExiste() {
    when(facturaRepository.findById(1L)).thenReturn(Optional.of(factura));

    Factura result = facturaService.obtenerPorId(1L);

    assertNotNull(result);
    assertEquals(1L, result.getId());
    verify(facturaRepository).findById(1L);
  }

  @Test
  void testObtenerPorId_FacturaNoExiste() {
    when(facturaRepository.findById(1L)).thenReturn(Optional.empty());

    Factura result = facturaService.obtenerPorId(1L);

    assertNull(result);
    verify(facturaRepository).findById(1L);
  }

  @Test
  void testEliminar() {
    doNothing().when(facturaRepository).deleteById(1L);

    facturaService.eliminar(1L);

    verify(facturaRepository).deleteById(1L);
  }

  @Test
  void testActualizarEstado_FacturaExiste_CambiaEstadoYGuarda() {
    factura.setEstado(EstadoFactura.ENVIADA);
    when(facturaRepository.findById(1L)).thenReturn(Optional.of(factura));
    when(facturaRepository.save(any(Factura.class))).thenAnswer(i -> i.getArgument(0));

    Factura updated = facturaService.actualizarEstado(1L, EstadoFactura.COMPLETADA);

    assertEquals(EstadoFactura.COMPLETADA, updated.getEstado());
    verify(ingresoService, times(1)).guardar(any(Ingreso.class));
    verify(facturaRepository).save(factura);
  }

  @Test
  void testActualizarEstado_FacturaNoExiste_ThrowsException() {
    when(facturaRepository.findById(1L)).thenReturn(Optional.empty());

    RuntimeException exception = assertThrows(RuntimeException.class,
            () -> facturaService.actualizarEstado(1L, EstadoFactura.ENVIADA));

    assertEquals("Factura no encontrada", exception.getMessage());
  }

  @Test
  void testCountFacturasNoCompletadasByOrganizacion() {
    when(facturaRepository.countFacturasNoCompletadasByOrganizacion(1L)).thenReturn(3L);

    long count = facturaService.countFacturasNoCompletadasByOrganizacion(1L);

    assertEquals(3L, count);
    verify(facturaRepository).countFacturasNoCompletadasByOrganizacion(1L);
  }
}
