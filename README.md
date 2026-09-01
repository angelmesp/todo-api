# todo-api

API REST de tareas (To-Do) en Node.js y Express. Permite crear, listar, consultar, actualizar y eliminar tareas. El estado se guarda en memoria mientras el proceso está activo.

- Repositorio: https://github.com/angelmesp/todo-api
- Imagen Docker: https://hub.docker.com/r/angelmesp/todo-api (`1.0`)

## Requisitos

- Node.js 20 o superior
- Docker (para ejecutar en contenedor)

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio |
| GET | `/api/todos` | Listar todas las tareas |
| GET | `/api/todos/:id` | Consultar una tarea |
| POST | `/api/todos` | Crear una tarea |
| PUT | `/api/todos/:id` | Actualizar una tarea |
| DELETE | `/api/todos/:id` | Eliminar una tarea |

Cuerpo esperado en creación:

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

Ejemplos:

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

Imagen publicada: https://hub.docker.com/r/angelmesp/todo-api

## Análisis de calidad (SonarQube)

1. Inicie SonarQube local (usuario y contraseña inicial: `admin` / `admin`):

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

2. Cree el proyecto `todo-api` en `http://localhost:9000` y genere un token.
3. Analice el código:

```bash
docker run --rm \
  --network host \
  -e SONAR_HOST_URL=http://localhost:9000 \
  -e SONAR_TOKEN=SU_TOKEN \
  -v "$PWD:/usr/src" \
  sonarsource/sonar-scanner-cli
```

## Escaneo de seguridad (Trivy)

```bash
trivy image angelmesp/todo-api:1.0
```

## Publicar en Docker Hub

```bash
docker login
docker push angelmesp/todo-api:1.0
```

## Uso de IA

Ver la sección **Uso de IA y reflexión** en [ENTREGA.md](ENTREGA.md).
