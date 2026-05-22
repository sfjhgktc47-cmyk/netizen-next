import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { getSupportTopic, supportTopics } from "@/lib/support-topics";

export type SupportStatus = "NEW" | "IN_PROGRESS" | "WAITING_CLIENT" | "CLOSED";
export type SupportMessageRole = "CLIENT" | "MANAGER";

export type SupportMessage = {
  id: string;
  role: SupportMessageRole;
  name: string;
  text: string;
  createdAt: string;
};

export type SupportRequest = {
  id: string;
  number: string;
  topicId: string;
  topicTitle: string;
  customerName: string;
  phone: string;
  email: string;
  source: "Сайт" | "Личный кабинет" | "Админка" | "Telegram";
  status: SupportStatus;
  assignedTo: string;
  lastMessage: string;
  unreadForManager: number;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

type SupportDb = {
  lastNumber: number;
  requests: SupportRequest[];
};

const dataDirectory = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDirectory, "support-requests.json");

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "msg") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function ensureStore() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    const initialDb: SupportDb = {
      lastNumber: 200,
      requests: [],
    };
    await fs.writeFile(dataFile, JSON.stringify(initialDb, null, 2), "utf8");
  }
}

async function readDb(): Promise<SupportDb> {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as SupportDb;
    return {
      lastNumber: typeof parsed.lastNumber === "number" ? parsed.lastNumber : 200,
      requests: Array.isArray(parsed.requests) ? parsed.requests : [],
    };
  } catch {
    return { lastNumber: 200, requests: [] };
  }
}

async function writeDb(db: SupportDb) {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2), "utf8");
}

export function formatSupportDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getSupportStatusLabel(status: SupportStatus) {
  const labels: Record<SupportStatus, string> = {
    NEW: "Новое",
    IN_PROGRESS: "В работе",
    WAITING_CLIENT: "Ожидает клиента",
    CLOSED: "Закрыто",
  };

  return labels[status] ?? status;
}

export async function listSupportRequests() {
  const db = await readDb();
  return [...db.requests].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
  );
}

export async function listSupportTopicsWithCounts() {
  const requests = await listSupportRequests();

  return [
    {
      id: "all",
      title: "Все",
      count: requests.length,
      unread: requests.reduce((sum, request) => sum + request.unreadForManager, 0),
    },
    ...supportTopics.map((topic) => {
      const topicRequests = requests.filter((request) => request.topicId === topic.id);
      return {
        id: topic.id,
        title: topic.shortTitle,
        count: topicRequests.length,
        unread: topicRequests.reduce((sum, request) => sum + request.unreadForManager, 0),
      };
    }),
  ];
}

export async function getSupportRequest(idOrNumber: string) {
  const requests = await listSupportRequests();
  return requests.find((request) => request.id === idOrNumber || request.number === idOrNumber) ?? null;
}

export async function createSupportRequest(input: {
  topicId: string;
  message: string;
  customerName?: string;
  phone?: string;
  email?: string;
  source?: SupportRequest["source"];
}) {
  const db = await readDb();
  const topic = getSupportTopic(input.topicId);
  const createdAt = nowIso();
  const nextNumber = db.lastNumber + 1;
  const request: SupportRequest = {
    id: makeId("sup"),
    number: `SUP-${nextNumber}`,
    topicId: topic.id,
    topicTitle: topic.title,
    customerName: input.customerName?.trim() || "Гость Нетизен",
    phone: input.phone?.trim() || "Не указан",
    email: input.email?.trim() || "Не указан",
    source: input.source ?? "Сайт",
    status: "NEW",
    assignedTo: "Не назначен",
    lastMessage: input.message.trim(),
    unreadForManager: 1,
    createdAt,
    updatedAt: createdAt,
    messages: [
      {
        id: makeId("msg"),
        role: "CLIENT",
        name: input.customerName?.trim() || "Клиент",
        text: input.message.trim(),
        createdAt,
      },
    ],
  };

  db.lastNumber = nextNumber;
  db.requests.unshift(request);
  await writeDb(db);
  return request;
}

export async function addSupportMessage(
  idOrNumber: string,
  input: {
    text: string;
    role: SupportMessageRole;
    name?: string;
  },
) {
  const db = await readDb();
  const index = db.requests.findIndex(
    (request) => request.id === idOrNumber || request.number === idOrNumber,
  );

  if (index < 0) {
    return null;
  }

  const request = db.requests[index];
  const createdAt = nowIso();
  const message: SupportMessage = {
    id: makeId("msg"),
    role: input.role,
    name: input.name?.trim() || (input.role === "MANAGER" ? "Менеджер Нетизен" : "Клиент"),
    text: input.text.trim(),
    createdAt,
  };

  const nextRequest: SupportRequest = {
    ...request,
    status: input.role === "MANAGER" && request.status === "NEW" ? "IN_PROGRESS" : request.status,
    assignedTo:
      input.role === "MANAGER" && request.assignedTo === "Не назначен"
        ? message.name
        : request.assignedTo,
    lastMessage: message.text,
    unreadForManager:
      input.role === "CLIENT" ? request.unreadForManager + 1 : 0,
    updatedAt: createdAt,
    messages: [...request.messages, message],
  };

  db.requests[index] = nextRequest;
  await writeDb(db);
  return nextRequest;
}

export async function updateSupportRequest(
  idOrNumber: string,
  input: Partial<Pick<SupportRequest, "status" | "assignedTo" | "topicId">>,
) {
  const db = await readDb();
  const index = db.requests.findIndex(
    (request) => request.id === idOrNumber || request.number === idOrNumber,
  );

  if (index < 0) {
    return null;
  }

  const current = db.requests[index];
  const topic = input.topicId ? getSupportTopic(input.topicId) : null;
  const nextRequest: SupportRequest = {
    ...current,
    status: input.status ?? current.status,
    assignedTo: input.assignedTo?.trim() || current.assignedTo,
    topicId: topic?.id ?? current.topicId,
    topicTitle: topic?.title ?? current.topicTitle,
    unreadForManager: input.status ? 0 : current.unreadForManager,
    updatedAt: nowIso(),
  };

  db.requests[index] = nextRequest;
  await writeDb(db);
  return nextRequest;
}
