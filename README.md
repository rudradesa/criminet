# Criminal Intelligence System — Automatic Relationship Discovery

Node.js + Express + EJS + Neo4j.

## Architecture

1. Data entry stores raw entity records only.
2. No application code creates Neo4j relationships.
3. The analysis engine loads raw nodes and discovers associations at runtime.
4. A BFS traversal turns discovered associations into an investigation tree from a selected root.
5. D3 visualizes the discovered graph/tree.

## Automatic discovery rules

- Person phone number ↔ Phone phone number
- Person vehicle registration ↔ Vehicle registration number
- Person address + city (+ state) ↔ Address
- Case personIds ↔ Person ID
- Case phoneIds ↔ Phone ID
- Case vehicleIds ↔ Vehicle ID
- Case locationIds ↔ Location ID

These are investigative associations, not proof of criminal involvement.

## Run

```powershell
npm install
npm start
```

Open `http://localhost:3000`.

## Main pages

- `/` Dashboard
- `/data-entry?type=PERSON` Raw Person data entry
- `/data-entry?type=CASE` Raw Case data entry
- `/relationships` Read-only relationship discovery
- `/graph` Investigation tree

## API

- `GET /api/analysis/discover`
- `GET /api/analysis/entity/:type/:id`
- `GET /api/graph?rootType=PERSON&rootId=<id>&depth=3`
- `GET /api/entities/:type`
- `POST /api/entities/:type`

