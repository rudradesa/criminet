const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

function safeText(value, max = 4000) {
  return String(value ?? '').slice(0, max);
}

function compactProperties(properties = {}) {
  const output = {};
  for (const [key, value] of Object.entries(properties)) {
    if (key === 'createdAt') continue;
    if (Array.isArray(value)) output[key] = value.slice(0, 20);
    else output[key] = value;
  }
  return output;
}

function buildPrompt({ source, target, relationship, reason, sourceProperties, targetProperties }) {
  const evidence = {
    source: {
      type: source.type,
      id: source.id,
      name: source.name,
      properties: compactProperties(sourceProperties)
    },
    target: {
      type: target.type,
      id: target.id,
      name: target.name,
      properties: compactProperties(targetProperties)
    },
    discoveredRelationship: relationship,
    discoveryReason: reason
  };

  return `You are an investigation-assistance AI inside a criminal intelligence data system.

Your job is ONLY to explain a relationship that the deterministic backend has already discovered from raw records.
Do NOT discover new relationships.
Do NOT invent facts.
Do NOT infer that a person committed a crime merely because they are associated with another entity.
Do NOT make accusations, guilt claims, or unsupported conclusions.
Treat the relationship as an investigative lead/association, not proof.
Clearly separate observed data from possible investigative significance.

Return ONLY valid JSON with exactly these keys:
{
  "summary": "one or two concise sentences",
  "relationshipExplanation": "explain exactly why the backend considers the two nodes connected",
  "evidence": ["short evidence point 1", "short evidence point 2"],
  "investigativeSignificance": "what an investigator may reasonably examine next, without asserting wrongdoing",
  "limitations": "what this association does not establish"
}

Use only the following backend-supplied evidence:
${safeText(JSON.stringify(evidence, null, 2), 12000)}`;
}

async function explainRelationship(payload) {
  const prompt = buildPrompt(payload);

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${text.slice(0, 500)}`);
  }

  const data = await response.json();
  let parsed;

  try {
    parsed = JSON.parse(data.response || '{}');
  } catch {
    parsed = {
      summary: data.response || 'Ollama returned an unreadable response.',
      relationshipExplanation: '',
      evidence: [],
      investigativeSignificance: '',
      limitations: 'The AI response was not valid JSON.'
    };
  }

  return {
    model: OLLAMA_MODEL,
    ...parsed
  };
}

async function checkOllama() {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
  if (!response.ok) {
    throw new Error(`Ollama is not reachable (${response.status})`);
  }

  const data = await response.json();
  const models = Array.isArray(data.models) ? data.models.map(model => model.name) : [];

  return {
    connected: true,
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL,
    availableModels: models,
    modelAvailable: models.some(name => name === OLLAMA_MODEL || name.startsWith(`${OLLAMA_MODEL}:`))
  };
}

module.exports = {
  explainRelationship,
  checkOllama
};
