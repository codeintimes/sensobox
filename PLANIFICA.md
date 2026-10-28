# Planifica · planificación de producción dentro de Sensobox

Pestaña **Planifica › Planificación** del menú del administrador (`/planifica`): Gantt de arrastrar y soltar, carga por
máquina, órdenes con su fecha de entrega, simulación de pedidos urgentes y recursos/calendarios/rutas.

## Arranque
Igual que Sensobox (ver `LEEME-erp.md` del sector): Mongo en 27042, backend en 5208 y frontend en 5108.
Variables nuevas en `sensobox_back/.env` (ver `.env.example`):

```
RITMIA_URL=http://localhost:5331         # opcional: capacidad real desde Ritmia
INTEGRATION_KEY=ritmia-sensobox-demo     # la misma que en Ritmia
```

## Demo
Con los datos de la demo de Sensobox cargados (administradora `laura.martin@envasesturia.es` / `Demo2026!`):

```bash
TOKEN=$(curl -s -X POST localhost:5208/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"laura.martin@envasesturia.es","password":"Demo2026!"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
curl -X POST "localhost:5208/planning/demo?lang=es" -H "Authorization: Bearer $TOKEN"   # es, en, nl, de, fr, it
```

Crea 9 recursos (8 inyectoras, las mismas de Ritmia, y un puesto de montaje), 3 calendarios, 8 artículos con ruta y
18 órdenes (8 en curso), de las que 3 salen con retraso. Las órdenes llevan siempre los números 26001-26018 (las 8 en curso
son las impares, 26001…26015): son los que tiene la demo de Lotea, así que Planta 3D encuentra los lotes de cada OF por su número.
Si ese bloque lo ocupan órdenes que no son de la demo, se numera tras la última. Volver a lanzarlo deja la demo «en directo» (plan desde ahora).
La demo carga también 8 órdenes cerradas de **Fornival Hornos Industriales** (otra empresa: no salen en Planifica ni en las
listas de Envases Turia): los hornos del parque de Averix con su número de serie, numerados AANNN (OF-2025-0042 de Averix = 25042).
La demo carga además **Cerámicas Millars, S.A.** (Vila-real), la línea CAS-1 de Planta 3D y Atisba: prensa PR-01, esmaltado
ES-01, horno de rodillos HR-01 y clasificadora CL-01 con su calendario de horno continuo (24 h, 7 días) y tres artículos de
porcelánico. Recursos, calendario y artículos llevan `company`: **solo los ve Millars** (Planifica filtra por la empresa del
usuario; Envases Turia y el resto ven lo de siempre). OF cerradas 261182 y 261183 y abiertas 261184…261188 (= OF-26-1182… de
Atisba y Lotea); la 261184 lleva 3 h en la línea (todas las fases fijadas a la vez) y `dispatch` la da «running» en HR-01.
Usuarios: `marta.climent@ceramicasmillars.es` (admin) y `vicent.arnau@ceramicasmillars.es` (técnico), clave `Demo2026!`.
Con la demo recién cargada salen con retraso 3 órdenes de Envases Turia y 1 de Millars (261185).
Si se recargan los datos de los vídeos de Sensobox (`videos-guiones/sensobox/guiones/datos_demo.mjs`), hay que volver a lanzar la demo de Planifica.

## API
`GET /planning/plan`, `GET /planning/load`, `POST /planning/replan`, `PATCH /planning/operations/:id` (mover y fijar),
`POST /planning/operations/:id/unlock`, `POST /planning/simulate`, `POST /planning/simulate/confirm`,
`POST /planning/orders/:id/link`, `PATCH /planning/orders/:id`, `GET /planning/master`, `PATCH /planning/resources/:code`,
`PATCH /planning/calendars/:code`, `POST /planning/demo`. Integración con Ritmia (cabecera `x-api-key`):
`GET /planning/integration/dispatch` y `POST /planning/integration/progress`.
Planta 3D (gemelo digital), misma cabecera: `GET /planning/integration/orders-at-risk?marginHours=24` → pedidos retrasados,
sin plan o con menos de 24 h de holgura, para su panel de dirección; la OF en curso por máquina sale de `dispatch`.

Acopia (compras con IA), misma clave como `Authorization: Bearer <INTEGRATION_KEY>` o `x-api-key`:
`GET /api/of` → OF abiertas a las que les falta material (`[{ ref, producto, inicio, faltan }]`) y
`GET /api/of/{ref}/materiales` → `{ ref, producto, inicio, materiales: [{ codigo, descripcion, cantidad, unidad, falta }] }`.
La lista de materiales por artículo y las existencias de la demo están en `src/planning/domain/materials.ts` (códigos de
compra de Envases Turia, los mismos que en Acopia); las existencias se reservan por orden de inicio del plan.

## Tests
`cd sensobox_back && npx jest --config jest.config.ts src/planning` (planificador, riesgo y materiales de las OF).
