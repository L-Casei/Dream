# 💭 Dream ChatBOT

> Un chatbot personalizado construido con **Spring Boot**, **Angular** y la **API de Gemini**

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- **Java 21** o superior - [Descargar](https://www.oracle.com/java/technologies/downloads/)
- **Node.js LTS** - [Descargar](https://nodejs.org/)
- **PowerShell 5.1+** (incluido en Windows)

---

## 🚀 Instalación Rápida

### 1. Clonar/Preparar el proyecto
```bash
cd Dream
```

### 2. Instalar dependencias del frontend
```bash
cd frontend_dream
npm install
cd ..
```

### 3. Configurar la API Key de Gemini
```powershell
setx GEMINI_API_KEY "tu_clave_api_aqui"
```

> ⚠️ **Importante**: Cierra PowerShell después de configurar la variable de entorno y abre una nueva sesión.

### 4. Iniciar la aplicación
```powershell
.\start-dream.ps1
```

Lo mas sencillo es ejecutarla en powershell que es una opción que te da de por si Windows

### 5. Acceder a la aplicación
Abre tu navegador y ve a:
```
http://localhost:4200
```

---

## 🏗️ Estructura del Proyecto

```
Dream/
├── backend_dream/           # API REST (Spring Boot)
│   └── src/main/java/com/example/demo/
│       ├── chat/            # Controlador y servicios del chat
│       ├── config/          # Configuración de seguridad
│       └── health/          # Health check del backend
│
├── frontend_dream/          # Aplicación web (Angular)
│   └── src/app/
│       ├── components/      # Componentes reutilizables
│       ├── services/        # Servicios (chat, tema)
│       ├── models/          # Modelos de datos
│       └── data/            # Datos y mock services
│
└── README.md                # Este archivo
```

---

## 🔌 Endpoints Disponibles

### Health Check
```
GET http://localhost:8080/api/health
```
Verifica si el backend está funcionando.

**Respuesta:**
```json
{
  "status": "UP",
  "message": "El backend está funcionando correctamente",
  "timestamp": "2026-04-29T10:30:45.123456"
}
```

### Chat
```
POST http://localhost:8080/api/chat
```
Envía un mensaje al chatbot y recibe una respuesta.

---

## 💻 Tecnologías Utilizadas

| Parte | Tecnología | Versión |
|-------|-----------|---------|
| Backend | Spring Boot | 3.x |
| Frontend | Angular | 18+ |
| Base de Datos | - | - |
| IA | Google Gemini API | Gemini 2.5 Flash |
| Java | OpenJDK | 21 |

---

## 📱 Características

- ✅ Chat interactivo en tiempo real
- ✅ Integración con Google Gemini API
- ✅ Interfaz moderna con Angular
- ✅ Health check del backend
- ✅ Manejo de errores robusto
- ✅ Tema personalizable

---

## 🛠️ Desarrollo

### Ejecutar solo el backend
```powershell
cd backend_dream
./mvnw spring-boot:run
```

### Ejecutar solo el frontend
```powershell
cd frontend_dream
ng serve
```

### Compilar para producción
```powershell
cd frontend_dream
ng build --configuration production
```

---

## 📝 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-----------|-----------|
| `GEMINI_API_KEY` | Clave de API de Google Gemini | ✅ Sí |

---

## 🤝 Soporte

Si encuentras problemas:

1. Verifica que Java 21 y Node.js LTS están instalados
2. Comprueba que `GEMINI_API_KEY` está configurada correctamente
3. Asegúrate de que los puertos 8080 (backend) y 4200 (frontend) están disponibles
4. Revisa los logs de la aplicación

---

## 📄 Licencia

Este proyecto es de uso personal.