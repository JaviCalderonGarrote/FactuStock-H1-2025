package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.CategoriaProducto;
import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Producto;
import IDP_H1.FactuStock.Services.CategoriaProductoService;
import IDP_H1.FactuStock.Services.ProductoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProductoControllerTest {

  private MockMvc mockMvc;

  @Mock
  private ProductoService productoService;

  @Mock
  private CategoriaProductoService categoriaProductoService;

  @InjectMocks
  private ProductoController productoController;

  private ObjectMapper objectMapper;

  private Producto producto;
  private Organizacion organizacion;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(productoController).build();
    objectMapper = new ObjectMapper();

    organizacion = new Organizacion();
    organizacion.setId(1L);
    organizacion.setNombre("Mi Org");
    organizacion.setEmail("org@test.com");

    producto = new Producto();
    producto.setId(1L);
    producto.setNombre("Producto Test");
    producto.setPrecio(10.0);
    producto.setCantidadStock(10);
    producto.setIva(BigDecimal.valueOf(21.0));
    producto.setOrganizacion(organizacion);
  }

  @Test
  void obtenerProductosPorOrganizacion_conResultados() throws Exception {
    when(productoService.obtenerProductosPorOrganizacion(any())).thenReturn(List.of(producto));

    mockMvc.perform(get("/productos/organizacion/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Producto Test"));
  }

  @Test
  void obtenerProductosPorOrganizacion_sinResultados() throws Exception {
    when(productoService.obtenerProductosPorOrganizacion(any())).thenReturn(List.of());

    mockMvc.perform(get("/productos/organizacion/1"))
            .andExpect(status().isNoContent());
  }

  @Test
  void obtenerCategorias() throws Exception {
    CategoriaProducto categoria = new CategoriaProducto();
    categoria.setId(1L);
    categoria.setNombre("Bebidas");

    when(categoriaProductoService.obtenerTodas()).thenReturn(List.of(categoria));

    mockMvc.perform(get("/productos/categorias"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Bebidas"));
  }

  @Test
  void obtenerTodos() throws Exception {
    when(productoService.obtenerTodos()).thenReturn(List.of(producto));

    mockMvc.perform(get("/productos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Producto Test"));
  }

  @Test
  void guardar_productoValido() throws Exception {
    when(productoService.guardar(any())).thenReturn(producto);

    mockMvc.perform(post("/productos")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(producto)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.nombre").value("Producto Test"));
  }

  @Test
  void guardar_productoSinNombre() throws Exception {
    producto.setNombre("");

    mockMvc.perform(post("/productos")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(producto)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El nombre del producto no puede estar vacío"));
  }

  @Test
  void obtenerPorId_existente() throws Exception {
    when(productoService.obtenerPorId(1L)).thenReturn(Optional.of(producto));

    mockMvc.perform(get("/productos/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Producto Test"));
  }

  @Test
  void obtenerPorId_noExistente() throws Exception {
    when(productoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    mockMvc.perform(get("/productos/1"))
            .andExpect(status().isNotFound());
  }

  @Test
  void eliminar_existente() throws Exception {
    when(productoService.obtenerPorId(1L)).thenReturn(Optional.of(producto));

    mockMvc.perform(delete("/productos/1"))
            .andExpect(status().isNoContent());
  }

  @Test
  void eliminar_noExistente() throws Exception {
    when(productoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    mockMvc.perform(delete("/productos/1"))
            .andExpect(status().isNotFound());
  }

  @Test
  void actualizarProducto_existenteYValido() throws Exception {
    when(productoService.obtenerPorId(1L)).thenReturn(Optional.of(producto));
    when(productoService.guardar(any())).thenReturn(producto);

    mockMvc.perform(put("/productos/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(producto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Producto Test"));
  }

  @Test
  void actualizarProducto_existentePeroSinNombre() throws Exception {
    producto.setNombre("");
    when(productoService.obtenerPorId(1L)).thenReturn(Optional.of(producto));

    mockMvc.perform(put("/productos/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(producto)))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("El nombre del producto no puede estar vacío"));
  }

  @Test
  void actualizarProducto_noExistente() throws Exception {
    when(productoService.obtenerPorId(1L)).thenReturn(Optional.empty());

    mockMvc.perform(put("/productos/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(producto)))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Producto no encontrado"));
  }

  @Test
  void guardarLote_conProductos() throws Exception {
    when(productoService.guardarTodos(any())).thenReturn(List.of(producto));

    mockMvc.perform(post("/productos/lote")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(List.of(producto))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$[0].nombre").value("Producto Test"));
  }
}
