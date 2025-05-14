package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Entities.Producto;
import IDP_H1.FactuStock.Repositories.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {
    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private EmailService emailService;

    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> obtenerPorId(Long id) {
        return productoRepository.findById(id);
    }

    public Producto guardar(Producto producto) {
        Producto productoGuardado = productoRepository.save(producto);
        verificarStockYEnviarCorreo(productoGuardado);
        return productoGuardado;
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    public List<Producto> obtenerProductosPorOrganizacion(Organizacion organizacion) {
        return productoRepository.findByOrganizacion(organizacion);
    }

    private void verificarStockYEnviarCorreo(Producto producto) {
        if (producto.getCantidadStock() <= 5 && producto.getCantidadStock() > 0) {
            enviarCorreoStockBajo(producto);
        } else if (producto.getCantidadStock() == 0) {
            enviarCorreoSinStock(producto);
        }
    }

    private void enviarCorreoStockBajo(Producto producto) {
        String to = producto.getOrganizacion().getEmail();
        String subject = "Stock bajo para " + producto.getNombre();
        String mensaje = "El producto tiene un stock bajo (" + producto.getCantidadStock() + " unidades).";
        String body = generarCuerpoCorreo("Stock Bajo", producto, mensaje);
        emailService.enviarCorreoConAdjunto(to, subject, body, null);
    }

    private void enviarCorreoSinStock(Producto producto) {
        String to = producto.getOrganizacion().getEmail();
        String subject = "Sin stock para " + producto.getNombre();
        String body = generarCuerpoCorreo("Sin Stock", producto, "El producto se ha quedado sin stock.");
        emailService.enviarCorreoConAdjunto(to, subject, body, null);
    }
    public List<Producto> guardarTodos(List<Producto> productos) {
        return productoRepository.saveAll(productos);
    }


    private String generarCuerpoCorreo(String tipoAlerta, Producto producto, String mensaje) {
        Organizacion organizacion = producto.getOrganizacion();
        return "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; color: #333; }" +
                ".container { max-width: 600px; margin: 30px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }" +
                ".header { background-color: #2E6DA4; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }" +
                ".header h2 { margin: 0; font-size: 24px; }" +
                ".footer { font-size: 12px; color: #888; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e1e1; }" +
                ".content { padding: 20px; }" +
                ".content h3 { color: #2E6DA4; font-size: 18px; }" +
                ".content ul { padding-left: 20px; }" +
                ".content li { margin-bottom: 10px; }" +
                ".button { display: inline-block; padding: 10px 20px; background-color: #2E6DA4; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h2>Alerta de Stock - " + tipoAlerta + "</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Estimado/a equipo de " + organizacion.getNombre() + ",</p>" +
                "<p>" + mensaje + "</p>" +
                "<h3>Detalles del producto:</h3>" +
                "<ul>" +
                "    <li><strong>Nombre del producto:</strong> " + producto.getNombre() + "</li>" +
                "    <li><strong>Cantidad en stock:</strong> " + producto.getCantidadStock() + "</li>" +
                "    <li><strong>Precio:</strong> $" + producto.getPrecio() + "</li>" +
                "</ul>" +
                "<p>Por favor, tome las medidas necesarias para reabastecer el inventario.</p>" +
                "<p>Atentamente,</p>" +
                "<p><strong>Sistema de Gestión de Inventario</strong></p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Este es un mensaje automático, por favor no responda a este correo.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
