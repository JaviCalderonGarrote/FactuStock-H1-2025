package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.*;
import IDP_H1.FactuStock.Services.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FacturaControllerTest {

  @InjectMocks
  FacturaController facturaController;

  @Mock
  FacturaService facturaService;

  @Mock
  ProductoService productoService;

  @Mock
  EmpresaPersonaFisicaService empresaPersonaFisicaService;

  @Mock
  PDFService pdfService;

  @Mock
  EmailService emailService;

  private Factura factura;
  private EmpresaPersonaFisica cliente;
  private Organizacion organizacion;

  @BeforeEach
  void setup() {
    MockitoAnnotations.openMocks(this);

    organizacion = new Organizacion();
    organizacion.setId(1L);
    organizacion.setNombre("OrgTest");
    organizacion.setDireccion("Direccion");
    organizacion.setTelefono("123456789");
    organizacion.setEmail("org@test.com");

    cliente = new EmpresaPersonaFisica();
    cliente.setId(1L);
    cliente.setNombre("Cliente Test");
    cliente.setMail("cliente@test.com");

    factura = new Factura();
    factura.setId(1L);
    factura.setNumeroFactura("Fac_1_23/05/00001");
    factura.setEmpresaPersonaFisica(cliente);
    factura.setOrganizacion(organizacion);
    factura.setFecha(LocalDateTime.now());
    factura.setFechaCreacionFactura(LocalDateTime.now());
    factura.setEstado(EstadoFactura.ENVIADA);
    factura.setFormaPago(FormaPago.EFECTIVO);
    factura.setDetalles(new ArrayList<>());
    factura.setTotal(100.0);
  }

  @Test
  void obtenerTodas_RetornaListaFacturas() {
    List<Factura> lista = List.of(factura);
    when(facturaService.obtenerTodas()).thenReturn(lista);

    ResponseEntity<List<Factura>> response = facturaController.obtenerTodas();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(lista, response.getBody());
    verify(facturaService).obtenerTodas();
  }

  @Test
  void obtenerPorId_FacturaExistente_RetornaFactura() {
    when(facturaService.obtenerPorId(1L)).thenReturn(factura);

    ResponseEntity<Factura> response = facturaController.obtenerPorId(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(factura, response.getBody());
  }

  @Test
  void obtenerPorId_FacturaNoExistente_RetornaNotFound() {
    when(facturaService.obtenerPorId(1L)).thenReturn(null);

    ResponseEntity<Factura> response = facturaController.obtenerPorId(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void obtenerFacturasPorOrganizacion_NoVacio_RetornaFacturas() {
    List<Factura> facturas = List.of(factura);
    when(facturaService.obtenerFacturasPorOrganizacion(any())).thenReturn(facturas);

    ResponseEntity<List<Factura>> response = facturaController.obtenerFacturasPorOrganizacion(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(facturas, response.getBody());
  }

  @Test
  void obtenerFacturasPorOrganizacion_Vacio_RetornaNoContent() {
    when(facturaService.obtenerFacturasPorOrganizacion(any())).thenReturn(Collections.emptyList());

    ResponseEntity<List<Factura>> response = facturaController.obtenerFacturasPorOrganizacion(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void contarFacturas_RetornaCount() {
    when(facturaService.countByMonthAndYear(5, 2023)).thenReturn(10);

    ResponseEntity<Integer> response = facturaController.contarFacturas(5, 2023);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(10, response.getBody());
  }

  @Test
  void guardar_FacturaSinFecha_RetornaBadRequest() {
    factura.setFecha(null);

    ResponseEntity<?> response = facturaController.guardar(factura);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("La fecha de la factura es obligatoria.", response.getBody());
  }

  @Test
  void guardar_ClienteNoEncontrado_RetornaNotFound() {
    when(empresaPersonaFisicaService.obtenerPorId(anyLong())).thenReturn(Optional.empty());

    ResponseEntity<?> response = facturaController.guardar(factura);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Cliente no encontrado.", response.getBody());
  }

  @Test
  void guardar_FacturaValida_RetornaCreatedYEnvioCorreo() throws Exception {
    factura.setFecha(LocalDateTime.now());
    when(empresaPersonaFisicaService.obtenerPorId(anyLong())).thenReturn(Optional.of(cliente));
    when(facturaService.guardar(any())).thenReturn(factura);
    when(pdfService.generarPDF(any())).thenReturn("pdf".getBytes());

    ResponseEntity<?> response = facturaController.guardar(factura);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertTrue(response.getBody() instanceof Factura);
    verify(emailService).enviarCorreoConAdjunto(anyString(), anyString(), anyString(), any(MultipartFile.class));
  }

  @Test
  void actualizarFactura_FacturaNoEncontrada_RetornaNotFound() {
    when(facturaService.obtenerPorId(1L)).thenReturn(null);

    ResponseEntity<?> response = facturaController.actualizarFactura(1L, factura);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Factura no encontrada.", response.getBody());
  }

  @Test
  void actualizarFactura_FacturaCompletaNoCobrada_RetornaBadRequest() {
    factura.setEstado(EstadoFactura.COMPLETADA);
    factura.setFormaPago(FormaPago.NoCobrada);
    when(facturaService.obtenerPorId(1L)).thenReturn(factura);

    ResponseEntity<?> response = facturaController.actualizarFactura(1L, factura);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("Una factura completada no puede estar sin cobrar.", response.getBody());
  }

  @Test
  void actualizarFactura_ActualizaYRetornaOk() {
    factura.setEstado(EstadoFactura.ENVIADA);
    factura.setFormaPago(FormaPago.EFECTIVO);
    when(facturaService.obtenerPorId(1L)).thenReturn(factura);
    when(facturaService.guardar(any())).thenReturn(factura);

    ResponseEntity<?> response = facturaController.actualizarFactura(1L, factura);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertTrue(response.getBody() instanceof Factura);
  }

  @Test
  void eliminar_FacturaExistente_RetornaNoContent() {
    when(facturaService.obtenerPorId(1L)).thenReturn(factura);

    ResponseEntity<Void> response = facturaController.eliminar(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    verify(facturaService).eliminar(1L);
  }

  @Test
  void eliminar_FacturaNoExistente_RetornaNotFound() {
    when(facturaService.obtenerPorId(1L)).thenReturn(null);

    ResponseEntity<Void> response = facturaController.eliminar(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
  }

  @Test
  void descargarPDF_FacturaNoEncontrada_RetornaNotFound() {
    when(facturaService.obtenerPorId(1L)).thenReturn(null);

    ResponseEntity<byte[]> response = facturaController.descargarPDF(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
  }

  @Test
  void countFacturasNoCompletadas_RetornaCount() {
    when(facturaService.countFacturasNoCompletadasByOrganizacion(1L)).thenReturn(5L);

    ResponseEntity<Long> response = facturaController.countFacturasNoCompletadas(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(5L, response.getBody());
  }

  @Test
  void countFacturasNoCompletadas_Error_RetornaInternalServerError() {
    when(facturaService.countFacturasNoCompletadasByOrganizacion(1L)).thenThrow(new RuntimeException());

    ResponseEntity<Long> response = facturaController.countFacturasNoCompletadas(1L);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
  }
}
