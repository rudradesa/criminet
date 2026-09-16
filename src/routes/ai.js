const express = require('express');

const {
  getEntity,
  getGraph
} = require('../services/entityService');

const {
  explainRelationship,
  checkOllama
} = require('../services/ollamaService');

const router = express.Router();


/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

function normalizeType(type) {
  return String(type || '')
    .trim()
    .toUpperCase();
}


function normalizeId(id) {
  return String(id || '')
    .trim();
}


function makeKey(type, id) {
  return `${normalizeType(type)}:${normalizeId(id)}`;
}


function edgeMatches(
  edge,
  source,
  target,
  relationship
) {

  if (!edge) {
    return false;
  }


  const sourceKey =
    makeKey(source.type, source.id);

  const targetKey =
    makeKey(target.type, target.id);


  const edgeSource =
    String(edge.source || '').trim();

  const edgeTarget =
    String(edge.target || '').trim();


  const edgeType =
    String(edge.type || '')
      .trim()
      .toUpperCase();


  const requestedType =
    String(relationship || '')
      .trim()
      .toUpperCase();


  /*
   * Relationship type must match.
   */

  if (edgeType !== requestedType) {
    return false;
  }


  /*
   * Forward direction.
   */

  const forward =
    edgeSource === sourceKey &&
    edgeTarget === targetKey;


  /*
   * Reverse direction.
   */

  const reverse =
    edgeSource === targetKey &&
    edgeTarget === sourceKey;


  return forward || reverse;
}


/*
|--------------------------------------------------------------------------
| GET /api/ai/health
|--------------------------------------------------------------------------
*/

router.get('/health', async (req, res) => {

  try {

    const data =
      await checkOllama();


    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(
      'AI health check error:',
      error
    );


    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});


/*
|--------------------------------------------------------------------------
| POST /api/ai/explain
|--------------------------------------------------------------------------
|
| Body:
|
| {
|   "source": {
|     "type": "PERSON",
|     "id": "DEMO-P-1"
|   },
|   "target": {
|     "type": "PHONE",
|     "id": "DEMO-PH-1"
|   },
|   "relationship": "PHONE_MATCH"
| }
|
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The deterministic graph engine discovers relationships.
|
| Ollama ONLY explains an already discovered relationship.
|
|--------------------------------------------------------------------------
*/

router.post('/explain', async (req, res) => {

  try {

    const {
      source,
      target,
      relationship
    } = req.body || {};


    /*
     * Validate source.
     */

    if (
      !source?.type ||
      !source?.id
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Source entity type and id are required.'
      });

    }


    /*
     * Validate target.
     */

    if (
      !target?.type ||
      !target?.id
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Target entity type and id are required.'
      });

    }


    /*
     * Validate relationship.
     */

    if (!relationship) {

      return res.status(400).json({
        success: false,
        message:
          'Relationship type is required.'
      });

    }


    /*
     * Normalize input.
     */

    const sourceType =
      normalizeType(source.type);

    const sourceId =
      normalizeId(source.id);

    const targetType =
      normalizeType(target.type);

    const targetId =
      normalizeId(target.id);

    const relationshipType =
      String(relationship)
        .trim()
        .toUpperCase();


    /*
     * Load source entity.
     */

    const sourceEntity =
      await getEntity(
        sourceType,
        sourceId
      );


    if (!sourceEntity) {

      return res.status(404).json({
        success: false,
        message:
          `Source entity not found: ${sourceType}:${sourceId}`
      });

    }


    /*
     * Load target entity.
     */

    const targetEntity =
      await getEntity(
        targetType,
        targetId
      );


    if (!targetEntity) {

      return res.status(404).json({
        success: false,
        message:
          `Target entity not found: ${targetType}:${targetId}`
      });

    }


    /*
     |--------------------------------------------------------------------------
     | IMPORTANT
     |--------------------------------------------------------------------------
     |
     | Use the SAME deterministic graph engine
     | that powers the investigation graph.
     |
     */

    const graph =
      await getGraph({
        rootType: sourceType,
        rootId: sourceId,
        depth: 2,
        maxNodes: 100
      });


    const edges =
      Array.isArray(graph?.edges)
        ? graph.edges
        : [];


    /*
     * Find the exact verified edge.
     */

    const matchedEdge =
      edges.find(edge =>
        edgeMatches(
          edge,

          {
            type: sourceType,
            id: sourceId
          },

          {
            type: targetType,
            id: targetId
          },

          relationshipType
        )
      );


    /*
     * Relationship does not exist
     * according to deterministic engine.
     */

    if (!matchedEdge) {

      return res.status(400).json({

        success: false,

        message:
          'No deterministic discovered association exists between these two entities.',

        details: {

          source:
            `${sourceType}:${sourceId}`,

          target:
            `${targetType}:${targetId}`,

          relationship:
            relationshipType,

          checkedEdges:
            edges.length

        }

      });

    }


    /*
     |--------------------------------------------------------------------------
     | SEND ONLY VERIFIED DATA TO OLLAMA
     |--------------------------------------------------------------------------
     */

    const ai =
      await explainRelationship({

        source: {

          type:
            sourceType,

          id:
            sourceId,

          properties:
            sourceEntity.properties ||
            sourceEntity

        },

        target: {

          type:
            targetType,

          id:
            targetId,

          properties:
            targetEntity.properties ||
            targetEntity

        },

        relationship:
          relationshipType,

        reason:
          matchedEdge.reason || '',

        edge:
          matchedEdge

      });


    /*
     |--------------------------------------------------------------------------
     | RESPONSE
     |--------------------------------------------------------------------------
     */

    return res.json({

      success: true,

      data: {

        source: {

          type:
            sourceType,

          id:
            sourceId

        },

        target: {

          type:
            targetType,

          id:
            targetId

        },

        relationship:
          relationshipType,

        reason:
          matchedEdge.reason || '',

        strength:
          matchedEdge.strength ?? null,

        ai

      }

    });

  } catch (error) {

    console.error(
      'AI explanation error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

});


/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

module.exports = router;