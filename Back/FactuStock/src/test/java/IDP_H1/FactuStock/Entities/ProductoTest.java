package IDP_H1.FactuStock.Entities;

import org.junit.jupiter.api.BeforeEach;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.mockito.InjectMocks;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import IDP_H1.FactuStock.Entities.Producto;
import org.junit.jupiter.api.extension.ExtendWith;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
public class ProductoTest {
  @InjectMocks private Producto producto;

  @Test
  void testPrePersist_DefaultIva() {
    // Arrange
    producto.setIva(null);
    // Act
    producto.prePersist();
    // Assert
    assertNotNull(producto.getIva());
    assertEquals(BigDecimal.valueOf(21.00), producto.getIva());
  }

  @BeforeEach
  public void setUp() {
    producto = new Producto();
  }

  @Test
  void testPrePersist_ExistingIva() {
    // Arrange
    producto.setIva(BigDecimal.valueOf(10.00));
    // Act
    producto.prePersist();
    // Assert
    assertEquals(BigDecimal.valueOf(10.00), producto.getIva());
  }

  @Test
  void testPrePersist_IvaNotNull() {
    // Arrange
    producto.setIva(BigDecimal.valueOf(15.50));
    // Act
    producto.prePersist();
    // Assert
    assertEquals(BigDecimal.valueOf(15.50), producto.getIva());
  }
}
