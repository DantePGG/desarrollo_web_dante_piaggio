from datetime import datetime
from flask import Flask, request, render_template, url_for, redirect, jsonify
from sqlalchemy.orm import joinedload
from werkzeug.utils import secure_filename
import os
import re

# Tenia unos problemas con la importacion de database.db y dependencias/import circulares,
try:
    import database.db as db 
except ImportError as e:
    print(f"Error al importar de database.db: {e}")
    print("Revisar que 'database/db.py' exista y tenga los modelos")
    exit(1)


app = Flask(__name__)

# Configuracion para subidas
UPLOAD_FOLDER = os.path.join("static", "uploads").replace("\\", "/")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
# Creamos el directorio para uploads/aseguramos que exista
os.makedirs(UPLOAD_FOLDER, exist_ok=True) 

def allowed_file(filename):
    # Verifica si la extension del archivo esta permitida
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
# Creamos las tablas en la base de datos si no existen
db.Base.metadata.create_all(bind=db.engine)

# Rutas
@app.route("/")
def index():
    # Ruta de la Portada: Muestra los ultimos 5 avisos
    session = db.SessionLocal()
    try:
        avisos = (
            session.query(db.AvisoAdopcion)
            .options(
                joinedload(db.AvisoAdopcion.comuna),
                joinedload(db.AvisoAdopcion.fotos)
            )
            .order_by(db.AvisoAdopcion.fecha_ingreso.desc())
            .limit(5)
            .all()
        )
    finally:
        session.close()

    return render_template("index.html", avisos=avisos)


@app.route("/detalle/<int:aviso_id>")
def detalle(aviso_id):
    # Ruta de Detalle: Muestra la informacion completa de un aviso
    session = db.SessionLocal()
    try:
        aviso = (
            session.query(db.AvisoAdopcion)
            .options(
                joinedload(db.AvisoAdopcion.comuna).joinedload(db.Comuna.region),
                joinedload(db.AvisoAdopcion.fotos),
                joinedload(db.AvisoAdopcion.contactos)
            )
            .filter_by(id=aviso_id)
            .first()
        )
    finally:
        session.close()

    if not aviso:
        return "Aviso no encontrado", 404

    return render_template("detalle.html", aviso=aviso)

@app.route("/listado")
def listado():
    #Ruta de Listado: Muestra todos los avisos con paginacion
    session = db.SessionLocal()
    # Paginacion
    page = int(request.args.get("page", 1))
    per_page = 5 

    try:
        avisos = (
            session.query(db.AvisoAdopcion)
            .options(
                joinedload(db.AvisoAdopcion.comuna),
                joinedload(db.AvisoAdopcion.fotos)
            )
            .order_by(db.AvisoAdopcion.fecha_ingreso.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        total = session.query(db.AvisoAdopcion).count()
    finally:
        session.close()

    return render_template("listado.html", avisos=avisos, page=page, total=total, per_page=per_page)

@app.route("/agregar", methods=["GET", "POST"])
def crear_aviso():
    #Ruta de Agregar: Maneja la logica de validacion, insercion en DB y subida de archivos
    session = db.SessionLocal()
    
    # Pre-cargar regiones si la API está disponible (o dejar que el JS las cargue)
    # Aquí solo necesitamos las regiones si el JS no las carga, pero la plantilla las requiere para el select.
    # En este caso, el JS carga la lista, pero para manejar los errores de Flask, las pasamos.
    try:
        regiones = session.query(db.Region).all()
    except Exception as e:
        print("Error al cargar regiones de la DB:", e)
        regiones = [] # Devolver lista vacia si falla la DB

    if request.method == "POST":
        errores = []
        # Obtener y limpiar datos del formulario
        nombre = request.form.get("nombre", "").strip()
        comuna_id_str = request.form.get("select-comuna") # Viene como string del formulario
        
        # --------- Validaciones del lado del servidor --------- 
        if not (3 <= len(nombre) <= 200):
            errores.append("El nombre debe tener entre 3 y 200 caracteres.")
            
        # Validacion de Comuna
        if not comuna_id_str or not comuna_id_str.isdigit():
             errores.append("Debe seleccionar una comuna válida.")
             comuna_id = None
        else:
            comuna_id = int(comuna_id_str)
            # Verificar si el ID existe en la base de datos
            if not session.query(db.Comuna).filter_by(id=comuna_id).first():
                 errores.append("La comuna seleccionada no existe.")
                 comuna_id = None
            
        # Validacion de Archivos (debe haber al menos 1 foto válida)
        fotos_subidas = request.files.getlist("foto[]")
        # Filtra archivos que existen y tienen extensión permitida
        fotos_validas = [f for f in fotos_subidas if f.filename and allowed_file(f.filename)]
        if not fotos_validas:
            errores.append("Debe subir al menos una foto (PNG, JPG, JPEG, GIF).")

        # Validacion de campos numericos y fecha
        try:
            cantidad = int(request.form["cantidad"])
            if cantidad < 1: errores.append("La cantidad debe ser 1 o más.")
        except (ValueError, KeyError): errores.append("La cantidad es inválida.")
        
        try:
            edad = int(request.form["edad"])
            if edad < 1: errores.append("La edad es inválida.")
        except (ValueError, KeyError): errores.append("La edad es inválida.")

        try:
            fecha_entrega_str = request.form["fechaEntrega"]
            fecha_entrega = datetime.fromisoformat(fecha_entrega_str)
            if fecha_entrega < datetime.now(): errores.append("La fecha de entrega debe ser futura.")
        except (ValueError, KeyError): errores.append("La fecha de entrega es inválida o no fue proporcionada.")
        
        # Validacion de email
        email = request.form.get("email")
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
             errores.append("El formato del email es inválido.")

        # Validacion de redes sociales
        i = 0
        while True:
            red_nombre = request.form.get(f"redes-{i}")
            red_identificador = request.form.get(f"idRed-{i}")
            
            # Condicion de salida: si no existe el nombre de la red y tampoco el identificador
            if red_nombre is None and red_identificador is None:
                break
            
            # Si se selecciono una red pero falta el identificador
            if red_nombre and red_nombre != "" and not red_identificador:
                 errores.append(f"Debe ingresar el identificador para la red social '{red_nombre}'.")

            i += 1


        # Si hay errores de validacion, se recarga la pagina
        if errores:
            session.close()
            return render_template("agregar.html", errores=errores, datos_form=request.form, regiones=regiones)

        # --------- Parte de insertar en la base de datos --------- 
        try:
            # Insertar AvisoAdopcion (Tabla principal)
            aviso = db.AvisoAdopcion(
                fecha_ingreso=datetime.now(),
                comuna_id=comuna_id,
                sector=request.form.get("sector"),
                nombre=nombre,
                email=email,
                celular=request.form.get("telefono"),
                tipo=request.form["tipo"],
                cantidad=cantidad,
                edad=edad,
                unidad_medida=request.form["unidadEdad"],
                fecha_entrega=fecha_entrega,
                descripcion=request.form.get("descripcion"),
            )
            session.add(aviso)
            # Commit para obtener el ID del aviso (aviso.id)
            session.flush() 
            aviso_id = aviso.id

            # Insertar ContactarPor (Redes Sociales)
            i = 0
            while True:
                red_nombre = request.form.get(f"redes-{i}")
                red_identificador = request.form.get(f"idRed-{i}")
                
                # Usar la misma condición de salida
                if red_nombre is None and red_identificador is None:
                    break

                # Solo insertar si se selecciono una red y se proporciono un identificador
                if red_nombre and red_nombre != "" and red_identificador:
                    contacto = db.ContactarPor(
                        nombre=red_nombre,
                        identificador=red_identificador,
                        actividad_id=aviso_id
                    )
                    session.add(contacto)
                
                i += 1
            
            
            # Almacenar Archivos e Insertar Fotos
            for foto_file in fotos_validas:
                # Generar nombre de archivo seguro y único
                filename = secure_filename(foto_file.filename)
                base, ext = os.path.splitext(filename)
                # usamos timestamp para asegurar un nombre unico
                unique_filename = f"{base}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}{ext}"
                
                # Ruta completa para guardar en el servidor (static/uploads/)
                ruta_completa_sistema = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
                
                # Guardar el archivo
                foto_file.save(ruta_completa_sistema)
                
                # Ruta relativa para guardar en la base de datos (uploads/nombre_unico.jpg)
                ruta_relativa_db = os.path.join("uploads", unique_filename).replace("\\", "/")
                
                foto_db = db.Foto(
                    ruta_archivo=ruta_relativa_db,
                    nombre_archivo=filename,
                    actividad_id=aviso_id
                )
                session.add(foto_db)


            # Commit final para guardar todos los registros
            session.commit()
            session.close()
            return redirect(url_for("index"))

        except Exception as e:
            session.rollback()
            session.close()
            print("Error al guardar en DB:", e)
            # Devolver los datos del formulario en caso de error de DB
            return render_template("agregar.html", errores=[f"Error interno del servidor al guardar en DB. ({type(e).__name__}: {str(e)})"], datos_form=request.form, regiones=regiones)
    
    # Para el caso GET (mostrar el formulario vacio)
    session.close()
    return render_template("agregar.html", regiones=regiones)


@app.route("/estadisticas")
def estadisticas():
    # Ruta de Estadisticas: Define estadisticas() para url_for('estadisticas')"""
    return render_template("estadisticas.html")


@app.route("/api/regiones")
def api_regiones():
    # API para que el JS del formulario cargue regiones y comunas dinamicamente
    session = db.SessionLocal()
    try:
        # Se usa joinedload para cargar comunas en la misma consulta
        regiones = session.query(db.Region).options(joinedload(db.Region.comunas)).all()
        data = []
        for r in regiones:
            data.append({
                "id": r.id,
                "nombre": r.nombre,
                "comunas": [{"id": c.id, "nombre": c.nombre} for c in r.comunas]
            })
        return jsonify(data)
    finally:
        session.close()

if __name__ == "__main__":
    app.run(debug=True)