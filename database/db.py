from sqlalchemy import (
    create_engine, Column, Integer, DateTime, String,
    ForeignKey, Enum, Text
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime
import pymysql # Si se necesita el driver de MySQL

# Configuracion de la base de datos
DB_NAME = "tarea2"
DB_USERNAME = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306

DATABASE_URL = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Inicializa el motor de la base de datos
engine = create_engine(DATABASE_URL)
# Configura el constructor de sesiones
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base de la que heredaran todos los modelos
Base = declarative_base()

# Modelos:

class Region(Base):
    __tablename__ = "region"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(200), nullable=False)
    comunas = relationship("Comuna", back_populates="region")


class Comuna(Base):
    __tablename__ = "comuna"
    id = Column(Integer, primary_key=True)
    nombre = Column(String(200), nullable=False)
    region_id = Column(Integer, ForeignKey("region.id"), nullable=False)
    region = relationship("Region", back_populates="comunas")
    avisos = relationship("AvisoAdopcion", back_populates="comuna")


class AvisoAdopcion(Base):
    __tablename__ = "aviso_adopcion"
    id = Column(Integer, primary_key=True)
    fecha_ingreso = Column(DateTime, nullable=False, default=datetime.now)
    comuna_id = Column(Integer, ForeignKey("comuna.id"), nullable=False)
    sector = Column(String(100))
    nombre = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False)
    celular = Column(String(15))
    tipo = Column(Enum("gato", "perro"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    edad = Column(Integer, nullable=False)
    unidad_medida = Column(Enum("a", "m"), nullable=False)  # a = años, m = meses
    fecha_entrega = Column(DateTime, nullable=False)
    descripcion = Column(Text)

    comuna = relationship("Comuna", back_populates="avisos")
    fotos = relationship("Foto", back_populates="aviso", cascade="all, delete-orphan")
    contactos = relationship("ContactarPor", back_populates="aviso", cascade="all, delete-orphan")
    
    @property
    def edad_txt(self):
        if self.unidad_medida == "a":
            return f"{self.edad} años"
        elif self.unidad_medida == "m":
            return f"{self.edad} meses"
        return str(self.edad)

class Foto(Base):
    __tablename__ = "foto"
    id = Column(Integer, primary_key=True)
    ruta_archivo = Column(String(300), nullable=False)
    nombre_archivo = Column(String(300), nullable=False)
    actividad_id = Column(Integer, ForeignKey("aviso_adopcion.id"), nullable=False)
    aviso = relationship("AvisoAdopcion", back_populates="fotos")


class ContactarPor(Base):
    __tablename__ = "contactar_por"
    id = Column(Integer, primary_key=True)
    nombre = Column(Enum("whatsapp", "telegram", "X", "instagram", "tiktok", "otra"), nullable=False)
    identificador = Column(String(150), nullable=False)
    actividad_id = Column(Integer, ForeignKey("aviso_adopcion.id"), nullable=False)
    aviso = relationship("AvisoAdopcion", back_populates="contactos")