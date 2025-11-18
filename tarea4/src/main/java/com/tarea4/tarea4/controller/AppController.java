package com.tarea4.tarea4.controller;

import com.tarea4.tarea4.model.AvisoAdopcion;
import com.tarea4.tarea4.service.AvisoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class AppController {
    
    @Autowired
    private AvisoService avisoService;
    
    @GetMapping("/")
    public String listadoAvisos(Model model) {
        List<AvisoAdopcion> avisos = avisoService.obtenerTodosLosAvisosConPromedio();
        model.addAttribute("avisos", avisos);
        return "index";
    }
}