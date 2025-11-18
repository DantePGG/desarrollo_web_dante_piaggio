package com.tarea4.tarea4.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "aviso_adopcion")
public class AvisoAdopcion {
    
    @Id
    @Column(name = "id")
    private Integer id;
    
    @Column(name = "fecha_ingreso")
    private LocalDateTime fechaIngreso;
    
    @Column(name = "sector")
    private String sector;
    
    @Column(name = "tipo")
    private String tipo;
    
    @Column(name = "cantidad")
    private Integer cantidad;
    
    @Column(name = "edad")
    private Integer edad;
    
    @Column(name = "unidad_medida")
    private String unidadMedida;
    
    @Column(name = "comuna_id")
    private Integer comunaId;
    
    @OneToMany(mappedBy = "avisoId", fetch = FetchType.LAZY)
    private List<Nota> notas;
    
    @Transient
    private Double promedioNota;
    
    @Transient
    private String comunaNombre;
    
    public AvisoAdopcion() {
    }
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public LocalDateTime getFechaIngreso() {
        return fechaIngreso;
    }
    
    public void setFechaIngreso(LocalDateTime fechaIngreso) {
        this.fechaIngreso = fechaIngreso;
    }
    
    public String getSector() {
        return sector;
    }
    
    public void setSector(String sector) {
        this.sector = sector;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public Integer getCantidad() {
        return cantidad;
    }
    
    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }
    
    public Integer getEdad() {
        return edad;
    }
    
    public void setEdad(Integer edad) {
        this.edad = edad;
    }
    
    public String getUnidadMedida() {
        return unidadMedida;
    }
    
    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }
    
    public Integer getComunaId() {
        return comunaId;
    }
    
    public void setComunaId(Integer comunaId) {
        this.comunaId = comunaId;
    }
    
    public List<Nota> getNotas() {
        return notas;
    }
    
    public void setNotas(List<Nota> notas) {
        this.notas = notas;
    }
    
    public Double getPromedioNota() {
        return promedioNota;
    }
    
    public void setPromedioNota(Double promedioNota) {
        this.promedioNota = promedioNota;
    }
    
    public String getComunaNombre() {
        return comunaNombre;
    }
    
    public void setComunaNombre(String comunaNombre) {
        this.comunaNombre = comunaNombre;
    }
    
    public String getCantidadTipoEdad() {
        String unidad = this.unidadMedida.equals("a") ? "años" : "meses";
        return String.format("%d %s %d %s", this.cantidad, this.tipo, this.edad, unidad);
    }
}