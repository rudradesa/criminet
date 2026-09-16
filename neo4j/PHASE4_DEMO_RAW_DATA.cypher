// PHASE 4 DEMO DATA REPAIR
// Purpose: make the existing DEMO-* records internally correlated using
// raw properties only. THIS SCRIPT CREATES ZERO NEO4J RELATIONSHIPS.
// Run directly in Neo4j Browser.

// 1) Remove old Phase 3 relationships so the database is clean.
MATCH ()-[r]->()
DELETE r;

// 2) Give every demo Person a raw phone/vehicle/address identity.
// DEMO-P-1..120 are mapped cyclically to DEMO-PH/V/A-1..60.
MATCH (p:Person)
WHERE p.personId STARTS WITH 'DEMO-P-'
  AND toInteger(replace(p.personId, 'DEMO-P-', '')) IS NOT NULL
WITH p, toInteger(replace(p.personId, 'DEMO-P-', '')) AS personNumber
WITH p, ((personNumber - 1) % 60) + 1 AS n
MATCH (ph:Phone {phoneId: 'DEMO-PH-' + toString(n)})
MATCH (v:Vehicle {vehicleId: 'DEMO-V-' + toString(n)})
MATCH (a:Address {addressId: 'DEMO-A-' + toString(n)})
SET p.phoneNumber = ph.phoneNumber,
    p.vehicleRegistrationNumber = v.registrationNumber,
    p.addressLine = a.addressLine,
    p.city = a.city,
    p.state = a.state
RETURN count(p) AS personsRepaired;

// 3) Store the same Person IDs as RAW PROPERTIES on Phone, Vehicle and Address.
// This gives the discovery engine a second direction for correlation.
MATCH (ph:Phone)
WHERE ph.phoneId STARTS WITH 'DEMO-PH-'
  AND toInteger(replace(ph.phoneId, 'DEMO-PH-', '')) IS NOT NULL
WITH ph, toInteger(replace(ph.phoneId, 'DEMO-PH-', '')) AS n
MATCH (p:Person {personId: 'DEMO-P-' + toString(n)})
SET ph.personIds = [p.personId]
RETURN count(ph) AS phonesRepaired;

MATCH (v:Vehicle)
WHERE v.vehicleId STARTS WITH 'DEMO-V-'
  AND toInteger(replace(v.vehicleId, 'DEMO-V-', '')) IS NOT NULL
WITH v, toInteger(replace(v.vehicleId, 'DEMO-V-', '')) AS n
MATCH (p:Person {personId: 'DEMO-P-' + toString(n)})
SET v.personIds = [p.personId]
RETURN count(v) AS vehiclesRepaired;

MATCH (a:Address)
WHERE a.addressId STARTS WITH 'DEMO-A-'
  AND toInteger(replace(a.addressId, 'DEMO-A-', '')) IS NOT NULL
WITH a, toInteger(replace(a.addressId, 'DEMO-A-', '')) AS n
MATCH (p:Person {personId: 'DEMO-P-' + toString(n)})
SET a.personIds = [p.personId]
RETURN count(a) AS addressesRepaired;

// 4) Add raw case references. Each demo case references four demo persons,
// four corresponding phones/vehicles, and one demo location.
MATCH (c:Case)
WHERE c.caseId STARTS WITH 'DEMO-C-'
  AND toInteger(replace(c.caseId, 'DEMO-C-', '')) IS NOT NULL
WITH c, toInteger(replace(c.caseId, 'DEMO-C-', '')) AS n
WITH c,
     [n, n + 30, n + 60, n + 90] AS personNumbers,
     ((n - 1) % 60) + 1 AS assetNumber,
     ((n - 1) % 30) + 1 AS locationNumber
WITH c,
     [x IN personNumbers | 'DEMO-P-' + toString(x)] AS personIds,
     ['DEMO-PH-' + toString(assetNumber)] AS phoneIds,
     ['DEMO-V-' + toString(assetNumber)] AS vehicleIds,
     ['DEMO-L-' + toString(locationNumber)] AS locationIds
SET c.personIds = personIds,
    c.phoneIds = phoneIds,
    c.vehicleIds = vehicleIds,
    c.locationIds = locationIds
RETURN count(c) AS casesRepaired;

// 5) Verify that no Neo4j relationships remain.
MATCH ()-[r]->()
RETURN count(r) AS neo4jRelationships;

// 6) Verify one complete demo chain as RAW DATA.
MATCH (p:Person {personId: 'DEMO-P-1'})
MATCH (ph:Phone {phoneId: 'DEMO-PH-1'})
MATCH (v:Vehicle {vehicleId: 'DEMO-V-1'})
MATCH (a:Address {addressId: 'DEMO-A-1'})
RETURN properties(p) AS person,
       properties(ph) AS phone,
       properties(v) AS vehicle,
       properties(a) AS address;
