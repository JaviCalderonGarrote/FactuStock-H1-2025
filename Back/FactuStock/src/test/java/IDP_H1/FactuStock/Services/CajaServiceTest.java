package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Caja;
import IDP_H1.FactuStock.Entities.EstadoCaja;
import IDP_H1.FactuStock.Entities.Ingreso;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.CajaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CajaServiceTest {

  @InjectMocks
  private CajaService cajaService;

  @Mock
  private CajaRepository repository;

  @Mock
  private IngresoService ingresoService;

  private Organizacion organizacion;

  @BeforeEach
  void setUp() {
    organizacion = new Organizacion();
    organizacion.setId(1L);
  }

  private Caja crearCajaAbierta() {
    Caja caja = new Caja();
    caja.setId(1L);
    caja.setEstado(EstadoCaja.ABIERTA);
    caja.setFechaInicio(LocalDateTime.now().minusHours(1));
    caja.setOrganizacion(organizacion);
    return caja;
  }

  @Test
  void testObtenerTodas() {
    List<Caja> cajas = Arrays.asList(new Caja(), new Caja());
    when(repository.findAll()).thenReturn(cajas);

    List<Caja> resultado = cajaService.obtenerTodas();

    assertEquals(2, resultado.size());
    verify(repository).findAll();
  }

  @Test
  void testObtenerPorIdExistente() {
    Caja caja = new Caja();
    caja.setId(1L);
    when(repository.findById(1L)).thenReturn(Optional.of(caja));

    Optional<Caja> resultado = cajaService.obtenerPorId(1L);

    assertTrue(resultado.isPresent());
    assertEquals(1L, resultado.get().getId());
  }

  @Test
  void testObtenerPorIdNoExistente() {
    when(repository.findById(1L)).thenReturn(Optional.empty());

    Optional<Caja> resultado = cajaService.obtenerPorId(1L);

    assertFalse(resultado.isPresent());
  }

  @Test
  void testGuardarCajaSinFechaInicio() {
    Caja caja = new Caja();
    caja.setOrganizacion(organizacion);
    when(repository.save(any(Caja.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Caja resultado = cajaService.guardar(caja);

    assertNotNull(resultado.getFechaInicio());
    verify(repository).save(caja);
  }

  @Test
  void testEliminarCaja() {
    doNothing().when(repository).deleteById(1L);

    cajaService.eliminar(1L);

    verify(repository).deleteById(1L);
  }

  @Test
  void testObtenerCajaAbiertaSinCajas() {
    when(repository.findByEstadoAndOrganizacionId(EstadoCaja.ABIERTA, 1L)).thenReturn(Collections.emptyList());

    Optional<Caja> resultado = cajaService.obtenerCajaAbierta(1L);

    assertFalse(resultado.isPresent());
  }

  @Test
  void testObtenerCajaAbiertaConUnaCaja() {
    Caja caja = crearCajaAbierta();
    when(repository.findByEstadoAndOrganizacionId(EstadoCaja.ABIERTA, 1L)).thenReturn(Collections.singletonList(caja));

    Optional<Caja> resultado = cajaService.obtenerCajaAbierta(1L);

    assertTrue(resultado.isPresent());
    assertEquals(caja, resultado.get());
  }

  @Test
  void testObtenerCajaAbiertaConMultiplesCajas() {
    Caja caja1 = crearCajaAbierta();
    caja1.setFechaInicio(LocalDateTime.now().minusHours(2));
    Caja caja2 = crearCajaAbierta();
    caja2.setFechaInicio(LocalDateTime.now().minusHours(1));
    when(repository.findByEstadoAndOrganizacionId(EstadoCaja.ABIERTA, 1L)).thenReturn(Arrays.asList(caja1, caja2));

    Optional<Caja> resultado = cajaService.obtenerCajaAbierta(1L);

    assertTrue(resultado.isPresent());
    assertEquals(caja2, resultado.get());
  }

  @Test
  void testAbrirNuevaCajaSinCajaAbierta() {
    Caja nuevaCaja = new Caja();
    nuevaCaja.setOrganizacion(organizacion);
    when(repository.findByEstadoAndOrganizacionId(EstadoCaja.ABIERTA, 1L)).thenReturn(Collections.emptyList());
    when(repository.save(any(Caja.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Caja resultado = cajaService.abrirNuevaCaja(nuevaCaja);

    assertEquals(EstadoCaja.ABIERTA, resultado.getEstado());
    assertNotNull(resultado.getFechaInicio());
    assertEquals(0.0, resultado.getTotalIngresado());
    assertEquals(0, resultado.getCantidadVentas());
  }

  @Test
  void testAbrirNuevaCajaConCajaAbierta() {
    Caja cajaAbierta = crearCajaAbierta();
    Caja nuevaCaja = new Caja();
    nuevaCaja.setOrganizacion(organizacion);
    when(repository.findByEstadoAndOrganizacionId(EstadoCaja.ABIERTA, 1L)).thenReturn(Collections.singletonList(cajaAbierta));
    when(repository.findById(cajaAbierta.getId())).thenReturn(Optional.of(cajaAbierta));
    when(repository.save(any(Caja.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(ingresoService.guardar(any(Ingreso.class))).thenReturn(new Ingreso());

    Caja resultado = cajaService.abrirNuevaCaja(nuevaCaja);

    assertEquals(EstadoCaja.ABIERTA, resultado.getEstado());
    assertNotNull(resultado.getFechaInicio());
    assertEquals(0.0, resultado.getTotalIngresado());
    assertEquals(0, resultado.getCantidadVentas());
  }

  @Test
  void testCerrarCajaExistente() {
    Caja caja = crearCajaAbierta();
    caja.setTotalIngresado(100.0);
    when(repository.findById(1L)).thenReturn(Optional.of(caja));
    when(repository.save(any(Caja.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(ingresoService.guardar(any(Ingreso.class))).thenReturn(new Ingreso());

    Caja resultado = cajaService.cerrarCaja(1L);

    assertEquals(EstadoCaja.CERRADA, resultado.getEstado());
    assertNotNull(resultado.getFechaFin());
  }

  @Test
  void testCerrarCajaNoExistente() {
    when(repository.findById(1L)).thenReturn(Optional.empty());

    Exception exception = assertThrows(RuntimeException.class, () -> cajaService.cerrarCaja(1L));

    assertEquals("Caja no encontrada con ID: 1", exception.getMessage());
  }

  @Test
  void testCerrarCajaYaCerrada() {
    Caja caja = crearCajaAbierta();
    caja.setEstado(EstadoCaja.CERRADA);
    when(repository.findById(1L)).thenReturn(Optional.of(caja));

    Exception exception = assertThrows(RuntimeException.class, () -> cajaService.cerrarCaja(1L));

    assertEquals("La caja ya está cerrada", exception.getMessage());
  }

  @Test
  void testActualizarCajaExistente() {
    Caja cajaExistente = crearCajaAbierta();
    cajaExistente.setId(1L);
    Caja cajaActualizada = crearCajaAbierta();
    cajaActualizada.setId(1L);
    cajaActualizada.setTotalIngresado(200.0);
    cajaActualizada.setCantidadVentas(5);
    when(repository.findById(1L)).thenReturn(Optional.of(cajaExistente));
    when(repository.save(any(Caja.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Caja resultado = cajaService.actualizarCaja(cajaActualizada);

    assertEquals(200.0, resultado.getTotalIngresado());
    assertEquals(5, resultado.getCantidadVentas());
  }

  @Test
  void testActualizarCajaNoExistente() {
    Caja cajaActualizada = new Caja();
    cajaActualizada.setId(1L);
    when(repository.findById(1L)).thenReturn(Optional.empty());

    Exception exception = assertThrows(RuntimeException.class, () -> cajaService.actualizarCaja(cajaActualizada));

    assertEquals("Caja no encontrada con ID: 1", exception.getMessage());
  }

  @Test
  void testObtenerPorOrganizacion() {
    List<Caja> cajas = Arrays.asList(new Caja(), new Caja());
    when(repository.findByOrganizacionId(1L)).thenReturn(cajas);

    List<Caja> resultado = cajaService.obtenerPorOrganizacion(1L);

    assertEquals(2, resultado.size());
    verify(repository).findByOrganizacionId(1L);
  }

  @Test
  void testAbrirNuevaCajaPorOrganizacionSinCajaAbierta() {
    Caja nuevaCaja = new Caja();
    nuevaCaja.setOrganizacion(organizacion);
    when(repository.findByEstadoAndOrganizacionId(EstadoCaja.ABIERTA, 1L)).thenReturn(Collections.emptyList());
    when(repository.save(any(Caja.class))).thenAnswer(invocation -> invocation.getArgument(0));

    Caja resultado = cajaService.abrirNuevaCajaPorOrganizacion(nuevaCaja, 1L);

    assertEquals(EstadoCaja.ABIERTA, resultado.getEstado());
    assertNotNull(resultado.getFechaInicio());
    assertEquals(0.0, resultado.getTotalIngresado());
    assertEquals(0, resultado.getCantidadVentas());
  }

  @Test
  void testObtenerCajaAbiertaConTotalConDatos() {
    Object[] data = {"Caja Principal", 150.0};
    when(repository.obtenerCajaAbiertaConTotal(1L)).thenReturn(Optional.of(data));

    Map<String, Object> resultado = cajaService.obtenerCajaAbiertaConTotal(1L);

    assertEquals("Caja Principal", resultado.get("nombre"));
    assertEquals(150.0, resultado.get("totalIngresado"));
  }

  @Test
  void testObtenerCajaAbiertaConTotalSinDatos() {
    when(repository.obtenerCajaAbiertaConTotal(1L)).thenReturn(Optional.empty());

    Map<String, Object> resultado = cajaService.obtenerCajaAbiertaConTotal(1L);

    assertEquals("No hay caja abierta", resultado.get("nombre"));
    assertEquals(0.0, resultado.get("totalIngresado"));
  }
}
