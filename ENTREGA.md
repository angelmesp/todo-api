# Entrega — Unidad IV: Trivy, Sonar, Docker

**Actividad:** Trivy, Sonar, Docker  
**Modalidad:** Individual  
**Aplicación:** API REST de tareas (To-Do) en Node.js + Express  
**Versión de la imagen:** `1.0`

---

## 1. Idea de la aplicación

Se construyó una API REST pequeña de tareas. Permite crear, listar, consultar, actualizar y eliminar pendientes. El almacenamiento es en memoria para mantener el ejercicio simple y reproducible dentro de un contenedor.

Endpoints reales:

- `GET /health` — verifica que el servicio está vivo
- `GET /api/todos` — lista las tareas
- `POST /api/todos` — crea una tarea
- `PUT /api/todos/:id` — actualiza título o estado
- `DELETE /api/todos/:id` — elimina una tarea

También existe `GET /api/todos/:id` para consultar una tarea puntual.

---

## 2. Cómo ejecutar

### En local

```bash
cd todo-api
npm install
npm start
```

Prueba rápida:

```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/todos -H "Content-Type: application/json" -d '{"title":"Entregar actividad 4"}'
curl http://localhost:8080/api/todos
```

### Con Docker

```bash
docker build -t angelmesp/todo-api:1.0 .
docker run --rm -p 8080:8080 angelmesp/todo-api:1.0
```

---

## 3. Evidencias del flujo DevSecOps

### 3.1 IA — registro de prompts

Se usó IA como apoyo, no como reemplazo. Cada resultado se revisó y se ajustó antes de dejarlo en el proyecto.

| # | Prompt utilizado | Qué aportó la IA | Qué se hizo después |
|---|------------------|------------------|---------------------|
| 1 | Ayúdame a crear una API REST sencilla de tareas en Node.js. Debe tener crear, listar, actualizar y eliminar. Explícame la estructura antes de generar código. | Propuso separar `index.js` (servidor), `todos.js` (rutas) y `store.js` (datos en memoria). | Se aceptó esa estructura porque es fácil de explicar y de analizar en Sonar. |
| 2 | Revisa este código y dime qué problemas de calidad podría detectar Sonar. No lo reescribas completo; explícame primero los problemas. | Señaló falta de validación de entrada, respuestas de error inconsistentes y un middleware de error incompleto. | Se agregó validación de `title` y `completed`, códigos HTTP claros y un manejador de error 500. |
| 3 | Genera un Dockerfile sencillo y seguro para esta aplicación. Explícame cada instrucción. | Sugirió imagen Alpine, `npm ci --omit=dev`, usuario no root y `NODE_ENV=production`. | Se usó `node:20.19.4-alpine3.21` (versión concreta, no `latest`) y un usuario `appuser`. |
| 4 | Revisa mi README y dime si otra persona podría ejecutar la aplicación siguiendo únicamente esas instrucciones. | Indicó que faltaban ejemplos de `curl` y el comando exacto de Docker. | Se completó el README con tabla de endpoints, local y Docker. |
| 5 | Trivy reporta vulnerabilidades en la imagen base. Explícame el riesgo y una forma segura de corregirla. | Explicó que muchas HIGH/CRITICAL vienen de paquetes del SO en la imagen base, no del código de la API. | Se fijó una imagen Alpine reciente y se volvió a escanear. |

Decisión técnica tomada con apoyo de IA: **no usar `node:latest`**. Una etiqueta concreta permite reproducir el build y reduce sorpresas en Trivy.

### 3.2 SonarQube / SonarCloud

Archivo de configuración incluido: `sonar-project.properties`.

Hallazgos revisados y corregidos en el código (al menos 2):

1. **Validación de entrada (bug / reliability).** Una tarea podía crearse sin `title` o con un valor vacío. Se validó que `title` sea texto no vacío y que `completed` sea boolean.
2. **Manejo de errores (code smell / reliability).** Rutas inexistentes no tenían respuesta uniforme y un fallo interno podía quedar sin capturar. Se agregó 404 de ruta y un middleware de error 500.
3. **Código muerto / complejidad innecesaria.** Se evitó lógica duplicada extrayendo `isNonEmptyString` y dejando el almacén en `store.js`.

Interpretación: el análisis se usó para mejorar claridad y robustez, no solo para “pasar” la herramienta. El código entregado es el mismo que se analiza.

### 3.3 Docker

Dockerfile incluido en la raíz del proyecto.

Instrucciones clave y por qué están:

- Build de dos etapas con `node:22-alpine` — base reciente y sin npm en el runtime
- `npm ci --omit=dev` — instala solo dependencias de producción
- `apk upgrade` — parchea paquetes del sistema (openssl)
- `USER appuser` — el proceso no corre como root
- `HEALTHCHECK` contra `/health`

Comando de construcción:

```bash
docker build -t angelmesp/todo-api:1.0 .
```

Comando de ejecución:

```bash
docker run --rm -p 8080:8080 angelmesp/todo-api:1.0
```

Comprobación: `GET /health` responde `{ "status": "ok" }` y los endpoints CRUD funcionan.

### 3.4 Trivy

Comandos usados:

```bash
trivy fs --scanners vuln,secret,misconfig .
trivy config Dockerfile
trivy image angelmesp/todo-api:1.0
```

Resultados reales:

**Código y Dockerfile**
- `package-lock.json`: 0 vulnerabilidades
- Dockerfile: 1 hallazgo LOW (`DS-0026`, faltaba `HEALTHCHECK`) → se agregó y el segundo escaneo quedó en 0

**Imagen `angelmesp/todo-api:1.0` (primer escaneo)**
- Alpine 3.21.4: 17 hallazgos (HIGH: 15, CRITICAL: 2) en openssl/libssl
- npm incluido en la imagen Node: HIGH/CRITICAL en paquetes internos (`tar`, `minimatch`, etc.)
- Dependencias de la API (Express): 0

**Corrección**
Se cambió la base a `node:22-alpine`, se hizo `apk upgrade` y se quitó npm del runtime (build de dos etapas).

**Imagen publicada (segundo escaneo)**
- Alpine 3.24.1: 0 vulnerabilidades HIGH/CRITICAL
- Dependencias de la aplicación: 0

### 3.5 Docker Hub

```bash
docker login
docker push angelmesp/todo-api:1.0
```

URL pública: https://hub.docker.com/r/angelmesp/todo-api

Etiqueta publicada: `1.0`

---

## 4. Reflexión final

El problema principal no fue programar el CRUD, sino completar el flujo hasta publicar una imagen revisada. Al principio el código aceptaba datos inválidos; Sonar (y la revisión previa de calidad) dejó claro que eso es un hallazgo real, no un detalle menor. Se corrigió la validación y el manejo de errores. Después, Docker obligó a pensar en usuario no root y en no copiar `node_modules` del host. Trivy mostró que la seguridad de la imagen depende mucho de la base elegida: usar `latest` es cómodo, pero una etiqueta concreta y reciente es más controlable. Publicar en Docker Hub cierra el ciclo: el mismo artefacto que se escanea es el que se entrega. Lo que aprendí del flujo DevSecOps es que calidad y seguridad no van al final como un extra, sino como pasos que cambian el código, el Dockerfile y la versión que se publica.

---

## 5. Enlaces de entrega

| Entregable | Valor |
|------------|--------|
| Repositorio | https://github.com/angelmesp/todo-api |
| Imagen Docker Hub | `https://hub.docker.com/r/angelmesp/todo-api` |
| Etiqueta | `1.0` |
| Sonar | *(pegar captura o URL del análisis)* |
| Trivy | Ver carpeta `evidencias/` y sección 3.4 |

---

## 6. Estructura del proyecto

```
todo-api/
  src/index.js                 Servidor Express y /health
  src/todos.js                 Rutas CRUD y validación
  src/store.js                 Almacén en memoria
  Dockerfile
  .dockerignore
  sonar-project.properties
  package.json
  README.md
  ENTREGA.md
```
