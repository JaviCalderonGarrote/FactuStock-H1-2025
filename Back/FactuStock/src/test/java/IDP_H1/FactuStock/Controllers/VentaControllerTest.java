package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.*;
import IDP_H1.FactuStock.Services.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class VentaControllerTest {

  private MockMvc mockMvc;

  private ObjectMapper objectMapper;

  @InjectMocks
  private VentaController ventaController;

  @Mock
  private VentaService ventaService;

  @Mock
  private ProductoService productoService;

  @Mock
  private CajaService cajaService;

  @Mock
  private EmpresaPersonaFisicaService empresaPersonaFisicaService;

  @BeforeEach
  void setup() {
    MockitoAnnotations.openMocks(this);
    ventaController = new VentaController();

    // Inyectar mocks en campos privados del controller
    ReflectionTestUtils.setField(ventaController, "ventaService", ventaService);
    ReflectionTestUtils.setField(ventaController, "productoService", productoService);
    ReflectionTestUtils.setField(ventaController, "cajaService", cajaService);
    ReflectionTestUtils.setField(ventaController, "empresaPersonaFisicaService", empresaPersonaFisicaService);

    mockMvc = MockMvcBuilders.standaloneSetup(ventaController)
            .setControllerAdvice(ventaController)
            .build();

    objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule()); // Para LocalDateTime
    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
  }

  @Test
  void testObtenerTodas() throws Exception {
    Venta venta = new Venta();
    venta.setId(1L);
    venta.setFecha(LocalDateTime.now());
    List<Venta> lista = Collections.singletonList(venta);

    when(ventaService.obtenerTodas()).thenReturn(lista);

    mockMvc.perform(get("/ventas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id", is(1)));

    verify(ventaService).obtenerTodas();
  }

  @Test
  void testObtenerPorId_Found() throws Exception {
    Venta venta = new Venta();
    venta.setId(1L);
    venta.setFecha(LocalDateTime.now());

    when(ventaService.obtenerPorId(1L)).thenReturn(Optional.of(venta));

    mockMvc.perform(get("/ventas/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(1)));

    verify(ventaService).obtenerPorId(1L);
  }

  @Test
  void testObtenerPorId_NotFound() throws Exception {
    when(ventaService.obtenerPorId(1L)).thenReturn(Optional.empty());

    mockMvc.perform(get("/ventas/1"))
            .andExpect(status().isNotFound());

    verify(ventaService).obtenerPorId(1L);
  }

  @Test
  void testGuardarVenta_Exito() throws Exception {
    Venta venta = new Venta();
    venta.setFecha(LocalDateTime.now());

    Organizacion org = new Organizacion();
    org.setId(1L);
    venta.setOrganizacion(org);

    Caja caja = new Caja();
    caja.setId(1L);
    caja.setTotalIngresado(0.0);
    caja.setCantidadVentas(0);

    when(cajaService.obtenerCajaAbierta(1L)).thenReturn(Optional.of(caja));

    venta.setDetalles(new ArrayList<>());

    Venta ventaGuardada = new Venta();
    ventaGuardada.setId(1L);
    ventaGuardada.setFecha(LocalDateTime.now());
    ventaGuardada.setOrganizacion(org);

    when(ventaService.guardar(any(Venta.class))).thenReturn(ventaGuardada);

    String json = objectMapper.writeValueAsString(venta);

    mockMvc.perform(post("/ventas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", is(1)));

    verify(cajaService).obtenerCajaAbierta(1L);
    verify(ventaService).guardar(any(Venta.class));
    verify(cajaService).guardar(any(Caja.class));
  }

  @Test
  void testGuardarVenta_NoOrganizacion() throws Exception {
    Venta venta = new Venta(); // sin organizacion
    String json = objectMapper.writeValueAsString(venta);

    mockMvc.perform(post("/ventas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(containsString("La organización es requerida")));

    verifyNoInteractions(cajaService);
    verifyNoInteractions(ventaService);
  }

  @Test
  void testGuardarVenta_NoCajaAbierta() throws Exception {
    Venta venta = new Venta();
    Organizacion org = new Organizacion();
    org.setId(1L);
    venta.setOrganizacion(org);

    when(cajaService.obtenerCajaAbierta(1L)).thenReturn(Optional.empty());

    String json = objectMapper.writeValueAsString(venta);

    mockMvc.perform(post("/ventas")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isBadRequest())
            .andExpect(content().string(containsString("No hay una caja abierta")));

    verify(cajaService).obtenerCajaAbierta(1L);
    verifyNoMoreInteractions(cajaService);
    verifyNoInteractions(ventaService);
  }

  @Test
  void testActualizarVenta_Existente() throws Exception {
    Venta venta = new Venta();
    venta.setFecha(LocalDateTime.now());

    when(ventaService.obtenerPorId(1L)).thenReturn(Optional.of(venta));
    when(ventaService.guardar(any(Venta.class))).thenReturn(venta);

    String json = objectMapper.writeValueAsString(venta);

    mockMvc.perform(put("/ventas/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isOk());

    verify(ventaService).obtenerPorId(1L);
    verify(ventaService).guardar(any(Venta.class));
  }

  @Test
  void testActualizarVenta_NoExistente() throws Exception {
    when(ventaService.obtenerPorId(1L)).thenReturn(Optional.empty());

    Venta venta = new Venta();
    venta.setFecha(LocalDateTime.now());

    String json = objectMapper.writeValueAsString(venta);

    mockMvc.perform(put("/ventas/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isNotFound());

    verify(ventaService).obtenerPorId(1L);
    verify(ventaService, never()).guardar(any(Venta.class));
  }

  @Test
  void testEliminarVenta_Existente() throws Exception {
    Venta venta = new Venta();
    venta.setId(1L);

    when(ventaService.obtenerPorId(1L)).thenReturn(Optional.of(venta));
    doNothing().when(ventaService).eliminar(1L);

    mockMvc.perform(delete("/ventas/1"))
            .andExpect(status().isNoContent());

    verify(ventaService).obtenerPorId(1L);
    verify(ventaService).eliminar(1L);
  }

  @Test
  void testEliminarVenta_NoExistente() throws Exception {
    when(ventaService.obtenerPorId(1L)).thenReturn(Optional.empty());

    mockMvc.perform(delete("/ventas/1"))
            .andExpect(status().isNotFound());

    verify(ventaService).obtenerPorId(1L);
    verify(ventaService, never()).eliminar(anyLong());
  }

  @Test
  void testObtenerVentasPorMes_Exito() throws Exception {
    Map<String, Object> map = new HashMap<>();
    map.put("mes", 5);
    map.put("cantidad_ventas", 10);

    List<Map<String, Object>> lista = Collections.singletonList(map);

    when(ventaService.obtenerVentasPorMes(1L, 2025)).thenReturn(lista);

    mockMvc.perform(get("/ventas/por-mes/1/2025"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].mes", is(5)))
            .andExpect(jsonPath("$[0].cantidad_ventas", is(10)));

    verify(ventaService).obtenerVentasPorMes(1L, 2025);
  }

  @Test
  void testObtenerVentasPorMes_AñoInvalido() throws Exception {
    mockMvc.perform(get("/ventas/por-mes/1/0"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().string(containsString("El año debe ser un valor positivo.")));
  }

  @Test
  void testHandleException() throws Exception {
    mockMvc.perform(get("/ventas/por-mes/1/-1"))
            .andExpect(status().isInternalServerError())
            .andExpect(content().string(containsString("El año debe ser un valor positivo.")));
  }
}
