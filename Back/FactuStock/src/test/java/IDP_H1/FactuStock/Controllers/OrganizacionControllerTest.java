package IDP_H1.FactuStock.Controllers;

import IDP_H1.FactuStock.Entities.Organizacion;
import IDP_H1.FactuStock.Repositories.OrganizacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class OrganizacionControllerTest {

  @InjectMocks
  private OrganizacionController organizacionController;

  @Mock
  private OrganizacionRepository organizacionRepository;

  private MockMvc mockMvc;
  private Organizacion organizacion;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(organizacionController).build();

    organizacion = new Organizacion();
    organizacion.setId(1L);
    organizacion.setNombre("Org Test");
    organizacion.setDireccion("Calle Falsa 123");
    organizacion.setTelefono("123456789");
    organizacion.setNifCif("NIF123456");
    organizacion.setEmail("test@org.com");
    organizacion.setWeb("https://org.com");
    organizacion.setLogo("Logo-1.png");
  }

  @Test
  void actualizarOrganizacion_Existente_OK() throws Exception {
    when(organizacionRepository.findById(1L)).thenReturn(Optional.of(organizacion));
    when(organizacionRepository.save(any(Organizacion.class))).thenReturn(organizacion);

    String json = """
            {
                "nombre": "Org Modificada",
                "direccion": "Nueva Direccion",
                "telefono": "987654321",
                "nifCif": "NIF123456",
                "email": "modificado@org.com",
                "web": "https://modificado.org"
            }
            """;

    mockMvc.perform(put("/organizaciones/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("Org Modificada"))
            .andExpect(jsonPath("$.direccion").value("Nueva Direccion"));

    verify(organizacionRepository).findById(1L);
    verify(organizacionRepository).save(any(Organizacion.class));
  }

  @Test
  void actualizarOrganizacion_NoExiste_NotFound() throws Exception {
    when(organizacionRepository.findById(1L)).thenReturn(Optional.empty());

    String json = """
            {
                "nombre": "Org Modificada",
                "direccion": "Nueva Direccion",
                "telefono": "987654321",
                "nifCif": "NIF123456",
                "email": "modificado@org.com",
                "web": "https://modificado.org"
            }
            """;

    mockMvc.perform(put("/organizaciones/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json))
            .andExpect(status().isNotFound());

    verify(organizacionRepository).findById(1L);
    verify(organizacionRepository, never()).save(any());
  }

  @Test
  void uploadLogo_ArchivoVacio_BadRequest() throws Exception {
    MockMultipartFile emptyFile = new MockMultipartFile("file", new byte[0]);

    mockMvc.perform(multipart("/organizaciones/upload-logo/1")
                    .file(emptyFile))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("No se seleccionó ningún archivo."));
  }

  @Test
  void uploadLogo_OrganizacionNoEncontrada_NotFound() throws Exception {
    MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "data".getBytes());
    when(organizacionRepository.findById(1L)).thenReturn(Optional.empty());

    mockMvc.perform(multipart("/organizaciones/upload-logo/1")
                    .file(file))
            .andExpect(status().isNotFound())
            .andExpect(content().string("Organización no encontrada."));
  }

  @Test
  void uploadLogo_ExtensionInvalida_BadRequest() throws Exception {
    MockMultipartFile file = new MockMultipartFile("file", "logo.gif", "image/gif", "data".getBytes());
    when(organizacionRepository.findById(1L)).thenReturn(Optional.of(organizacion));

    mockMvc.perform(multipart("/organizaciones/upload-logo/1")
                    .file(file))
            .andExpect(status().isBadRequest())
            .andExpect(content().string("Solo se permiten archivos PNG o JPG."));
  }

  @Test
  void uploadLogo_Exito_OK() throws Exception {
    MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", "imagecontent".getBytes());
    when(organizacionRepository.findById(1L)).thenReturn(Optional.of(organizacion));
    when(organizacionRepository.save(any())).thenReturn(organizacion);

    mockMvc.perform(multipart("/organizaciones/upload-logo/1")
                    .file(file))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Logo subido correctamente: Logo-1.png")));

    verify(organizacionRepository).save(any());
  }

  @Test
  void getLogo_ArchivoExiste_OK() throws Exception {
    String testFileName = "test-logo.png";
    byte[] content = "contenido".getBytes();

    Path dirPath = Paths.get("src/main/resources/static/img-logo/");
    Files.createDirectories(dirPath);
    Path filePath = dirPath.resolve(testFileName);
    Files.write(filePath, content);

    mockMvc.perform(get("/organizaciones/logo/" + testFileName))
            .andExpect(status().isOk())
            .andExpect(content().bytes(content));

    Files.deleteIfExists(filePath);
  }

  @Test
  void getLogo_ArchivoNoExiste_NotFound() throws Exception {
    mockMvc.perform(get("/organizaciones/logo/no-existe.png"))
            .andExpect(status().isNotFound());
  }
}
