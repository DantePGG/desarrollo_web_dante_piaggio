package com.tarea4.tarea4.service;

import com.tarea4.tarea4.model.AvisoAdopcion;
import com.tarea4.tarea4.repository.AvisoAdopcionRepository;
import com.tarea4.tarea4.repository.NotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class AvisoService {
    
    @Autowired
    private AvisoAdopcionRepository avisoRepository;
    
    @Autowired
    private NotaRepository notaRepository;
    //por si no hay datos
    public void inicializarDatosSimulados() {
        if (avisoRepository.count() == 0) {
            List<AvisoAdopcion> avisos = Arrays.asList(
                crearAviso(1, LocalDateTime.now().minusDays(10), "Beauchef", "gato", 1, 2, "m", 1, "Santiago"),
                crearAviso(2, LocalDateTime.now().minusDays(5), "Plaza Maipú", "perro", 3, 2, "a", 2, "Maipú"),
                crearAviso(3, LocalDateTime.now().minusDays(2), "Las Condes", "gato", 2, 6, "m", 3, "Las Condes"),
                crearAviso(4, LocalDateTime.now().minusDays(1), "Providencia", "perro", 1, 1, "a", 4, "Providencia")
            );
            avisoRepository.saveAll(avisos);
        }
    }
    
    private AvisoAdopcion crearAviso(Integer id, LocalDateTime fecha, String sector, String tipo, Integer cantidad, Integer edad, String unidad, Integer comunaId, String comunaNombre) {
        AvisoAdopcion aviso = new AvisoAdopcion();
        aviso.setId(id);
        aviso.setFechaIngreso(fecha);
        aviso.setSector(sector);
        aviso.setTipo(tipo);
        aviso.setCantidad(cantidad);
        aviso.setEdad(edad);
        aviso.setUnidadMedida(unidad);
        aviso.setComunaId(comunaId);
        aviso.setComunaNombre(comunaNombre);
        return aviso;
    }
    
    public List<AvisoAdopcion> obtenerTodosLosAvisosConPromedio() {
        List<AvisoAdopcion> avisos = avisoRepository.findAll();
        
        for (AvisoAdopcion aviso : avisos) {
            Double promedio = notaRepository.calcularPromedioByAvisoId(aviso.getId());
            aviso.setPromedioNota(promedio);
            
            // Simular el nombre de la comuna (ya que no tenemos la tabla comuna)
            if (aviso.getId() == 1) aviso.setComunaNombre("Santiago");
            if (aviso.getId() == 2) aviso.setComunaNombre("Maipú");
            if (aviso.getId() == 3) aviso.setComunaNombre("Las Condes");
            if (aviso.getId() == 4) aviso.setComunaNombre("Providencia");
        }
        
        return avisos;
    }
    
    public Optional<AvisoAdopcion> obtenerAvisoPorId(Integer id) {
        return avisoRepository.findById(id);
    }
}