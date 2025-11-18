package com.tarea4.tarea4.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class NotaRequest {
    
    @NotNull(message = "El valor de la nota es obligatorio")
    @Min(value = 1, message = "La nota debe ser al menos 1")
    @Max(value = 7, message = "La nota debe ser como máximo 7")
    private Integer valor;
    
    public NotaRequest() {
    }
    
    public NotaRequest(Integer valor) {
        this.valor = valor;
    }
    
    public Integer getValor() {
        return valor;
    }
    
    public void setValor(Integer valor) {
        this.valor = valor;
    }
    
    @Override
    public String toString() {
        return "NotaRequest{" +
                "valor=" + valor +
                '}';
    }
}