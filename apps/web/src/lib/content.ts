export type Memory = {
  id: string;
  pageNumber: number;
  title: string;
  body: string;
  authorName: string;
  authorCity: string;
  tags: string[];
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  summary: string;
  city: string;
  language: string;
  memories: Memory[];
};

export const chapters: Chapter[] = [
  {
    id: "wheel-cart",
    number: 1,
    title: "The Wheel Cart of Bangles",
    summary: "A small cart, a packet of stickers, and the sound of a mother laughing.",
    city: "Coimbatore, Tamil Nadu",
    language: "English",
    memories: [
      {
        id: "wheel-cart-1",
        pageNumber: 1,
        title: "The evening cart",
        body: "A squeaky wheel cart rolls down the street every evening. Rows of bangles, bindis, hair clips, small mirrors and cosmetics shine under the last light of the day.",
        authorName: "Sanjay",
        authorCity: "Coimbatore",
        tags: ["evening", "street", "home"],
      },
      {
        id: "wheel-cart-2",
        pageNumber: 2,
        title: "The corner with stickers",
        body: "Mom cannot walk past it. She tries bangles on her wrist and bargains like it is a game. Little Sanjay stands beside her, bored of bangles, until he spots the corner with stickers.",
        authorName: "Sanjay",
        authorCity: "Coimbatore",
        tags: ["mother", "bangles", "childhood"],
      },
      {
        id: "wheel-cart-3",
        pageNumber: 3,
        title: "What he kept",
        body: "Ben 10 stickers and a toy train. He pulls her saree and asks again and again until she gives in. He was not collecting stickers. He was collecting the sound of that cart and his mom laughing while she paid.",
        authorName: "Sanjay",
        authorCity: "Coimbatore",
        tags: ["stickers", "memory", "laughter"],
      },
    ],
  },
  {
    id: "wet-earth",
    number: 2,
    title: "The Smell of Wet Earth",
    summary: "The first rain after a long summer, remembered by its smell.",
    city: "Kochi, Kerala",
    language: "English",
    memories: [],
  },
  {
    id: "blue-kite",
    number: 3,
    title: "The Blue Kite",
    summary: "A kite caught in a tree, and a whole afternoon spent getting it back.",
    city: "Jaipur, Rajasthan",
    language: "English",
    memories: [],
  },
];
