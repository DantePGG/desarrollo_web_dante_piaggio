package com.tarea4.tarea4.dto;

public class NotaResponse {
    
    private boolean success;
    private Double promedio;
    private Long totalNotas;
    private String mensaje;
    
    public NotaResponse() {
    }
    
    public NotaResponse(boolean success, Double promedio, Long totalNotas) {
        this.success = success;
        this.promedio = promedio;
        this.totalNotas = totalNotas;
    }
    
    public NotaResponse(boolean success, String mensaje) {
        this.success = success;
        this.mensaje = mensaje;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public Double getPromedio() {
        return promedio;
    }
    
    public void setPromedio(Double promedio) {
        this.promedio = promedio;
    }
    
    public Long getTotalNotas() {
        return totalNotas;
    }
    
    public void setTotalNotas(Long totalNotas) {
        this.totalNotas = totalNotas;
    }
    
    public String getMensaje() {
        return mensaje;
    }
    
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    
    @Override
    public String toString() {
        return "NotaResponse{" +
                "success=" + success +
                ", promedio=" + promedio +
                ", totalNotas=" + totalNotas +
                ", mensaje='" + mensaje + '\'' +
                '}';
    }
}