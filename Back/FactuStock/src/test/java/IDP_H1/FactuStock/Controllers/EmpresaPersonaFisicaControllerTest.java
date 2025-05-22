package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.EmpresaPersonaFisica;
import IDP_H1.FactuStock.Entities.TipoEmpresa;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Services.EmpresaPersonaFisicaService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class EmpresaPersonaFisicaControllerTest {

  @Mock
  private EmpresaPersonaFisicaService service;

  @InjectMocks
  private EmpresaPersonaFisicaController controller;

  private EmpresaPersonaFisica empresa;
  private Organizacion organizacion;

  @BeforeEach
  void setup() {
    org.mockito.MockitoAnnotations.openMocks(this);

    organizacion = new Organizacion();
    organizacion.setId(1L);

    empresa = new EmpresaPersonaFisica();
    empresa.setId(1L);
    empresa.setNombre("Empresa Test");
    empresa.setNifCif("12345678A");
    empresa.setTelefono("123456789");
    empresa.setDireccion("Calle Falsa 123");
    empresa.setWeb("http://empresa.test");
    empresa.setMail("contacto@empresa.test");
    empresa.setTipo(TipoEmpresa.CLIENTE);
    empresa.setOrganizacion(organizacion);
  }

  @Test
  void testObtenerTodos() {
    List<EmpresaPersonaFisica> list = List.of(empresa);
    when(service.obtenerTodos()).thenReturn(list);

    ResponseEntity<List<EmpresaPersonaFisica>> response = controller.obtenerTodos();

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(list, response.getBody());
    verify(service).obtenerTodos();
  }

  @Test
  void testObtenerPorIdEncontrado() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(empresa));

    ResponseEntity<EmpresaPersonaFisica> response = controller.obtenerPorId(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(empresa, response.getBody());
    verify(service).obtenerPorId(1L);
  }

  @Test
  void testObtenerPorIdNoEncontrado() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<EmpresaPersonaFisica> response = controller.obtenerPorId(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
    verify(service).obtenerPorId(1L);
  }

  @Test
  void testGuardarExitoso() {
    when(service.guardar(ArgumentMatchers.any(EmpresaPersonaFisica.class))).thenReturn(empresa);

    ResponseEntity<EmpresaPersonaFisica> response = controller.guardar(empresa);

    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertEquals(empresa, response.getBody());
    verify(service).guardar(empresa);
  }

  @Test
  void testGuardarError() {
    when(service.guardar(ArgumentMatchers.any(EmpresaPersonaFisica.class))).thenThrow(new RuntimeException());

    ResponseEntity<EmpresaPersonaFisica> response = controller.guardar(empresa);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNull(response.getBody());
    verify(service).guardar(empresa);
  }

  @Test
  void testEditarEncontrado() {
    EmpresaPersonaFisica updated = new EmpresaPersonaFisica();
    updated.setNombre("Nuevo Nombre");
    updated.setNifCif("98765432B");
    updated.setTelefono("987654321");
    updated.setDireccion("Otra Calle 456");
    updated.setWeb("http://nuevo.web");
    updated.setMail("nuevo@mail.com");
    updated.setTipo(TipoEmpresa.PROVEEDOR);
    updated.setOrganizacion(organizacion);

    when(service.obtenerPorId(1L)).thenReturn(Optional.of(empresa));
    when(service.guardar(ArgumentMatchers.any(EmpresaPersonaFisica.class))).thenAnswer(invocation -> invocation.getArgument(0));

    ResponseEntity<EmpresaPersonaFisica> response = controller.editar(1L, updated);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    EmpresaPersonaFisica body = response.getBody();
    assertNotNull(body);
    assertEquals("Nuevo Nombre", body.getNombre());
    assertEquals("98765432B", body.getNifCif());
    assertEquals("987654321", body.getTelefono());
    assertEquals("Otra Calle 456", body.getDireccion());
    assertEquals("http://nuevo.web", body.getWeb());
    assertEquals("nuevo@mail.com", body.getMail());
    assertEquals(TipoEmpresa.PROVEEDOR, body.getTipo());
    verify(service).obtenerPorId(1L);
    verify(service).guardar(any(EmpresaPersonaFisica.class));
  }

  @Test
  void testEditarNoEncontrado() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<EmpresaPersonaFisica> response = controller.editar(1L, empresa);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNull(response.getBody());
    verify(service).obtenerPorId(1L);
    verify(service, never()).guardar(any());
  }

  @Test
  void testEliminarExitoso() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(empresa));
    doNothing().when(service).eliminar(1L);

    ResponseEntity<String> response = controller.eliminar(1L);

    assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    assertNull(response.getBody());
    verify(service).obtenerPorId(1L);
    verify(service).eliminar(1L);
  }

  @Test
  void testEliminarNoEncontrado() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.empty());

    ResponseEntity<String> response = controller.eliminar(1L);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Registro no encontrado", response.getBody());
    verify(service).obtenerPorId(1L);
    verify(service, never()).eliminar(anyLong());
  }

  @Test
  void testEliminarDataIntegrityViolation() {
    when(service.obtenerPorId(1L)).thenReturn(Optional.of(empresa));
    doThrow(DataIntegrityViolationException.class).when(service).eliminar(1L);

    ResponseEntity<String> response = controller.eliminar(1L);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("No se puede eliminar el registro porque tiene relaciones asociadas.", response.getBody());
    verify(service).obtenerPorId(1L);
    verify(service).eliminar(1L);
  }

  @Test
  void testGetEmpresasByOrganizacionConDatos() {
    List<EmpresaPersonaFisica> list = List.of(empresa);
    when(service.findByOrganizacion(1L)).thenReturn(list);

    ResponseEntity<?> response = controller.getEmpresasByOrganizacion(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(list, response.getBody());
    verify(service).findByOrganizacion(1L);
  }

  @Test
  void testGetEmpresasByOrganizacionSinDatos() {
    when(service.findByOrganizacion(1L)).thenReturn(Collections.emptyList());

    ResponseEntity<?> response = controller.getEmpresasByOrganizacion(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertTrue(response.getBody() instanceof Map);
    Map<?, ?> body = (Map<?, ?>) response.getBody();
    assertEquals("No hay datos en la base de datos para esta organización", body.get("message"));
    verify(service).findByOrganizacion(1L);
  }

  @Test
  void testObtenerTop6EmpresasFacturas() {
    List<Map<String, Object>> top6 = new ArrayList<>();
    Map<String, Object> entry = new HashMap<>();
    entry.put("nombre", "Empresa Test");
    entry.put("facturas_count", 10L);
    top6.add(entry);

    when(service.obtenerTop6EmpresasConConteos(1L)).thenReturn(top6);

    ResponseEntity<List<Map<String, Object>>> response = controller.obtenerTop6EmpresasFacturas(1L);

    assertEquals(HttpStatus.OK, response.getStatusCode());
    assertEquals(top6, response.getBody());
    verify(service).obtenerTop6EmpresasConConteos(1L);
  }
}
