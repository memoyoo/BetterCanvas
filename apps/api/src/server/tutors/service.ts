import { randomUUID } from "node:crypto";

import { getPrismaClient } from "@/lib/db";
import {
  getCanvasCourseFiles,
  getCanvasCoursePages,
  getCanvasCoursePageByUrl,
} from "@/server/canvas/client";
import { decryptCanvasToken } from "@/server/canvas/crypto";
import type {
  CanvasCourseFile,
  CanvasCoursePage,
  CanvasCoursePageSummary,
} from "@/server/canvas/types";
import { generateTutorAnswer, generateTutorEmbedding } from "@/server/tutors/llm";

const MAX_CHUNK_CONTENT_LENGTH = 1500;
const MAX_RETRIEVED_CHUNKS = 4;
const MAX_VECTOR_RETRIEVAL_CANDIDATES = 8;
const EMBEDDING_DIMENSION = 768;
const EMBEDDING_CONCURRENCY = 6;
const PAGE_FETCH_CONCURRENCY = 4;
const MAX_FILE_CHUNKS_PER_COURSE = 20;
const MAX_PAGE_CHUNKS_PER_COURSE = 12;

type RetrievedTutorChunk = {
  content: string;
  sourceUrl: string;
  title: string;
};

type TutorChunkCandidate = {
  content: string;
  sourceId: string;
  sourceType: string;
  sourceUrl?: string;
  title: string;
};

type TutorCitation = {
  href: string;
  id: string;
  title: string;
};

type TutorMessageView = {
  citations?: TutorCitation[];
  content: string;
  id: string;
  role: "assistant" | "user";
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function extractKeywords(value: string) {
  const stopWords = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "but",
    "by",
    "for",
    "from",
    "how",
    "i",
    "if",
    "in",
    "is",
    "it",
    "me",
    "my",
    "of",
    "on",
    "or",
    "the",
    "to",
    "what",
    "when",
    "where",
    "with",
    "you",
    "your",
  ]);

  return Array.from(
    new Set(
      normalizeText(value)
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 2 && !stopWords.has(token)),
    ),
  );
}

function trimChunkContent(value: string) {
  const trimmed = value.trim();
  return trimmed.length > MAX_CHUNK_CONTENT_LENGTH
    ? `${trimmed.slice(0, MAX_CHUNK_CONTENT_LENGTH - 1)}...`
    : trimmed;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtml(value: string) {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function htmlToText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return normalizeWhitespace(decodeHtmlEntities(stripHtml(value)));
}

function formatFileSize(value: number | null | undefined) {
  if (!value || value <= 0) {
    return "unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const rounded = unitIndex === 0 ? String(Math.round(size)) : size.toFixed(1);
  return `${rounded} ${units[unitIndex]}`;
}

function getFileDisplayName(file: CanvasCourseFile) {
  return (
    file.display_name?.trim() ||
    file.filename?.trim() ||
    `Canvas file ${String(file.id)}`
  );
}

function getFileContentType(file: CanvasCourseFile) {
  return (
    file.content_type?.trim() ||
    file["content-type"]?.trim() ||
    "unknown type"
  );
}

function sortPageSummaries(pages: CanvasCoursePageSummary[]) {
  return [...pages].sort((left, right) => {
    if (left.front_page && !right.front_page) {
      return -1;
    }

    if (!left.front_page && right.front_page) {
      return 1;
    }

    const leftUpdated = left.updated_at ? Date.parse(left.updated_at) : 0;
    const rightUpdated = right.updated_at ? Date.parse(right.updated_at) : 0;

    return rightUpdated - leftUpdated;
  });
}

function buildFileChunkCandidates(params: {
  courseLabel: string;
  files: CanvasCourseFile[];
}) {
  return params.files.slice(0, MAX_FILE_CHUNKS_PER_COURSE).map((file) => {
    const title = getFileDisplayName(file);
    const contentType = getFileContentType(file);
    const updatedAt = file.updated_at ? new Date(file.updated_at) : null;
    const updatedLabel =
      updatedAt && !Number.isNaN(updatedAt.getTime())
        ? updatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "unknown update time";

    return {
      content: trimChunkContent(
        `${title} is a Canvas course file for ${params.courseLabel}. File type: ${contentType}. Size: ${formatFileSize(file.size)}. Last updated: ${updatedLabel}.`,
      ),
      sourceId: String(file.id),
      sourceType: "course_file",
      sourceUrl: file.html_url?.trim() || file.url?.trim() || undefined,
      title,
    } satisfies TutorChunkCandidate;
  });
}

function buildPageChunkCandidate(params: {
  page: CanvasCoursePage;
  courseLabel: string;
}) {
  const title = params.page.title?.trim() || `Canvas page ${params.page.url}`;
  const pageBody = htmlToText(params.page.body);

  if (!pageBody) {
    return null;
  }

  const pageFlags = [
    params.page.front_page ? "front page" : null,
    params.page.published === false ? "unpublished" : "published",
  ]
    .filter(Boolean)
    .join(", ");
  const updatedAt = params.page.updated_at ? new Date(params.page.updated_at) : null;
  const updatedLabel =
    updatedAt && !Number.isNaN(updatedAt.getTime())
      ? updatedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "unknown update time";

  return {
    content: trimChunkContent(
      `${title} is a Canvas course page for ${params.courseLabel}. Status: ${pageFlags}. Last updated: ${updatedLabel}. ${pageBody}`,
    ),
    sourceId: params.page.url,
    sourceType: "course_page",
    sourceUrl: params.page.html_url?.trim() || undefined,
    title,
  } satisfies TutorChunkCandidate;
}

function dedupeChunkCandidates(chunks: TutorChunkCandidate[]) {
  const seen = new Set<string>();

  return chunks.filter((chunk) => {
    const key = `${chunk.sourceType}:${chunk.sourceId}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
) {
  const results: R[] = Array.from({ length: values.length }) as R[];
  let cursor = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, values.length) },
    async () => {
      while (true) {
        const index = cursor;
        cursor += 1;

        if (index >= values.length) {
          return;
        }

        results[index] = await mapper(values[index], index);
      }
    },
  );

  await Promise.all(workers);

  return results;
}

async function getSupplementalCanvasChunks(params: {
  canvasAccountId: string;
  canvasCourseId: number;
  courseLabel: string;
  userId: string;
}) {
  const prisma = getPrismaClient();
  const account = await prisma.canvasAccount.findFirst({
    where: {
      id: params.canvasAccountId,
      userId: params.userId,
    },
  });

  if (!account) {
    return [] as TutorChunkCandidate[];
  }

  let token: string;

  try {
    token = decryptCanvasToken({
      authTag: account.authTag,
      encryptedToken: account.encryptedToken,
      iv: account.iv,
    });
  } catch {
    return [];
  }

  const [files, pageSummaries] = await Promise.all([
    getCanvasCourseFiles(account.domain, token, params.canvasCourseId).catch(
      () => [] as CanvasCourseFile[],
    ),
    getCanvasCoursePages(account.domain, token, params.canvasCourseId).catch(
      () => [] as CanvasCoursePageSummary[],
    ),
  ]);
  const fileChunks = buildFileChunkCandidates({
    courseLabel: params.courseLabel,
    files,
  });
  const selectedPages = sortPageSummaries(pageSummaries).slice(
    0,
    MAX_PAGE_CHUNKS_PER_COURSE,
  );
  const pageDetails = await mapWithConcurrency(
    selectedPages,
    PAGE_FETCH_CONCURRENCY,
    async (summary) => {
      try {
        return await getCanvasCoursePageByUrl(
          account.domain,
          token,
          params.canvasCourseId,
          summary.url,
        );
      } catch {
        return null;
      }
    },
  );
  const pageChunks = pageDetails
    .map((page) =>
      page
        ? buildPageChunkCandidate({
            courseLabel: params.courseLabel,
            page,
          })
        : null,
    )
    .filter((chunk): chunk is NonNullable<typeof chunk> => Boolean(chunk));

  return dedupeChunkCandidates([...fileChunks, ...pageChunks]);
}

function chunkSourceUrl(courseId: string, sourceType: string, sourceId: string) {
  return `/tutors/${courseId}?source=${sourceType}:${sourceId}`;
}

function buildChunkCandidates(course: {
  assignments: Array<{
    canvasId: number;
    dueAt: Date | null;
    hasSubmitted: boolean;
    name: string;
    pointsPossible: number | null;
    submissionTypes: string[];
  }>;
  courseCode: string | null;
  id: string;
  name: string;
  plannerItems: Array<{
    dueAt: Date | null;
    htmlUrl: string | null;
    plannableId: number;
    plannableType: string;
    title: string;
  }>;
  recentActivity: Array<{
    canvasId: string;
    createdAt: Date;
    message: string | null;
    title: string;
    type: string;
  }>;
}) {
  const courseLabel = course.courseCode?.trim() || course.name;
  const chunks: TutorChunkCandidate[] = [
    {
      content: trimChunkContent(
        `${courseLabel} is a synced Canvas course in BetterCanvas. Use this course context when answering study and planning questions.`,
      ),
      sourceId: course.id,
      sourceType: "course_overview",
      title: `${courseLabel} overview`,
    },
  ];

  for (const assignment of course.assignments) {
    const dueLabel = assignment.dueAt
      ? assignment.dueAt.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "No due date";

    chunks.push({
      content: trimChunkContent(
        `${assignment.name} is a synced assignment for ${courseLabel}. Due: ${dueLabel}. Points possible: ${assignment.pointsPossible ?? "unknown"}. Submission types: ${assignment.submissionTypes.join(", ") || "not specified"}. Submission state: ${assignment.hasSubmitted ? "submitted or excused" : "not submitted yet"}.`,
      ),
      sourceId: String(assignment.canvasId),
      sourceType: "assignment",
      title: assignment.name,
    });
  }

  for (const item of course.plannerItems) {
    const dueLabel = item.dueAt
      ? item.dueAt.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "No due date";

    chunks.push({
      content: trimChunkContent(
        `${item.title} is a planner item in ${courseLabel}. Type: ${item.plannableType.replace(/_/g, " ")}. Due: ${dueLabel}.`,
      ),
      sourceId: `${item.plannableType}:${item.plannableId}`,
      sourceType: "planner_item",
      title: item.title,
    });
  }

  for (const item of course.recentActivity) {
    chunks.push({
      content: trimChunkContent(
        `${item.title} is a recent synced Canvas activity for ${courseLabel}. Type: ${item.type}. Details: ${item.message?.trim() || "No additional activity detail was provided."}`,
      ),
      sourceId: item.canvasId,
      sourceType: "activity_item",
      title: item.title,
    });
  }

  return chunks;
}

function mergeChunkCandidates(
  baseChunks: TutorChunkCandidate[],
  supplementalChunks: TutorChunkCandidate[],
) {
  return dedupeChunkCandidates([...baseChunks, ...supplementalChunks]);
}

function countKeywordHits(content: string, keywords: string[]) {
  if (keywords.length === 0) {
    return 0;
  }

  const haystack = normalizeText(content);
  let score = 0;

  for (const keyword of keywords) {
    if (haystack.includes(keyword)) {
      score += 1;
    }
  }

  return score;
}

function toPgVectorLiteral(values: number[]) {
  return `[${values.join(",")}]`;
}

function dedupeRetrievedChunks(chunks: RetrievedTutorChunk[]) {
  const seen = new Set<string>();

  return chunks.filter((chunk) => {
    const key = `${chunk.title}::${chunk.sourceUrl}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function retrieveChunksByVector(params: {
  courseId: string;
  embedding: number[];
}) {
  const prisma = getPrismaClient();
  const vectorLiteral = toPgVectorLiteral(params.embedding);
  const rows = await prisma.$queryRaw<Array<{ content: string; sourceUrl: string; title: string }>>`
    SELECT
      "content",
      "sourceUrl",
      "title"
    FROM "CourseChunk"
    WHERE "courseId" = ${params.courseId}
      AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> CAST(${vectorLiteral} AS vector)
    LIMIT ${MAX_VECTOR_RETRIEVAL_CANDIDATES}
  `;

  return rows
    .map((row) => ({
      content: row.content,
      sourceUrl: row.sourceUrl,
      title: row.title,
    }))
    .slice(0, MAX_RETRIEVED_CHUNKS);
}

async function retrieveChunksByKeyword(params: {
  courseId: string;
  question: string;
}) {
  const keywords = extractKeywords(params.question);
  const chunks = await getPrismaClient().courseChunk.findMany({
    where: {
      courseId: params.courseId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return chunks
    .map((chunk) => ({
      content: chunk.content,
      hitCount: countKeywordHits(`${chunk.title} ${chunk.content}`, keywords),
      sourceUrl: chunk.sourceUrl,
      title: chunk.title,
    }))
    .sort((left, right) => right.hitCount - left.hitCount)
    .slice(0, MAX_RETRIEVED_CHUNKS)
    .filter((chunk, index, array) => chunk.hitCount > 0 || index < Math.min(2, array.length))
    .map((chunk) => ({
      content: chunk.content,
      sourceUrl: chunk.sourceUrl,
      title: chunk.title,
    }));
}

async function retrieveTutorChunks(params: {
  courseId: string;
  question: string;
}) {
  const queryEmbedding = await generateTutorEmbedding(params.question).catch(() => null);
  const vectorChunks = queryEmbedding?.length
    ? await retrieveChunksByVector({
        courseId: params.courseId,
        embedding: queryEmbedding,
      }).catch(() => [])
    : [];

  if (vectorChunks.length >= MAX_RETRIEVED_CHUNKS) {
    return vectorChunks;
  }

  const keywordChunks = await retrieveChunksByKeyword(params);

  return dedupeRetrievedChunks([...vectorChunks, ...keywordChunks]).slice(
    0,
    MAX_RETRIEVED_CHUNKS,
  );
}

async function buildTutorReply(params: {
  courseName: string;
  question: string;
  retrievedChunks: RetrievedTutorChunk[];
}) {
  const citations = params.retrievedChunks.map((chunk, index) => ({
    href: chunk.sourceUrl,
    id: String(index + 1),
    title: chunk.title,
  }));

  if (params.retrievedChunks.length === 0) {
    return {
      citations,
      content: `I could not find strong grounded context for that question in the current ${params.courseName} sync yet. Try asking about a synced assignment, planner item, or recent course activity after refreshing the course context.`,
    };
  }

  try {
    const llmResponse = await generateTutorAnswer({
      chunks: params.retrievedChunks.map((chunk, index) => ({
        citationId: String(index + 1),
        content: chunk.content,
        title: chunk.title,
      })),
      courseName: params.courseName,
      question: params.question,
    });

    if (llmResponse) {
      return {
        citations,
        content: llmResponse,
      };
    }
  } catch {}

  const supportingNotes = params.retrievedChunks.map((chunk, index) => {
    const citationId = index + 1;
    return `- ${chunk.content} [${citationId}]`;
  });

  return {
    citations,
    content: `Here is the best grounded answer I can give from the current ${params.courseName} sync.\n\n${supportingNotes.join("\n")}\n\nQuestion focus: ${params.question}\n\nUse the cited synced course context above as the source of truth, and refresh course ingestion if you need more detailed tutor coverage.`,
  };
}

async function buildChunkEmbedding(content: string) {
  const embedding = await generateTutorEmbedding(content).catch(() => null);

  return embedding && embedding.length === EMBEDDING_DIMENSION
    ? toPgVectorLiteral(embedding)
    : null;
}

async function buildChunkEmbeddings(
  chunks: Array<{ content: string }>,
) {
  const embeddings: Array<string | null> = Array.from(
    { length: chunks.length },
    () => null,
  );
  let cursor = 0;

  const workers = Array.from(
    { length: Math.min(EMBEDDING_CONCURRENCY, chunks.length) },
    async () => {
      while (true) {
        const index = cursor;
        cursor += 1;

        if (index >= chunks.length) {
          return;
        }

        embeddings[index] = await buildChunkEmbedding(chunks[index].content);
      }
    },
  );

  await Promise.all(workers);

  return embeddings;
}

export async function ingestTutorCourseContext(userId: string, courseId: string) {
  const prisma = getPrismaClient();
  const course = await prisma.course.findFirst({
    where: {
      canvasAccount: {
        userId,
      },
      id: courseId,
    },
  });

  if (!course) {
    return null;
  }

  const [assignments, plannerItems, recentActivity] = await Promise.all([
    prisma.assignment.findMany({
      where: {
        courseId: course.id,
      },
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      take: 20,
    }),
    prisma.plannerItem.findMany({
      where: {
        canvasAccountId: course.canvasAccountId,
        completed: false,
        courseCanvasId: course.canvasId,
      },
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      take: 20,
    }),
    prisma.activityItem.findMany({
      where: {
        canvasAccountId: course.canvasAccountId,
        courseId: course.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),
  ]);

  const chunkCandidates = buildChunkCandidates({
    assignments,
    courseCode: course.courseCode,
    id: course.id,
    name: course.name,
    plannerItems,
    recentActivity,
  });
  const supplementalChunks = await getSupplementalCanvasChunks({
    canvasAccountId: course.canvasAccountId,
    canvasCourseId: course.canvasId,
    courseLabel: course.courseCode?.trim() || course.name,
    userId,
  });
  const mergedCandidates = mergeChunkCandidates(chunkCandidates, supplementalChunks);
  const chunkEmbeddings = await buildChunkEmbeddings(mergedCandidates);

  await prisma.$transaction(async (tx) => {
    await tx.courseChunk.deleteMany({
      where: {
        courseId: course.id,
      },
    });

    for (const [index, chunk] of mergedCandidates.entries()) {
      const chunkId = randomUUID();
      const sourceUrl = chunk.sourceUrl ?? chunkSourceUrl(course.id, chunk.sourceType, chunk.sourceId);
      const embedding = chunkEmbeddings[index];

      if (embedding) {
        await tx.$executeRaw`
          INSERT INTO "CourseChunk" (
            "id",
            "courseId",
            "sourceType",
            "sourceId",
            "sourceUrl",
            "title",
            "content",
            "tokenCount",
            "restricted",
            "embedding",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${chunkId},
            ${course.id},
            ${chunk.sourceType},
            ${chunk.sourceId},
            ${sourceUrl},
            ${chunk.title},
            ${chunk.content},
            ${Math.ceil(chunk.content.split(/\s+/).length * 1.35)},
            false,
            CAST(${embedding} AS vector),
            NOW(),
            NOW()
          )
        `;
      } else {
        await tx.$executeRaw`
          INSERT INTO "CourseChunk" (
            "id",
            "courseId",
            "sourceType",
            "sourceId",
            "sourceUrl",
            "title",
            "content",
            "tokenCount",
            "restricted",
            "embedding",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${chunkId},
            ${course.id},
            ${chunk.sourceType},
            ${chunk.sourceId},
            ${sourceUrl},
            ${chunk.title},
            ${chunk.content},
            ${Math.ceil(chunk.content.split(/\s+/).length * 1.35)},
            false,
            NULL,
            NOW(),
            NOW()
          )
        `;
      }
    }
  });

  return {
    chunkCount: mergedCandidates.length,
    courseId: course.id,
    courseName: course.name,
  };
}

export async function ensureTutorCourseContext(userId: string, courseId: string) {
  const prisma = getPrismaClient();
  const existingChunkCount = await prisma.courseChunk.count({
    where: {
      course: {
        canvasAccount: {
          userId,
        },
      },
      courseId,
    },
  });

  if (existingChunkCount > 0) {
    return existingChunkCount;
  }

  const result = await ingestTutorCourseContext(userId, courseId);
  return result?.chunkCount ?? 0;
}

export async function createTutorThread(params: {
  courseId: string;
  title?: string;
  userId: string;
}) {
  const prisma = getPrismaClient();
  const course = await prisma.course.findFirst({
    where: {
      canvasAccount: {
        userId: params.userId,
      },
      id: params.courseId,
    },
  });

  if (!course) {
    return null;
  }

  return prisma.tutorThread.create({
    data: {
      courseId: course.id,
      title: params.title?.trim() || `${course.name} study thread`,
      userId: params.userId,
    },
  });
}

export async function submitTutorQuestion(params: {
  courseId: string;
  question: string;
  threadId?: string | null;
  userId: string;
}) {
  const prisma = getPrismaClient();
  const trimmedQuestion = params.question.trim();

  if (!trimmedQuestion) {
    throw new Error("Ask a question before sending a tutor message.");
  }

  const course = await prisma.course.findFirst({
    where: {
      canvasAccount: {
        userId: params.userId,
      },
      id: params.courseId,
    },
  });

  if (!course) {
    throw new Error("That course could not be found for the current user.");
  }

  await ensureTutorCourseContext(params.userId, params.courseId);

  const thread = params.threadId
    ? await prisma.tutorThread.findFirst({
        where: {
          courseId: params.courseId,
          id: params.threadId,
          userId: params.userId,
        },
      })
    : null;
  const activeThread =
    thread ??
    (await prisma.tutorThread.create({
      data: {
        courseId: params.courseId,
        title: trimmedQuestion.slice(0, 80),
        userId: params.userId,
      },
    }));

  const retrievedChunks = await retrieveTutorChunks({
    courseId: params.courseId,
    question: trimmedQuestion,
  });
  const reply = await buildTutorReply({
    courseName: course.name,
    question: trimmedQuestion,
    retrievedChunks,
  });

  await prisma.$transaction(async (tx) => {
    await tx.tutorMessage.create({
      data: {
        content: trimmedQuestion,
        role: "user",
        threadId: activeThread.id,
      },
    });

    await tx.tutorMessage.create({
      data: {
        citations: reply.citations,
        content: reply.content,
        role: "assistant",
        threadId: activeThread.id,
      },
    });
  });

  return {
    threadId: activeThread.id,
  };
}

export async function getTutorCourseView(userId: string, courseId: string) {
  const prisma = getPrismaClient();
  const course = await prisma.course.findFirst({
    where: {
      canvasAccount: {
        userId,
      },
      id: courseId,
    },
    include: {
      chunks: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
      tutorThreads: {
        where: {
          userId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!course) {
    return null;
  }

  const activeThread = course.tutorThreads[0] ?? null;

  return {
    activeThreadId: activeThread?.id ?? null,
    chunkCount: course.chunks.length,
    course,
    messages: (activeThread?.messages ?? []).map((message): TutorMessageView => ({
      citations: Array.isArray(message.citations)
        ? (message.citations as TutorCitation[])
        : undefined,
      content: message.content,
      id: message.id,
      role: message.role === "assistant" ? "assistant" : "user",
    })),
  };
}
