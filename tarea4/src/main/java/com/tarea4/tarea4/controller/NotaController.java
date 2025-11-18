package com.tarea4.tarea4.controller;

import com.tarea4.tarea4.dto.NotaRequest;
import com.tarea4.tarea4.dto.NotaResponse;
import com.tarea4.tarea4.model.Nota;
import com.tarea4.tarea4.repository.NotaRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import com.tarea4.tarea4.service.AvisoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/avisos")
public class NotaController {
    
    private static final Logger logger = LoggerFactory.getLogger(NotaController.class);
    
    @Autowired
    private NotaRepository notaRepository;
    
    @Autowired
    private AvisoService avisoService;
    
    @PostMapping("/{avisoId}/notas")
    public ResponseEntity<?> agregarNota(
            @PathVariable Integer avisoId,
            @Valid @RequestBody NotaRequest request,
            BindingResult bindingResult) {
        
        logger.info("Recibida solicitud para agregar nota al aviso {}: {}", avisoId, request);
        
        if (bindingResult.hasErrors()) {
            String errores = bindingResult.getAllErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            
            logger.warn("Errores de validación: {}", errores);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", errores);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            if (avisoService.obtenerAvisoPorId(avisoId).isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Aviso no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            Nota nota = new Nota(avisoId, request.getValor());
            notaRepository.save(nota);
            
            logger.info("Nota guardada exitosamente: {}", nota);
            
            Double promedio = notaRepository.calcularPromedioByAvisoId(avisoId);
            Long totalNotas = notaRepository.countByAvisoId(avisoId);
            
            NotaResponse response = new NotaResponse(true, promedio, totalNotas);
            
            logger.info("Promedio actualizado para aviso {}: {} ({} notas)", 
                        avisoId, promedio, totalNotas);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Error al guardar nota: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error interno del servidor al guardar la nota");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/{avisoId}/notas")
    public ResponseEntity<?> obtenerNotas(@PathVariable Integer avisoId) {
        
        logger.info("Recibida solicitud para obtener notas del aviso {}", avisoId);
        
        try {
            List<Nota> notas = notaRepository.findByAvisoId(avisoId);
            Double promedio = notaRepository.calcularPromedioByAvisoId(avisoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("notas", notas);
            response.put("promedio", promedio);
            response.put("total", notas.size());
            
            logger.info("Retornando {} notas para aviso {}, promedio: {}", 
                        notas.size(), avisoId, promedio);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error al obtener notas: ", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor al obtener las notas");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "API de notas funcionando correctamente");
        return ResponseEntity.ok(response);
    }
}