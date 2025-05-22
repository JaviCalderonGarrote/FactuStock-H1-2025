package IDP_H1.FactuStock.Entities;

import java.util.ArrayList;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.InjectMocks;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.Mock;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.junit.jupiter.api.extension.ExtendWith;
import java.util.List;

@ExtendWith(MockitoExtension.class)
public class FacturaTest {
  @InjectMocks private Factura factura;
  @Mock private Detalle detalle;

  @Test
  void testActualizarTotal_EmptyDetalles() {
    // Act
    factura.actualizarTotal();
    // Assert
    assertEquals(0.0, factura.getTotal());
  }

  @Test
  void testActualizarTotal_NegativeSubtotal() {
    // Arrange
    Detalle detalle = new Detalle();
    detalle.setSubtotal(-50.0);
    factura.getDetalles().add(detalle);
    // Act
    factura.actualizarTotal();
    // Assert
    assertEquals(-50.0, factura.getTotal());
  }

  @Test
  void testActualizarTotal_MultipleDetalles() {
    // Arrange
    Detalle detalle1 = new Detalle();
    detalle1.setSubtotal(150.0);
    Detalle detalle2 = new Detalle();
    detalle2.setSubtotal(200.0);
    factura.getDetalles().add(detalle1);
    factura.getDetalles().add(detalle2);
    // Act
    factura.actualizarTotal();
    // Assert
    assertEquals(350.0, factura.getTotal());
  }

  @BeforeEach
  public void setUp() {
    factura = new Factura();
    List<Detalle> detalles = new ArrayList<>();
    factura.setDetalles(detalles);
  }

  @Test
  void testActualizarTotal_SingleDetalle() {
    // Arrange
    Detalle detalle = new Detalle();
    detalle.setSubtotal(100.0);
    factura.getDetalles().add(detalle);
    // Act
    factura.actualizarTotal();
    // Assert
    assertEquals(100.0, factura.getTotal());
  }
}
