# todo-api

API REST de tareas (To-Do) en Node.js y Express.

- Repositorio: https://github.com/angelmesp/todo-api
- Imagen Docker Hub: https://hub.docker.com/r/angelmesp/todo-api
- Etiqueta: `1.0`

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio |
| GET | `/api/todos` | Listar todas las tareas |
| GET | `/api/todos/:id` | Consultar una tarea |
| POST | `/api/todos` | Crear una tarea |
| PUT | `/api/todos/:id` | Actualizar una tarea |
| DELETE | `/api/todos/:id` | Eliminar una tarea |

Cuerpo para crear:

```json
{
  "title": "Estudiar DevSecOps",
  "completed": false
}
```

`title` es obligatorio. `completed` es opcional y debe ser boolean.

## Ejecutar en local

```bash
npm install
npm start
```

La API queda en `http://localhost:8080`.

```bash
curl http://localhost:8080/health

curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Estudiar DevSecOps"}'

curl http://localhost:8080/api/todos
```

## Ejecutar con Docker

```bash
docker build -t angelmesp/todo-api:1.0 .
docker run --rm -p 8080:8080 angelmesp/todo-api:1.0
```

Imagen publicada:

```bash
docker pull angelmesp/todo-api:1.0
docker run --rm -p 8080:8080 angelmesp/todo-api:1.0
```

## SonarQube

Proyecto analizado: **todo-api** (SonarQube 9.9.8).

| Métrica | Resultado |
|---------|-----------|
| Quality Gate | OK |
| Bugs | 0 |
| Vulnerabilidades | 0 |
| Code smells | 0 |
| Security hotspots | 0 |

Hallazgos corregidos:

1. Validación de `title` y `completed` en creación y actualización.
2. Respuestas de error uniformes (400, 404 y 500) y middleware de error.
3. `javascript:S5689`: se deshabilitó `X-Powered-By` con `app.disable("x-powered-by")`.

Evidencia: `evidencias/sonar-dashboard.png`, `evidencias/sonar-issues.png`, `evidencias/sonar-metricas.json`.

## Trivy

Comando:

```bash
trivy image angelmesp/todo-api:1.0
```

Resultado de la imagen publicada `angelmesp/todo-api:1.0`:

- Alpine 3.24.1: 0 vulnerabilidades HIGH/CRITICAL
- Dependencias de la API: 0 vulnerabilidades HIGH/CRITICAL

En el primer escaneo la base `node:20-alpine` reportó HIGH/CRITICAL en openssl y en npm de la imagen. Se cambió a `node:22-alpine`, se aplicó `apk upgrade` y se eliminó npm del runtime. El segundo escaneo quedó en 0.

Evidencia: `evidencias/trivy-reporte.png`, `evidencias/trivy-image.txt`.

## Docker Hub

- URL: https://hub.docker.com/r/angelmesp/todo-api
- Etiqueta: `1.0`

Evidencia: `evidencias/dockerhub.png`.

## Reflexión

El problema no fue el CRUD, sino cerrar el flujo hasta una imagen publicada y revisada. El código aceptaba datos inválidos; se corrigió la validación y el manejo de errores. Sonar señaló la cabecera X-Powered-By y se deshabilitó. Docker exigió usuario no root y no copiar node_modules del host. Trivy mostró que la seguridad depende de la imagen base: se actualizó Alpine y se quitó npm del runtime. El artefacto que se escanea es el mismo que está en Docker Hub con la etiqueta 1.0.
