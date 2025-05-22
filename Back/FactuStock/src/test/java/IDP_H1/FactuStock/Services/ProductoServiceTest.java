package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Producto;
import IDP_H1.FactuStock.Repositories.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductoServiceTest {

  @Mock
  private ProductoRepository productoRepository;

  @Mock
  private EmailService emailService;

  @InjectMocks
  private ProductoService productoService;

  private Producto producto;
  private Organizacion organizacion;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);

    organizacion = new Organizacion();
    organizacion.setId(1L);
    organizacion.setNombre("Org Test");
    organizacion.setEmail("org@test.com");

    producto = new Producto();
    producto.setId(1L);
    producto.setNombre("Producto Test");
    producto.setCantidadStock(10);
    producto.setPrecio(100.0);
    producto.setIva(BigDecimal.valueOf(21.00));
    producto.setOrganizacion(organizacion);
  }

  @Test
  void obtenerTodos_debeRetornarLista() {
    when(productoRepository.findAll()).thenReturn(List.of(producto));

    List<Producto> result = productoService.obtenerTodos();

    assertEquals(1, result.size());
    verify(productoRepository).findAll();
  }

  @Test
  void obtenerPorId_existente() {
    when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

    Optional<Producto> result = productoService.obtenerPorId(1L);

    assertTrue(result.isPresent());
    assertEquals("Producto Test", result.get().getNombre());
  }

  @Test
  void obtenerPorId_noExistente() {
    when(productoRepository.findById(1L)).thenReturn(Optional.empty());

    Optional<Producto> result = productoService.obtenerPorId(1L);

    assertFalse(result.isPresent());
  }

  @Test
  void guardar_productoConStockNormal_noEnviaCorreo() {
    when(productoRepository.save(producto)).thenReturn(producto);

    Producto guardado = productoService.guardar(producto);

    assertEquals(producto, guardado);
    verify(productoRepository).save(producto);
    verify(emailService, never()).enviarCorreoConAdjunto(any(), any(), any(), any());
  }

  @Test
  void guardar_productoConStockBajo_enviaCorreoStockBajo() {
    producto.setCantidadStock(3);

    when(productoRepository.save(producto)).thenReturn(producto);

    Producto guardado = productoService.guardar(producto);

    verify(emailService).enviarCorreoConAdjunto(
            eq("org@test.com"),
            contains("Stock bajo"),
            contains("stock bajo (3"),
            isNull()
    );
  }

  @Test
  void guardar_productoSinStock_enviaCorreoSinStock() {
    producto.setCantidadStock(0);

    when(productoRepository.save(producto)).thenReturn(producto);

    Producto guardado = productoService.guardar(producto);

    verify(emailService).enviarCorreoConAdjunto(
            eq("org@test.com"),
            contains("Sin stock"),
            contains("se ha quedado sin stock"),
            isNull()
    );
  }

  @Test
  void eliminar_producto() {
    productoService.eliminar(1L);

    verify(productoRepository).deleteById(1L);
  }

  @Test
  void obtenerProductosPorOrganizacion() {
    when(productoRepository.findByOrganizacion(organizacion)).thenReturn(List.of(producto));

    List<Producto> productos = productoService.obtenerProductosPorOrganizacion(organizacion);

    assertEquals(1, productos.size());
    verify(productoRepository).findByOrganizacion(organizacion);
  }

  @Test
  void guardarTodos_productosValidos() {
    List<Producto> lista = Arrays.asList(producto);
    when(productoRepository.saveAll(lista)).thenReturn(lista);

    List<Producto> guardados = productoService.guardarTodos(lista);

    assertEquals(1, guardados.size());
    verify(productoRepository).saveAll(lista);
  }

  @Test
  void guardarTodos_listaVacia() {
    List<Producto> guardados = productoService.guardarTodos(Collections.emptyList());

    assertTrue(guardados.isEmpty());
    verify(productoRepository, never()).saveAll(any());
  }

  @Test
  void guardar_sinOrganizacion_noEnviaCorreo() {
    producto.setOrganizacion(null);
    when(productoRepository.save(producto)).thenReturn(producto);

    productoService.guardar(producto);

    verify(emailService, never()).enviarCorreoConAdjunto(any(), any(), any(), any());
  }
}
