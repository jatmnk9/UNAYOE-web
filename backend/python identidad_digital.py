import cv2
import face_recognition
import os
import numpy as np

# Nombre del archivo donde guardaremos la "base de datos" simulada
ARCHIVO_REFERENCIA = "usuario_registrado.jpg"

def registrar_usuario():
    """
    Paso 1: Captura una foto del usuario para usarla como referencia (Onboarding).
    """
    cap = cv2.VideoCapture(0)
    print("--- MODO REGISTRO ---")
    print("Mira a la cámara y presiona 'S' para guardar tu foto de perfil.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Guía visual
        height, width, _ = frame.shape
        cv2.rectangle(frame, (width//4, height//4), (3*width//4, 3*height//4), (255, 0, 0), 2)
        cv2.imshow('Registro - Presiona S para guardar', frame)

        # Esperar a que presione 's'
        if cv2.waitKey(1) & 0xFF == ord('s'):
            cv2.imwrite(ARCHIVO_REFERENCIA, frame)
            print(f"Foto guardada exitosamente: {ARCHIVO_REFERENCIA}")
            break

    cap.release()
    cv2.destroyAllWindows()

def validar_acceso():
    """
    Paso 2: Compara el video en vivo con la foto guardada (Autenticación).
    """
    if not os.path.exists(ARCHIVO_REFERENCIA):
        print("Error: No existe usuario registrado. Ejecuta la opción 1 primero.")
        return

    print("Cargando perfil biométrico...")
    
    # Cargar imagen de referencia
    try:
        imagen_referencia = face_recognition.load_image_file(ARCHIVO_REFERENCIA)
        encoding_referencia = face_recognition.face_encodings(imagen_referencia)[0]
    except IndexError:
        print("Error: No se detectó rostro en la foto guardada. Intenta registrarte de nuevo con mejor luz.")
        return

    # Iniciar cámara
    cap = cv2.VideoCapture(0)
    print("--- MODO VALIDACIÓN ---")
    print("Presiona 'Q' para salir.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Optimización: Reducir tamaño para procesar más rápido
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        # Convertir BGR (OpenCV) a RGB (face_recognition)
        rgb_small_frame = np.ascontiguousarray(small_frame[:, :, ::-1])

        # Detectar rostros
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

        nombre_estado = "DESCONOCIDO"
        color = (0, 0, 255) # Rojo

        for face_encoding in face_encodings:
            # Comparar rostro detectado con la referencia
            match = face_recognition.compare_faces([encoding_referencia], face_encoding, tolerance=0.5)
            
            if match[0]:
                nombre_estado = "ACCESO CONCEDIDO"
                color = (0, 255, 0) # Verde
            else:
                nombre_estado = "ACCESO DENEGADO"

        # Dibujar resultados
        for (top, right, bottom, left) in face_locations:
            # Escalar coordenadas x4 (porque redujimos la imagen al inicio)
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4

            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.putText(frame, nombre_estado, (left, bottom + 20), cv2.FONT_HERSHEY_DUPLEX, 0.8, color, 1)

        cv2.imshow('Sistema de Identidad Digital (Q para salir)', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    print("1. Registrar usuario (Onboarding)")
    print("2. Validar identidad (Login)")
    opcion = input("Elige una opción: ")

    if opcion == "1":
        registrar_usuario()
    elif opcion == "2":
        validar_acceso()
    else:
        print("Opción inválida.")