// Run in Neo4j Browser on database: criminalintelligence
// 1) Remove old Phase 3 manually-created relationships.
MATCH ()-[r]->() DELETE r;

// 2) IMPORTANT: The application now stores raw references as properties and
// discovers relationships at runtime. It does NOT CREATE Neo4j relationships.
// Existing nodes are safe; rerun only if you want to remove old demo nodes.
