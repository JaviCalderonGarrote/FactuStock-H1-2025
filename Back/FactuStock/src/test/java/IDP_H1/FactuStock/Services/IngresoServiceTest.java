package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Repositories.IngresoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IngresoServiceTest {

  @Mock
  private IngresoRepository ingresoRepository;

  @InjectMocks
  private IngresoService ingresoService;

  private Ingreso ingreso;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    ingreso = new Ingreso();
    ingreso.setId(1L);
    ingreso.setMonto(100.0);
    ingreso.setFecha(LocalDateTime.now());
  }

  @Test
  void obtenerTodos_RetornaLista() {
    List<Ingreso> ingresos = Arrays.asList(ingreso);
    when(ingresoRepository.findAll()).thenReturn(ingresos);

    List<Ingreso> resultado = ingresoService.obtenerTodos();

    assertEquals(ingresos, resultado);
    verify(ingresoRepository).findAll();
  }

  @Test
  void obtenerPorId_Encontrado() {
    when(ingresoRepository.findById(1L)).thenReturn(Optional.of(ingreso));

    Optional<Ingreso> resultado = ingresoService.obtenerPorId(1L);

    assertTrue(resultado.isPresent());
    assertEquals(ingreso, resultado.get());
    verify(ingresoRepository).findById(1L);
  }

  @Test
  void obtenerPorId_NoEncontrado() {
    when(ingresoRepository.findById(1L)).thenReturn(Optional.empty());

    Optional<Ingreso> resultado = ingresoService.obtenerPorId(1L);

    assertFalse(resultado.isPresent());
    verify(ingresoRepository).findById(1L);
  }

  @Test
  void obtenerPorOrganizacion_RetornaLista() {
    List<Ingreso> ingresos = Arrays.asList(ingreso);
    when(ingresoRepository.findByOrganizacionId(10L)).thenReturn(ingresos);

    List<Ingreso> resultado = ingresoService.obtenerPorOrganizacion(10L);

    assertEquals(ingresos, resultado);
    verify(ingresoRepository).findByOrganizacionId(10L);
  }

  @Test
  void guardar_DevuelveIngresoGuardado() {
    when(ingresoRepository.save(ingreso)).thenReturn(ingreso);

    Ingreso resultado = ingresoService.guardar(ingreso);

    assertEquals(ingreso, resultado);
    verify(ingresoRepository).save(ingreso);
  }

  @Test
  void eliminar_VerificaLlamadoAEliminar() {
    doNothing().when(ingresoRepository).deleteById(1L);

    ingresoService.eliminar(1L);

    verify(ingresoRepository).deleteById(1L);
  }

  @Test
  void obtenerPorCaja_RetornaLista() {
    List<Ingreso> ingresos = Arrays.asList(ingreso);
    when(ingresoRepository.findByCajaId(5L)).thenReturn(ingresos);

    List<Ingreso> resultado = ingresoService.obtenerPorCaja(5L);

    assertEquals(ingresos, resultado);
    verify(ingresoRepository).findByCajaId(5L);
  }

  @Test
  void obtenerPorFactura_RetornaLista() {
    List<Ingreso> ingresos = Arrays.asList(ingreso);
    when(ingresoRepository.findByFacturaId(7L)).thenReturn(ingresos);

    List<Ingreso> resultado = ingresoService.obtenerPorFactura(7L);

    assertEquals(ingresos, resultado);
    verify(ingresoRepository).findByFacturaId(7L);
  }

  @Test
  void obtenerTotalIngresosPorAno_RetornaTotalNoNull() {
    when(ingresoRepository.sumMontoByOrganizacionIdAndYear(10L, 2023)).thenReturn(250.0);

    Double resultado = ingresoService.obtenerTotalIngresosPorAno(10L, 2023);

    assertEquals(250.0, resultado);
    verify(ingresoRepository).sumMontoByOrganizacionIdAndYear(10L, 2023);
  }

  @Test
  void obtenerTotalIngresosPorAno_Retorna0SiNull() {
    when(ingresoRepository.sumMontoByOrganizacionIdAndYear(10L, 2023)).thenReturn(null);

    Double resultado = ingresoService.obtenerTotalIngresosPorAno(10L, 2023);

    assertEquals(0.0, resultado);
    verify(ingresoRepository).sumMontoByOrganizacionIdAndYear(10L, 2023);
  }

  @Test
  void obtenerIngresosMensuales_RetornaLista() {
    List<Map<String, Object>> ingresosMensuales = new ArrayList<>();
    Map<String, Object> mes = new HashMap<>();
    mes.put("mes", "2023-01");
    mes.put("ingresos", 100.0);
    ingresosMensuales.add(mes);

    when(ingresoRepository.getIngresosMensuales(10L, 2023)).thenReturn(ingresosMensuales);

    List<Map<String, Object>> resultado = ingresoService.obtenerIngresosMensuales(10L, 2023);

    assertEquals(ingresosMensuales, resultado);
    verify(ingresoRepository).getIngresosMensuales(10L, 2023);
  }

  @Test
  void obtenerIngresosMensuales_IdNull_LanzaException() {
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      ingresoService.obtenerIngresosMensuales(null, 2023);
    });
    assertEquals("El id de organización no puede ser null", thrown.getMessage());
  }

}
