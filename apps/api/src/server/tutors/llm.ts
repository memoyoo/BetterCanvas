import "server-only";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash-lite";
const DEFAULT_GEMINI_EMBEDDING_MODEL = "text-embedding-004";
const LLM_REQUEST_TIMEOUT_MS = 15_000;

type TutorLlmInput = {
  chunks: Array<{
    citationId: string;
    content: string;
    title: string;
  }>;
  courseName: string;
  question: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: unknown;
      }>;
    };
  }>;
};

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: unknown;
  };
};

function getGeminiModel() {
  const configured = process.env.GEMINI_MODEL?.trim();

  return configured || DEFAULT_GEMINI_MODEL;
}

function getGeminiEmbeddingModel() {
  const configured = process.env.GEMINI_EMBEDDING_MODEL?.trim();

  return configured || DEFAULT_GEMINI_EMBEDDING_MODEL;
}

function canUseTutorLlm() {
  if (process.env.NODE_ENV === "test") {
    return false;
  }

  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function normalizeEmbedding(values: unknown) {
  if (!Array.isArray(values)) {
    return null;
  }

  const numbers = values
    .map((value) => (typeof value === "number" ? value : Number.NaN))
    .filter((value) => Number.isFinite(value));

  return numbers.length > 0 ? numbers : null;
}

function extractGeminiText(response: GeminiResponse) {
  const parts = response.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  const text = parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .join("\n")
    .trim();

  return text || null;
}

function buildTutorPrompt(input: TutorLlmInput) {
  const context = input.chunks
    .map(
      (chunk) =>
        `[${chunk.citationId}] ${chunk.title}\n${chunk.content.replace(/\s+/g, " ").trim()}`,
    )
    .join("\n\n");

  return [
    "You are BetterCanvas Tutor, a concise academic assistant.",
    `Course: ${input.courseName}`,
    "Answer using only the grounded context below.",
    "If context is insufficient, say what is missing instead of making up facts.",
    "Include source citations like [1], [2] that map to the provided context.",
    "Keep the response under 220 words.",
    "",
    `Question: ${input.question}`,
    "",
    "Grounded context:",
    context,
  ].join("\n");
}

export async function generateTutorAnswer(input: TutorLlmInput) {
  if (!canUseTutorLlm()) {
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, LLM_REQUEST_TIMEOUT_MS);

  try {
    const model = getGeminiModel();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: buildTutorPrompt(input),
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 700,
            temperature: 0.2,
          },
        }),
        signal: controller.signal,
      },
    );
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}.`);
    }

    const payload = text ? (JSON.parse(text) as GeminiResponse) : {};
    return extractGeminiText(payload);
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateTutorEmbedding(content: string) {
  if (!canUseTutorLlm()) {
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (!normalizedContent) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, LLM_REQUEST_TIMEOUT_MS);

  try {
    const model = getGeminiEmbeddingModel();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text: normalizedContent }],
            role: "user",
          },
        }),
        signal: controller.signal,
      },
    );
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Gemini embedding request failed with status ${response.status}.`);
    }

    const payload = text ? (JSON.parse(text) as GeminiEmbeddingResponse) : {};
    return normalizeEmbedding(payload.embedding?.values);
  } finally {
    clearTimeout(timeout);
  }
}
