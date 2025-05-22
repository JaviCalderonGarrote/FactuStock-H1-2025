package IDP_H1.FactuStock.Services;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrganizacionServiceTest {

  @InjectMocks
  private OrganizacionService organizacionService;

  @Mock
  private OrganizacionRepository organizacionRepository;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  void crearOrganizacion_Success() {
    Organizacion org = new Organizacion();
    org.setNombre("Org 1");
    when(organizacionRepository.save(org)).thenReturn(org);

    Organizacion resultado = organizacionService.crearOrganizacion(org);
    assertNotNull(resultado);
    assertEquals("Org 1", resultado.getNombre());
    verify(organizacionRepository).save(org);
  }

  @Test
  void actualizarOrganizacion_Existente_Success() {
    Organizacion orgExistente = new Organizacion();
    orgExistente.setId(1L);
    orgExistente.setNombre("Org Old");

    Organizacion orgActualizada = new Organizacion();
    orgActualizada.setNombre("Org Nueva");
    orgActualizada.setDireccion("Direccion nueva");
    orgActualizada.setTelefono("12345");
    orgActualizada.setNifCif("NIF1");
    orgActualizada.setEmail("email@new.com");
    orgActualizada.setWeb("webnew.com");

    when(organizacionRepository.findById(1L)).thenReturn(Optional.of(orgExistente));
    when(organizacionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Optional<Organizacion> resultado = organizacionService.actualizarOrganizacion(1L, orgActualizada);

    assertTrue(resultado.isPresent());
    assertEquals("Org Nueva", resultado.get().getNombre());
    assertEquals("Direccion nueva", resultado.get().getDireccion());
    verify(organizacionRepository).findById(1L);
    verify(organizacionRepository).save(orgExistente);
  }

  @Test
  void actualizarOrganizacion_NoExiste_Empty() {
    Organizacion orgActualizada = new Organizacion();
    when(organizacionRepository.findById(1L)).thenReturn(Optional.empty());

    Optional<Organizacion> resultado = organizacionService.actualizarOrganizacion(1L, orgActualizada);

    assertTrue(resultado.isEmpty());
    verify(organizacionRepository).findById(1L);
    verify(organizacionRepository, never()).save(any());
  }

  @Test
  void uploadLogo_OrganizacionNoEncontrada_IOException() {
    MultipartFile mockFile = mock(MultipartFile.class);
    when(organizacionRepository.findById(1L)).thenReturn(Optional.empty());

    IOException exception = assertThrows(IOException.class, () -> {
      organizacionService.uploadLogo(1L, mockFile);
    });
    assertEquals("Organización no encontrada.", exception.getMessage());
    verify(organizacionRepository).findById(1L);
  }

  @Test
  void uploadLogo_ExtensionInvalida_IOException() throws IOException {
    MultipartFile mockFile = mock(MultipartFile.class);
    when(organizacionRepository.findById(1L)).thenReturn(Optional.of(new Organizacion()));

    when(mockFile.getOriginalFilename()).thenReturn("archivo.gif");

    IOException exception = assertThrows(IOException.class, () -> {
      organizacionService.uploadLogo(1L, mockFile);
    });
    assertEquals("Solo se permiten archivos PNG o JPG.", exception.getMessage());
    verify(organizacionRepository).findById(anyLong());
  }

  @Test
  void uploadLogo_Exito_CambiaNombreLogo() throws IOException {
    Organizacion org = new Organizacion();
    org.setId(1L);
    org.setLogo("Logo-1.png");

    MultipartFile mockFile = mock(MultipartFile.class);
    when(mockFile.getOriginalFilename()).thenReturn("nuevo.png");
    when(mockFile.getBytes()).thenReturn("contenido".getBytes());

    when(organizacionRepository.findById(1L)).thenReturn(Optional.of(org));
    when(organizacionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    // Preparar carpeta para pruebas (si no existe)
    Path logoDir = Paths.get("src/main/resources/static/img-logo/");
    Files.createDirectories(logoDir);

    // Ejecutar método
    String filename = organizacionService.uploadLogo(1L, mockFile);

    assertEquals("Logo-1.png", filename);
    assertEquals("Logo-1.png", org.getLogo());
    verify(organizacionRepository).save(org);

    // Limpieza archivo generado
    Path archivoGuardado = logoDir.resolve(filename);
    Files.deleteIfExists(archivoGuardado);
  }

  @Test
  void getLogo_ArchivoValido_DevuelveBytes() throws IOException {
    // Crear archivo temporal
    Path logoDir = Paths.get("src/main/resources/static/img-logo/");
    Files.createDirectories(logoDir);

    String filename = "test-logo.png";
    byte[] contenido = "contenidoPrueba".getBytes();
    Path filePath = logoDir.resolve(filename);
    Files.write(filePath, contenido);

    byte[] resultado = organizacionService.getLogo(filename);

    assertArrayEquals(contenido, resultado);

    Files.deleteIfExists(filePath);
  }

  @Test
  void getLogo_ArchivoNoExiste_IOException() {
    IOException exception = assertThrows(IOException.class, () -> {
      organizacionService.getLogo("no-existe.png");
    });

    assertTrue(exception.getMessage().contains("Archivo no encontrado"));
  }

  @Test
  void getLogo_RutaInvalida_IOException() {
    IOException exception = assertThrows(IOException.class, () -> {
      organizacionService.getLogo("../secreto.txt");
    });

    assertEquals("Ruta inválida para el logo.", exception.getMessage());
  }
}
