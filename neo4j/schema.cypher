// Run this in Neo4j Browser against the database configured in .env.
// Phase 1 + 2: constraints and indexes only. No relationships are created yet.

CREATE CONSTRAINT person_id_unique IF NOT EXISTS
FOR (n:Person) REQUIRE n.personId IS UNIQUE;

CREATE CONSTRAINT case_id_unique IF NOT EXISTS
FOR (n:Case) REQUIRE n.caseId IS UNIQUE;

CREATE CONSTRAINT vehicle_id_unique IF NOT EXISTS
FOR (n:Vehicle) REQUIRE n.vehicleId IS UNIQUE;

CREATE CONSTRAINT phone_id_unique IF NOT EXISTS
FOR (n:Phone) REQUIRE n.phoneId IS UNIQUE;

CREATE CONSTRAINT address_id_unique IF NOT EXISTS
FOR (n:Address) REQUIRE n.addressId IS UNIQUE;

CREATE CONSTRAINT location_id_unique IF NOT EXISTS
FOR (n:Location) REQUIRE n.locationId IS UNIQUE;

CREATE INDEX person_name_index IF NOT EXISTS
FOR (n:Person) ON (n.firstName, n.lastName);

CREATE INDEX vehicle_registration_index IF NOT EXISTS
FOR (n:Vehicle) ON (n.registrationNumber);

CREATE INDEX phone_number_index IF NOT EXISTS
FOR (n:Phone) ON (n.phoneNumber);

CREATE INDEX address_city_index IF NOT EXISTS
FOR (n:Address) ON (n.city);

CREATE INDEX location_city_index IF NOT EXISTS
FOR (n:Location) ON (n.city);
