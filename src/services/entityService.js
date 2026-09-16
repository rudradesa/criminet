const { driver } = require('../config/neo4j');

const schemas = {
  PERSON: {
    label: 'Person',
    idPrefix: 'PER',
    idField: 'personId',
    fields: [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'nationality',
      'identificationNumber', 'status', 'phoneNumber',
      'vehicleRegistrationNumber', 'addressLine', 'city', 'state'
    ]
  },
  CASE: {
    label: 'Case',
    idPrefix: 'CASE',
    idField: 'caseId',
    fields: ['title', 'description', 'caseType', 'status', 'openedDate']
  },
  VEHICLE: {
    label: 'Vehicle',
    idPrefix: 'VEH',
    idField: 'vehicleId',
    fields: ['registrationNumber', 'make', 'model', 'color', 'vehicleType']
  },
  PHONE: {
    label: 'Phone',
    idPrefix: 'PHONE',
    idField: 'phoneId',
    fields: ['phoneNumber', 'imei', 'carrier']
  },
  ADDRESS: {
    label: 'Address',
    idPrefix: 'ADDR',
    idField: 'addressId',
    fields: [
      'addressLine', 'city', 'state', 'postalCode', 'country',
      'latitude', 'longitude'
    ]
  },
  LOCATION: {
    label: 'Location',
    idPrefix: 'LOC',
    idField: 'locationId',
    fields: [
      'name', 'description', 'address', 'city', 'state',
      'latitude', 'longitude'
    ]
  }
};

const TYPES = Object.keys(schemas);

function normalizeType(type) {
  return String(type || '').trim().toUpperCase();
}

function cleanValue(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim();
}

function cleanArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map(v => {
        if (v && typeof v === 'object') {
          return cleanValue(v.id || v.personId || v.phoneId || v.vehicleId || v.addressId || v.locationId);
        }
        return cleanValue(v);
      })
      .filter(Boolean);
  }

  return [cleanValue(value)].filter(Boolean);
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36).slice(2, 7).toUpperCase()}`;
}

function dbSession() {
  return driver.session({
    database: process.env.NEO4J_DATABASE || 'neo4j'
  });
}

function normalizeMatch(value) {
  return cleanValue(value).toLowerCase();
}

function arrayContains(value, target) {
  const wanted = normalizeMatch(target);
  if (!wanted || !Array.isArray(value)) return false;

  return value.some(item => {
    if (item && typeof item === 'object') {
      return normalizeMatch(
        item.id || item.personId || item.phoneId || item.vehicleId ||
        item.addressId || item.locationId
      ) === wanted;
    }
    return normalizeMatch(item) === wanted;
  });
}

function sameText(a, b) {
  const x = normalizeMatch(a);
  const y = normalizeMatch(b);
  return Boolean(x && y && x === y);
}

function sameAddress(person, address) {
  const personLine = normalizeMatch(person.addressLine);
  const addressLine = normalizeMatch(address.addressLine);

  if (!personLine || !addressLine || personLine !== addressLine) {
    return false;
  }

  const personCity = normalizeMatch(person.city);
  const addressCity = normalizeMatch(address.city);
  const personState = normalizeMatch(person.state);
  const addressState = normalizeMatch(address.state);

  return (!personCity || !addressCity || personCity === addressCity) &&
    (!personState || !addressState || personState === addressState);
}

function sameCoordinates(a, b) {
  const latA = cleanValue(a.latitude);
  const lonA = cleanValue(a.longitude);
  const latB = cleanValue(b.latitude);
  const lonB = cleanValue(b.longitude);

  return Boolean(latA && lonA && latB && lonB &&
    latA === latB && lonA === lonB);
}

/*
 * IMPORTANT:
 * This Phase 4 service NEVER creates Neo4j relationships.
 *
 * Neo4j stores raw entity records. The functions below load those records
 * and discover associations in JavaScript at runtime.
 */

async function createEntity(type, input = {}) {
  const key = normalizeType(type);
  const schema = schemas[key];

  if (!schema) {
    throw new Error(`Unsupported entity type: ${key}`);
  }

  if (key === 'CASE') {
    return createCase(input);
  }

  const props = {};

  for (const field of schema.fields) {
    if (['phoneNumber', 'vehicleRegistrationNumber', 'addressLine', 'city', 'state'].includes(field)) {
      props[field] = cleanValue(input[field]);
    } else {
      props[field] = cleanValue(input[field]);
    }
  }

  props[schema.idField] = makeId(schema.idPrefix);
  props.createdAt = new Date().toISOString();

  if (['PHONE', 'VEHICLE', 'ADDRESS'].includes(key)) {
    props.personIds = cleanArray(input.personIds || input.suspectIds);
  }

  const session = dbSession();

  try {
    const result = await session.run(
      `CREATE (n:${schema.label} $props) RETURN n`,
      { props }
    );

    return result.records[0].get('n').properties;
  } finally {
    await session.close();
  }
}

async function createCase(input = {}) {
  const title = cleanValue(input.title);

  if (!title) {
    throw new Error('Case title is required');
  }

  const allowedCaseTypes = ['THEFT', 'ASSAULT', 'FRAUD', 'OTHER'];
  const allowedStatuses = ['UNKNOWN', 'OPEN', 'CLOSED'];
  const allowedPersonRoles = ['PERSON_OF_INTEREST', 'SUSPECT', 'WITNESS'];

  const caseType = cleanValue(input.caseType).toUpperCase() || 'OTHER';
  const status = cleanValue(input.status).toUpperCase() || 'UNKNOWN';

  if (!allowedCaseTypes.includes(caseType)) {
    throw new Error(`Invalid case type: ${caseType}`);
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid case status: ${status}`);
  }

  let persons = [];

  if (Array.isArray(input.persons)) {
    persons = input.persons
      .map(person => ({
        id: cleanValue(person && (person.id || person.personId)),
        role: cleanValue(person && person.role).toUpperCase() || 'PERSON_OF_INTEREST'
      }))
      .filter(person => person.id);
  } else {
    persons = cleanArray(input.personIds).map(id => ({
      id,
      role: 'PERSON_OF_INTEREST'
    }));
  }

  for (const person of persons) {
    if (!allowedPersonRoles.includes(person.role)) {
      throw new Error(`Invalid person relationship role: ${person.role}`);
    }
  }

  const caseId = makeId('CASE');

  /*
   * Raw references only.
   * No CREATE (a)-[:REL]->(b) is used here.
   */
  const props = {
    caseId,
    title,
    description: cleanValue(input.description),
    caseType,
    status,
    openedDate: cleanValue(input.openedDate),
    personIds: persons.map(person => person.id),
    personRoles: persons.map(person => person.role),
    locationIds: cleanArray(input.locationIds),
    phoneIds: cleanArray(input.phoneIds),
    vehicleIds: cleanArray(input.vehicleIds),
    createdAt: new Date().toISOString()
  };

  const session = dbSession();

  try {
    const result = await session.run(
      `CREATE (c:Case $props) RETURN c`,
      { props }
    );

    return result.records[0].get('c').properties;
  } finally {
    await session.close();
  }
}

async function getCaseFormOptions() {

    const database =
        process.env.NEO4J_DATABASE || 'neo4j';

    /*
     * Use separate sessions for each independent query.
     * This prevents a transaction on one session from
     * interfering with another query.
     */

    const personsSession = driver.session({ database });
    const locationsSession = driver.session({ database });
    const phonesSession = driver.session({ database });
    const vehiclesSession = driver.session({ database });

    try {

        // ==============================
        // PERSONS
        // ==============================

        const personsResult = await personsSession.run(`
            MATCH (p:Person)
            RETURN
                p.personId AS id,
                p.firstName AS firstName,
                p.lastName AS lastName
            ORDER BY
                toString(p.personId)
        `);


        // ==============================
        // LOCATIONS
        // ==============================

        const locationsResult = await locationsSession.run(`
            MATCH (l:Location)
            RETURN
                l.locationId AS id,
                l.name AS name,
                l.city AS city
            ORDER BY
                toString(l.locationId)
        `);


        // ==============================
        // PHONES
        // ==============================

        const phonesResult = await phonesSession.run(`
            MATCH (p:Phone)
            RETURN
                p.phoneId AS id,
                p.phoneNumber AS phoneNumber
            ORDER BY
                toString(p.phoneId)
        `);


        // ==============================
        // VEHICLES
        // ==============================

        const vehiclesResult = await vehiclesSession.run(`
            MATCH (v:Vehicle)
            RETURN
                v.vehicleId AS id,
                v.registrationNumber AS registrationNumber
            ORDER BY
                toString(v.vehicleId)
        `);


        // ==============================
        // RETURN OPTIONS
        // ==============================

        return {

            persons: personsResult.records.map(record => ({
                id: record.get('id'),
                firstName: record.get('firstName') || '',
                lastName: record.get('lastName') || ''
            })),

            locations: locationsResult.records.map(record => ({
                id: record.get('id'),
                name: record.get('name') || '',
                city: record.get('city') || ''
            })),

            phones: phonesResult.records.map(record => ({
                id: record.get('id'),
                phoneNumber: record.get('phoneNumber') || ''
            })),

            vehicles: vehiclesResult.records.map(record => ({
                id: record.get('id'),
                registrationNumber:
                    record.get('registrationNumber') || ''
            }))

        };

    } finally {

        await Promise.all([
            personsSession.close(),
            locationsSession.close(),
            phonesSession.close(),
            vehiclesSession.close()
        ]);

    }
}

async function listEntities(type) {
  const key = normalizeType(type);
  const schema = schemas[key];

  if (!schema) {
    throw new Error(`Unsupported entity type: ${key}`);
  }

  const session = dbSession();

  try {
    const result = await session.run(`
      MATCH (n:${schema.label})
      RETURN n
      ORDER BY n.createdAt DESC
      LIMIT 100
    `);

    return result.records.map(r => r.get('n').properties);
  } finally {
    await session.close();
  }
}

async function getEntity(type, id) {
  const key = normalizeType(type);
  const schema = schemas[key];

  if (!schema) {
    throw new Error(`Unsupported entity type: ${key}`);
  }

  const session = dbSession();

  try {
    const result = await session.run(
      `MATCH (n:${schema.label} {${schema.idField}: $id}) RETURN n`,
      { id }
    );

    return result.records.length
      ? result.records[0].get('n').properties
      : null;
  } finally {
    await session.close();
  }
}

/*
 * Load all raw records once.
 * No relationships are read or required.
 */
async function loadAllRawNodes() {
  const session = dbSession();

  try {
    const data = {};

    for (const type of TYPES) {
      const schema = schemas[type];

      const result = await session.run(`
        MATCH (n:${schema.label})
        RETURN n
      `);

      data[type] = result.records.map(record => {
        const properties = record.get('n').properties;

        return {
          type,
          id: properties[schema.idField],
          properties
        };
      });
    }

    return data;
  } finally {
    await session.close();
  }
}

function addEdge(edges, seen, source, target, relation, reason) {
  if (!source || !target || source.id === target.id && source.type === target.type) {
    return;
  }

  const key = [
    source.type, source.id,
    target.type, target.id,
    relation,
    reason
  ].join('|');

  if (seen.has(key)) return;

  seen.add(key);

  edges.push({
    source: `${source.type}:${source.id}`,
    target: `${target.type}:${target.id}`,
    sourceType: source.type,
    sourceId: source.id,
    targetType: target.type,
    targetId: target.id,
    type: relation,
    reason
  });
}

function discoverEdges(data) {
  const edges = [];
  const seen = new Set();

  const persons = data.PERSON || [];
  const cases = data.CASE || [];
  const phones = data.PHONE || [];
  const vehicles = data.VEHICLE || [];
  const addresses = data.ADDRESS || [];
  const locations = data.LOCATION || [];

  /*
   * PERSON <-> PHONE
   */
  for (const person of persons) {
    for (const phone of phones) {
      const p = person.properties;
      const ph = phone.properties;

      if (sameText(p.phoneNumber, ph.phoneNumber)) {
        addEdge(edges, seen, person, phone, 'PHONE_MATCH',
          'Person phone number matches Phone phone number');
      }

      if (arrayContains(ph.personIds, person.id)) {
        addEdge(edges, seen, person, phone, 'PHONE_REFERENCE',
          'Phone raw personIds references this Person');
      }
    }
  }

  /*
   * PERSON <-> VEHICLE
   */
  for (const person of persons) {
    for (const vehicle of vehicles) {
      const p = person.properties;
      const v = vehicle.properties;

      if (sameText(p.vehicleRegistrationNumber, v.registrationNumber)) {
        addEdge(edges, seen, person, vehicle, 'VEHICLE_MATCH',
          'Person vehicle registration matches Vehicle registration');
      }

      if (arrayContains(v.personIds, person.id)) {
        addEdge(edges, seen, person, vehicle, 'VEHICLE_REFERENCE',
          'Vehicle raw personIds references this Person');
      }
    }
  }

  /*
   * PERSON <-> ADDRESS
   */
  for (const person of persons) {
    for (const address of addresses) {
      const p = person.properties;
      const a = address.properties;

      if (sameAddress(p, a)) {
        addEdge(edges, seen, person, address, 'ADDRESS_MATCH',
          'Person address fields match Address record');
      }

      if (arrayContains(a.personIds, person.id)) {
        addEdge(edges, seen, person, address, 'ADDRESS_REFERENCE',
          'Address raw personIds references this Person');
      }

      if (sameCoordinates(p, a)) {
        addEdge(edges, seen, person, address, 'COORDINATE_MATCH',
          'Person and Address coordinates match');
      }
    }
  }

  /*
   * PERSON <-> CASE
   */
  for (const person of persons) {
    for (const caseItem of cases) {
      const c = caseItem.properties;

      if (arrayContains(c.personIds, person.id)) {
        const index = Array.isArray(c.personIds)
          ? c.personIds.findIndex(id => normalizeMatch(id) === normalizeMatch(person.id))
          : -1;

        const role = Array.isArray(c.personRoles) && index >= 0
          ? c.personRoles[index]
          : '';

        addEdge(
          edges,
          seen,
          person,
          caseItem,
          'CASE_REFERENCE',
          role
            ? `Case raw personIds references this Person; role=${role}`
            : 'Case raw personIds references this Person'
        );
      }
    }
  }

  /*
   * CASE <-> PHONE / VEHICLE / LOCATION
   */
  for (const caseItem of cases) {
    const c = caseItem.properties;

    for (const phone of phones) {
      if (arrayContains(c.phoneIds, phone.id)) {
        addEdge(edges, seen, caseItem, phone, 'CASE_PHONE_REFERENCE',
          'Case raw phoneIds references this Phone');
      }
    }

    for (const vehicle of vehicles) {
      if (arrayContains(c.vehicleIds, vehicle.id)) {
        addEdge(edges, seen, caseItem, vehicle, 'CASE_VEHICLE_REFERENCE',
          'Case raw vehicleIds references this Vehicle');
      }
    }

    for (const location of locations) {
      if (arrayContains(c.locationIds, location.id)) {
        addEdge(edges, seen, caseItem, location, 'CASE_LOCATION_REFERENCE',
          'Case raw locationIds references this Location');
      }
    }
  }

  /*
   * Reverse raw references:
   * Phone/Vehicle/Address may point to Persons.
   * This also protects discovery when the Person record itself does not
   * contain phone/vehicle/address fields.
   */
  for (const phone of phones) {
    for (const person of persons) {
      if (arrayContains(phone.properties.personIds, person.id)) {
        addEdge(edges, seen, phone, person, 'PHONE_REFERENCE',
          'Phone raw personIds references this Person');
      }
    }
  }

  for (const vehicle of vehicles) {
    for (const person of persons) {
      if (arrayContains(vehicle.properties.personIds, person.id)) {
        addEdge(edges, seen, vehicle, person, 'VEHICLE_REFERENCE',
          'Vehicle raw personIds references this Person');
      }
    }
  }

  for (const address of addresses) {
    for (const person of persons) {
      if (arrayContains(address.properties.personIds, person.id)) {
        addEdge(edges, seen, address, person, 'ADDRESS_REFERENCE',
          'Address raw personIds references this Person');
      }
    }
  }

  return edges;
}

function nodeKey(type, id) {
  return `${normalizeType(type)}:${id}`;
}

function buildNodeMap(data) {
  const map = new Map();

  for (const type of TYPES) {
    for (const item of data[type] || []) {
      map.set(nodeKey(type, item.id), item);
    }
  }

  return map;
}

function makeGraphNode(item, depth = 0) {
  const props = item.properties || {};
  const schema = schemas[item.type];

  return {
    id: item.id,
    key: nodeKey(item.type, item.id),
    type: item.type,
    label: schema ? schema.label : item.type,
    name: getDisplayName(item.type, props),
    depth,
    properties: props
  };
}

function getDisplayName(type, props) {
  switch (type) {
    case 'PERSON':
      return [props.firstName, props.lastName].filter(Boolean).join(' ') || props.personId;
    case 'CASE':
      return props.title || props.caseId;
    case 'PHONE':
      return props.phoneNumber || props.phoneId;
    case 'VEHICLE':
      return props.registrationNumber || props.vehicleId;
    case 'ADDRESS':
      return [props.addressLine, props.city].filter(Boolean).join(', ') || props.addressId;
    case 'LOCATION':
      return [props.name, props.city].filter(Boolean).join(', ') || props.locationId;
    default:
      return props.name || '';
  }
}

function buildTree(data, edges, rootType, rootId, maxDepth = 3, maxNodes = 100) {
  const nodeMap = buildNodeMap(data);
  const rootKey = nodeKey(rootType, rootId);
  const rootItem = nodeMap.get(rootKey);

  if (!rootItem) {
    return {
      root: null,
      nodes: [],
      edges: [],
      maxDepth,
      maxNodes
    };
  }

  const adjacency = new Map();

  for (const edge of edges) {
    const a = nodeKey(edge.sourceType, edge.sourceId);
    const b = nodeKey(edge.targetType, edge.targetId);

    if (!adjacency.has(a)) adjacency.set(a, []);
    if (!adjacency.has(b)) adjacency.set(b, []);

    adjacency.get(a).push(edge);
    adjacency.get(b).push({
      ...edge,
      source: edge.target,
      target: edge.source,
      sourceType: edge.targetType,
      sourceId: edge.targetId,
      targetType: edge.sourceType,
      targetId: edge.sourceId
    });
  }

  const visited = new Set([rootKey]);
  const depthMap = new Map([[rootKey, 0]]);
  const queue = [rootKey];

  const selectedEdges = [];
  const selectedEdgeKeys = new Set();

  while (queue.length && visited.size < maxNodes) {
    const currentKey = queue.shift();
    const currentDepth = depthMap.get(currentKey);

    if (currentDepth >= maxDepth) continue;

    for (const edge of adjacency.get(currentKey) || []) {
      if (visited.size >= maxNodes) break;

      const targetKey = nodeKey(edge.targetType, edge.targetId);

      if (targetKey === currentKey) continue;

      const nextDepth = currentDepth + 1;

      if (!visited.has(targetKey)) {
        visited.add(targetKey);
        depthMap.set(targetKey, nextDepth);
        queue.push(targetKey);
      }

      const edgeKey = [
        edge.sourceType, edge.sourceId,
        edge.targetType, edge.targetId,
        edge.type,
        edge.reason
      ].join('|');

      const reverseKey = [
        edge.targetType, edge.targetId,
        edge.sourceType, edge.sourceId,
        edge.type,
        edge.reason
      ].join('|');

      if (!selectedEdgeKeys.has(edgeKey) && !selectedEdgeKeys.has(reverseKey)) {
        selectedEdgeKeys.add(edgeKey);
        selectedEdges.push(edge);
      }
    }
  }

  const nodes = Array.from(visited)
    .map(key => {
      const item = nodeMap.get(key);
      return item ? makeGraphNode(item, depthMap.get(key)) : null;
    })
    .filter(Boolean);

  return {
    root: makeGraphNode(rootItem, 0),
    nodes,
    edges: selectedEdges,
    maxDepth,
    maxNodes
  };
}

async function discoverRelationships() {
  const data = await loadAllRawNodes();
  return discoverEdges(data);
}

async function discoverForRoot(type, id) {
  const key = normalizeType(type);
  const data = await loadAllRawNodes();

  if (!schemas[key]) {
    throw new Error(`Unsupported entity type: ${key}`);
  }

  const root = (data[key] || []).find(item => item.id === id);

  if (!root) {
    return {
      root: null,
      nodes: [],
      edges: []
    };
  }

  const edges = discoverEdges(data);

  const rootEdges = edges.filter(edge =>
    (edge.sourceType === key && edge.sourceId === id) ||
    (edge.targetType === key && edge.targetId === id)
  );

  const nodeMap = buildNodeMap(data);
  const nodes = new Map();

  nodes.set(nodeKey(key, id), makeGraphNode(root, 0));

  for (const edge of rootEdges) {
    const sourceItem = nodeMap.get(nodeKey(edge.sourceType, edge.sourceId));
    const targetItem = nodeMap.get(nodeKey(edge.targetType, edge.targetId));

    if (sourceItem) nodes.set(nodeKey(edge.sourceType, edge.sourceId), makeGraphNode(sourceItem, 1));
    if (targetItem) nodes.set(nodeKey(edge.targetType, edge.targetId), makeGraphNode(targetItem, 1));
  }

  return {
    root: makeGraphNode(root, 0),
    nodes: Array.from(nodes.values()),
    edges: rootEdges
  };
}

async function getDiscoveryForEntity(type, id) {
  return discoverForRoot(type, id);
}

async function getEntityDetail(type, id) {
  const entity = await getEntity(type, id);

  if (!entity) return null;

  const discovery = await discoverForRoot(type, id);

  return {
    entity,
    discovery
  };
}

async function getGraph(options = {}) {
  const rootType = normalizeType(options.rootType);
  const rootId = cleanValue(options.rootId);

  const maxDepth = Math.max(
    1,
    Math.min(parseInt(options.depth, 10) || 3, 5)
  );

  const maxNodes = Math.max(
    2,
    Math.min(parseInt(options.maxNodes, 10) || 100, 500)
  );

  const data = await loadAllRawNodes();
  const edges = discoverEdges(data);

  if (rootType && rootId) {
    return buildTree(data, edges, rootType, rootId, maxDepth, maxNodes);
  }

  const nodeMap = buildNodeMap(data);

  return {
    root: null,
    nodes: Array.from(nodeMap.values())
      .slice(0, maxNodes)
      .map(item => makeGraphNode(item, 0)),
    edges: edges.slice(0, maxNodes * 3),
    maxDepth,
    maxNodes
  };
}

async function getStats() {
  const session = dbSession();

  try {
    const result = await session.run(`
      CALL {
        MATCH (n:Person)
        RETURN count(n) AS persons
      }
      CALL {
        MATCH (n:Case)
        RETURN count(n) AS cases
      }
      CALL {
        MATCH (n:Vehicle)
        RETURN count(n) AS vehicles
      }
      CALL {
        MATCH (n:Phone)
        RETURN count(n) AS phones
      }
      CALL {
        MATCH (n:Address)
        RETURN count(n) AS addresses
      }
      CALL {
        MATCH (n:Location)
        RETURN count(n) AS locations
      }
      RETURN persons, cases, vehicles, phones, addresses, locations
    `);

    const row = result.records[0];

    return {
      persons: row.get('persons').toNumber(),
      cases: row.get('cases').toNumber(),
      vehicles: row.get('vehicles').toNumber(),
      phones: row.get('phones').toNumber(),
      addresses: row.get('addresses').toNumber(),
      locations: row.get('locations').toNumber()
    };
  } finally {
    await session.close();
  }
}

module.exports = {
  schemas,
  createEntity,
  createCase,
  listEntities,
  getEntity,
  getStats,
  getCaseFormOptions,
  discoverRelationships,
  discoverForRoot,
  getDiscoveryForEntity,
  getEntityDetail,
  getGraph
};
