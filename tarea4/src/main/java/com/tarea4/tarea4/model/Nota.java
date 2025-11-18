package com.tarea4.tarea4.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "nota")
public class Nota {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @NotNull(message = "El ID del aviso es obligatorio")
    @Column(name = "aviso_id", nullable = false)
    private Integer avisoId;
    
    @NotNull(message = "La nota es obligatoria")
    @Min(value = 1, message = "La nota debe ser al menos 1")
    @Max(value = 7, message = "La nota debe ser como máximo 7")
    @Column(name = "nota", nullable = false)
    private Integer nota;
    
    public Nota() {
    }
    
    public Nota(Integer avisoId, Integer nota) {
        this.avisoId = avisoId;
        this.nota = nota;
    }
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Integer getAvisoId() {
        return avisoId;
    }
    
    public void setAvisoId(Integer avisoId) {
        this.avisoId = avisoId;
    }
    
    public Integer getNota() {
        return nota;
    }
    
    public void setNota(Integer nota) {
        this.nota = nota;
    }
    
    @Override
    public String toString() {
        return "Nota{" +
                "id=" + id +
                ", avisoId=" + avisoId +
                ", nota=" + nota +
                '}';
    }
}