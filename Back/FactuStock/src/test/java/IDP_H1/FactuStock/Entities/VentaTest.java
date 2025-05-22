package IDP_H1.FactuStock.Entities;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VentaTest {
  @InjectMocks
  private Venta venta;

  @Mock
  private Detalle detalle;

  @BeforeEach
  public void setUp() {
    venta = new Venta();
  }

  @Test
  void testRemoveDetalle_WhenDetalleExists() {
    // Arrange
    venta.getDetalles().add(detalle);
    // Act
    venta.removeDetalle(detalle);
    // Assert
    assertEquals(0, venta.getDetalles().size());
    verify(detalle, times(1)).setVenta(null);
  }

  @Test
  void testRemoveDetalle_WhenRemovingNullDetalle() {
    // Act
    venta.removeDetalle(null);
    // Assert
    assertEquals(0, venta.getDetalles().size()); // No debe lanzar excepción
  }

  @Test
  void testRemoveDetalle_WhenDetalleDoesNotExist() {
    // Arrange
    Detalle nonExistentDetalle = new Detalle();
    venta.getDetalles().add(detalle);
    // Act
    venta.removeDetalle(nonExistentDetalle);
    // Assert
    assertEquals(1, venta.getDetalles().size());
    verify(detalle, never()).setVenta(null);
  }
}
