# todo_nestjs_workspace

## Descripción del Proyecto

La prueba técnica consiste en desarrollar una micro aplicación de TODO clásica, usando Nest.js o .NET y siguiendo el patrón de diseño de software CQRS, IoC y DDD/Hexagonal con repositorios. Todo lo que puedas aportar como Docker, TDD, message-bus, migraciones, hexagonal, login JWT, etc, se tendrán en cuenta.

Nos interesa que nos comentes tus impresiones sobre el patrón CQRS y la soltura a la hora de aplicar DDD correctamente.


## Descripción del Proyecto

El objetivo de este proyecto es definir un sistema distribuido con diferentes servicios:

- todo service
- auth service

Comunicados via rabbitmq para que cuando se realice una acción en el servicio de auth se generen tareas para usuarios nuevos con tareas nuevas etc...

Además cada servicio tiene su propia base de datos MySQL y que pueda trabajar con SQLite para hacer pruebas de los servicios de manera individual desplegando en dev.

La idea es definir un workspace donde se proporcionen las herramientas necesarias para trabajar con este sistema distribuido

## Instrucciones

Deployment:
- `sh deploy.sh`

Detener contenedores:
- `docker-compose stop`

Levantar contenedores:
- `docker-compose up -d`

## Endpoint Swagger

- `/api` contiene una vista con la que podemos probar los endpoints CRUD en los respectivos puertos de auth y todo

## Scripts

- `start`: Inicia la aplicación en modo production
- `start:dev`: Inicia la aplicación en modo development
- `build`: Compila el código TypeScript
- `lint`: Realiza la verificación de estilo con ESLint
- `tests`: Realiza test unitarios
- `e2e tests`: Raliza test e2e

## Funcionalidades Destacadas

- **Autenticación Segura**: Implementa un sistema completo de autenticación de usuarios, incluyendo registro, inicio de sesión y autenticación JWT.
- **Gestión de Tareas**: Permite a los usuarios crear, modificar, eliminar y visualizar tareas de manera eficiente.
- **Patrón CQRS**: Mejora la escalabilidad y el mantenimiento del proyecto al separar las operaciones de lectura y escritura, siguiendo los principios del diseño dirigido por el dominio (DDD).
- **Inversión de Control (IoC)**: Utiliza el patrón de Inversión de Control para desacoplar las dependencias y facilitar la prueba unitaria y la modularidad del código.
- **Arquitectura Hexagonal**: Implementa una arquitectura hexagonal para organizar el código en capas independientes, facilitando la separación de preocupaciones y la gestión de la complejidad.
- **Documentación API con Swagger**: Facilita el desarrollo y la integración frontend mediante documentación interactiva de la API.

## Tecnologías Implementadas

- **NestJS**: Framework de desarrollo para aplicaciones server-side en Node.js, elegido por su escalabilidad y versatilidad.
- **Swagger**: Integrado para proporcionar una documentación interactiva y exploración de la API.
- **Docker**: Utilizado para contenerizar y desplegar la aplicación de manera consistente en cualquier entorno.
- **RabbitMQ**: Empleado para la comunicación asíncrona entre microservicios, facilitando la integración y la gestión de eventos.
- **SQLite**: Sistema de gestión de bases de datos ligero y autónomo, seleccionado por su simplicidad y facilidad de uso.
- **MySQL**: Base de datos relacional utilizada para almacenar datos estructurados y garantizar la persistencia de la información.


## Arquitectura Workspaces


![alt text](image-1.png)

El proyecto se organiza en módulos claros y bien definidos para facilitar la navegación y el desarrollo:
`
- /workspace
  - /auth: Módulo de autenticación de usuarios.
  - /todo: Módulo para la gestión de tareas.
  - /shared: Código y utilidades compartidas.
  - /nginx: Modulo de proxy inverso.
  - deploy.sh: Script para el despliegue con Docker.
  - docker-compose.yml: Configuración de Docker Compose.



## Arquitectura servicios nest (DDD, Hexagonal, CQRS)

![alt text](image.png)

El proyecto se organiza siguiendo DDD, Hexagonal, CQRS

```s
── proyecto
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── src
    │   ├── app.module.ts
    │   ├── main.ts
    │   └── feature
    │       ├── application
    │       │   ├── commands
    │       │   │   ├── create.command.ts
    │       │   │   ├── delete.command.ts
    │       │   │   └── update-by-completed.command.ts
    │       │   ├── dto
    │       │   │   ├── create-dto.ts
    │       │   │   └── update-dto.ts
    │       │   ├── handlers
    │       │   │   ├── create.handler.ts
    │       │   │   ├── delete.handler.ts
    │       │   │   ├── list-by-id.handler.ts
    │       │   │   ├── list.handler.ts
    │       │   │   └── update-by-completed.handler.ts
    │       │   └── queries
    │       │       ├── list-by-id.query.ts
    │       │       └── list.query.ts
    │       ├── domain
    │       │   ├── entities
    │       │   │   └── entity.ts
    │       │   └── repositories
    │       │       └── interface-repository.ts
    │       ├── infrastructure
    │       │   ├── api
    │       │   │   ├── controller.spec.ts
    │       │   │   └── controller.ts
    │       │   ├── config
    │       │   │   ├── database.module.ts
    │       │   │   ├── orm-dev.config.ts
    │       │   │   ├── orm-prod.config.ts
    │       │   │   ├── rabbitmq.config.ts
    │       │   │   └── swagger.config.ts
    │       │   ├── database
    │       │   │   ├── 1710697456273-migrations.ts
    │       │   │   └── migrations
    │       │   ├── logger
    │       │   │   └── logger.config.ts
    │       │   ├── messaging
    │       │   │   └── events-consumer.service.ts
    │       │   └── persistence
    │       │       └── repository.ts
    │       └── module.ts
    ├── test
    │   ├── app.e2e-spec.ts
    │   └── jest-e2e.json
    ├── tsconfig.build.json
    └── tsconfig.json

https://fakerjs.dev/api/company.html