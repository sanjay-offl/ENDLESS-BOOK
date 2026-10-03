export interface Chapter {
  id: string;
  number: number;
  title: string;
  founderId: string;
  founderName: string;
  founderCity: string;
  pageCount: number;
  isOpen: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Memory {
  id: string;
  chapterId: string;
  pageNum: number;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorCity: string;
  imageUrl?: string | null;
  tags: string[];
  createdAt: number;
}

export interface NewChapter {
  title: string;
  tags?: string[];
}

export interface NewMemory {
  chapterId: string;
  title: string;
  body: string;
  authorCity: string;
  imageUrl?: string | null;
  tags?: string[];
}

export interface ChapterDetail {
  chapter: Chapter;
  memories: Memory[];
}

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// Fallback seed data if the backend is not yet started or running offline
const fallbackChapters: Chapter[] = [
  {
    id: "chapter-1",
    number: 1,
    title: "The Summer The Streetlights Never Came On",
    founderId: "user-1",
    founderName: "Elena Vance",
    founderCity: "Port Townsend, WA",
    pageCount: 3,
    isOpen: false,
    tags: ["Summer", "Storms", "1994"],
    createdAt: 1717200000000,
    updatedAt: 1717250000000,
  },
  {
    id: "chapter-2",
    number: 2,
    title: "The Blue Rooftops of Old Town",
    founderId: "user-2",
    founderName: "Marcus Thorne",
    founderCity: "Lisbon, Portugal",
    pageCount: 2,
    isOpen: true,
    tags: ["Rooftops", "Adventure", "Twilight"],
    createdAt: 1717300000000,
    updatedAt: 1717350000000,
  },
  {
    id: "chapter-3",
    number: 3,
    title: "The Attic With The Saltwater Smell",
    founderId: "user-3",
    founderName: "Aoi Takahashi",
    founderCity: "Kamakura, Japan",
    pageCount: 1,
    isOpen: true,
    tags: ["Ocean", "Attic", "Secret Places"],
    createdAt: 1717400000000,
    updatedAt: 1717450000000,
  },
];

const fallbackMemories: Memory[] = [
  {
    id: "mem-1-1",
    chapterId: "chapter-1",
    pageNum: 1,
    title: "When The Power Cut In August",
    body: "The storm did not arrive with rain. It came with a copper sky and a silence that felt heavier than wet wool blankets. Everyone in our neighborhood stopped mowing lawns and painting porches. By eight in the evening, the streetlights failed to hum their familiar amber song. In their absence, the stars were so thick you could read the headlines of the evening paper on our driveway.",
    authorId: "user-1",
    authorName: "Elena Vance",
    authorCity: "Port Townsend, WA",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80",
    tags: ["Summer", "Storms"],
    createdAt: 1717200000000,
  },
  {
    id: "mem-1-2",
    chapterId: "chapter-1",
    pageNum: 2,
    title: "Ice Cream In The Darkness",
    body: "Every parent in the cul-de-sac brought their melting tubs of Neapolitan ice cream to the circle. We ate strawberry stripes with aluminum soup spoons before the chocolate turned to soup. Nobody scolded anyone for dripping onto their bare knees. We learned that night what darkness smelled like when you weren't afraid of it.",
    authorId: "user-4",
    authorName: "Julian Rowe",
    authorCity: "Seattle, WA",
    imageUrl: null,
    tags: ["Neighborhood", "Midnight"],
    createdAt: 1717220000000,
  },
  {
    id: "mem-1-3",
    chapterId: "chapter-1",
    pageNum: 3,
    title: "The Morning After The Blackout",
    body: "Waking up before dawn, the world felt reconstructed from memory alone. The birds didn't seem confused by the silence of the grid. By seven, the refrigerator gave a violent shudder and groaned back to life, and just like that, childhood resumed its ordinary broadcast.",
    authorId: "user-5",
    authorName: "Clara O'Shea",
    authorCity: "Tacoma, WA",
    imageUrl: null,
    tags: ["Morning", "Grid"],
    createdAt: 1717250000000,
  },
  {
    id: "mem-2-1",
    chapterId: "chapter-2",
    pageNum: 1,
    title: "The Terracotta Labyrinth",
    body: "From my grandmother's third-floor window, the city was not streets and cobblestones, but an endless staircase of fired clay. We could walk three whole city blocks without touching the pavement, jumping gutters where the pigeons gathered at dusk.",
    authorId: "user-2",
    authorName: "Marcus Thorne",
    authorCity: "Lisbon, Portugal",
    imageUrl: "https://images.unsplash.com/photo-1513688285373-4ec92273f679?auto=format&fit=crop&w=1200&q=80",
    tags: ["Rooftops", "Adventure"],
    createdAt: 1717300000000,
  },
  {
    id: "mem-2-2",
    chapterId: "chapter-2",
    pageNum: 2,
    title: "Losing A Shoe Over Rua Da Bica",
    body: "My left espadrille slipped between the rain gutters and plummeted into a stranger's laundry line three stories below. We spent forty-five minutes trying to fish it back with an unraveled wire hanger. We never got it, but the old woman gave us warm sweet bread anyway.",
    authorId: "user-6",
    authorName: "Sofia Silva",
    authorCity: "Lisbon, Portugal",
    imageUrl: null,
    tags: ["Laughter", "Laundry"],
    createdAt: 1717350000000,
  },
  {
    id: "mem-3-1",
    chapterId: "chapter-3",
    pageNum: 1,
    title: "The Cedar Trunk Behind The Screen",
    body: "In the monsoon month of June, my sister and I hid in the crawl space under the eaves. The sea breeze made the cedar rafters whistle like a bamboo flute. Inside an abandoned tea tin, we found postcards dated 1964 addressed to someone with our mother's maiden name.",
    authorId: "user-3",
    authorName: "Aoi Takahashi",
    authorCity: "Kamakura, Japan",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tags: ["Ocean", "Attic"],
    createdAt: 1717400000000,
  },
];

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // If backend is not reached or error occurs, provide graceful fallback
    console.warn(`Fetch error for ${path}, using local repository fallback.`, err);
    if (path === "/api/chapters") {
      return fallbackChapters as unknown as T;
    }
    if (path.startsWith("/api/chapters/")) {
      const id = path.replace("/api/chapters/", "");
      const chapter = fallbackChapters.find((c) => c.id === id) || fallbackChapters[0];
      const memories = fallbackMemories.filter((m) => m.chapterId === chapter.id);
      return { chapter, memories } as unknown as T;
    }
    if (path.startsWith("/api/memories/")) {
      const id = path.replace("/api/memories/", "");
      const memory = fallbackMemories.find((m) => m.id === id) || fallbackMemories[0];
      return memory as unknown as T;
    }
    if (path.includes("/memories") && options?.method === "GET") {
      return fallbackMemories as unknown as T;
    }
    throw err;
  }
}

export const api = {
  getChapters: () => fetchJSON<Chapter[]>("/api/chapters"),
  getChapter: (id: string) => fetchJSON<ChapterDetail>(`/api/chapters/${id}`),
  getMemory: (id: string) => fetchJSON<Memory>(`/api/memories/${id}`),
  createChapter: (data: NewChapter, token: string) =>
    fetchJSON<Chapter>("/api/chapters", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),
  createMemory: (data: NewMemory, token: string) =>
    fetchJSON<Memory>("/api/memories", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),
  getUserMemories: (uid: string, token: string) =>
    fetchJSON<Memory[]>(`/api/users/${uid}/memories`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
