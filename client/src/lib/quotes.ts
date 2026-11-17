'use client';

import { useState, useEffect } from 'react';

export interface LiteraryQuote {
  id: number;
  text: string;
  author: string;
}

export const LITERARY_QUOTES: LiteraryQuote[] = [
  {
    id: 1,
    text: 'Books are a uniquely portable magic.',
    author: 'Stephen King',
  },
  {
    id: 2,
    text: 'A room without books is like a body without a soul.',
    author: 'Marcus Tullius Cicero',
  },
  {
    id: 3,
    text: 'I have always imagined that Paradise will be a kind of library.',
    author: 'Jorge Luis Borges',
  },
  {
    id: 4,
    text: 'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
    author: 'George R.R. Martin',
  },
  {
    id: 5,
    text: 'A book is a dream that you hold in your hand.',
    author: 'Neil Gaiman',
  },
  {
    id: 6,
    text: 'I have sometimes thought that heaven must be one continuous unexhausted reading.',
    author: 'Virginia Woolf',
  },
  {
    id: 7,
    text: 'You can never get a cup of tea large enough or a book long enough to suit me.',
    author: 'C.S. Lewis',
  },
  {
    id: 8,
    text: 'A book is proof that humans are capable of working magic.',
    author: 'Carl Sagan',
  },
  {
    id: 9,
    text: 'To learn to read is to light a fire; every syllable that is spelled out is a spark.',
    author: 'Victor Hugo',
  },
  {
    id: 10,
    text: 'When I have a little money, I buy books; and if I have any left, I buy food and clothes.',
    author: 'Desiderius Erasmus',
  },
  {
    id: 11,
    text: 'There is no frigate like a book to take us lands away.',
    author: 'Emily Dickinson',
  },
  {
    id: 12,
    text: 'If you only read the books that everyone else is reading, you can only think what everyone else is thinking.',
    author: 'Haruki Murakami',
  },
  {
    id: 13,
    text: "The person who doesn't read lives only one life. The reader lives 5,000 years.",
    author: 'Umberto Eco',
  },
  {
    id: 14,
    text: 'Reading is going toward something that is about to be, and no one yet knows what it will be.',
    author: 'Italo Calvino',
  },
  {
    id: 15,
    text: 'There is a great deal of difference between an eager man who wants to read a book and a tired man who wants a book to read.',
    author: 'G.K. Chesterton',
  },
  {
    id: 16,
    text: 'Every passion borders on the chaotic, but the collector’s passion borders on the chaos of memories.',
    author: 'Walter Benjamin',
  },
  {
    id: 17,
    text: 'A book must be the axe for the frozen sea within us.',
    author: 'Franz Kafka',
  },
  {
    id: 18,
    text: 'There is no friend as loyal as a book.',
    author: 'Ernest Hemingway',
  },
  {
    id: 19,
    text: 'I declare after all there is no enjoyment like reading! How much sooner one tires of any thing than of a book!',
    author: 'Jane Austen',
  },
  {
    id: 20,
    text: "You don't have to burn books to destroy a culture. Just get people to stop reading them.",
    author: 'Ray Bradbury',
  },
  {
    id: 21,
    text: 'The man who does not read has no advantage over the man who cannot read.',
    author: 'Mark Twain',
  },
  {
    id: 22,
    text: "It is what you read when you don't have to that determines what you will be when you can't help it.",
    author: 'Oscar Wilde',
  },
  {
    id: 23,
    text: 'She is too fond of books, and it has turned her brain.',
    author: 'Louisa May Alcott',
  },
  {
    id: 24,
    text: "That is part of the beauty of all literature. You discover that your longings are universal longings, that you're not lonely and isolated.",
    author: 'F. Scott Fitzgerald',
  },
  {
    id: 25,
    text: 'The world to me was a secret which I desired to divine.',
    author: 'Mary Shelley',
  },
  {
    id: 26,
    text: 'An idea, like a ghost, must be spoken to a little before it will explain itself.',
    author: 'Charles Dickens',
  },
  {
    id: 27,
    text: 'You think your pain and your heartbreak are unprecedented, but then you read.',
    author: 'James Baldwin',
  },
  {
    id: 28,
    text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.",
    author: 'Toni Morrison',
  },
  {
    id: 29,
    text: 'We read to know that we are not alone.',
    author: 'C.S. Lewis',
  },
  {
    id: 30,
    text: 'I find television very educating. Every time somebody turns on the set, I go into the other room and read a book.',
    author: 'Groucho Marx',
  },
  {
    id: 31,
    text: 'So please, we beg, we pray, go throw your TV set away, and in its place you can install a lovely bookshelf on the wall.',
    author: 'Roald Dahl',
  },
  {
    id: 32,
    text: 'Words are, in my not-so-humble opinion, our most inexhaustible source of magic.',
    author: 'J.K. Rowling',
  },
  {
    id: 33,
    text: 'It is a great thing to start life with a small number of really good books which are your very own.',
    author: 'Arthur Conan Doyle',
  },
  {
    id: 34,
    text: 'A book is like a person — clever and dull, brave and cowardly, beautiful and ugly, but always very human.',
    author: 'John Steinbeck',
  },
  {
    id: 35,
    text: "In the end, we'll all become stories.",
    author: 'Margaret Atwood',
  },
  {
    id: 36,
    text: 'Let us read, and let us dance; these two amusements will never do any harm to the world.',
    author: 'Voltaire',
  },
  {
    id: 37,
    text: "I cannot remember the books I've read any more than the meals I have eaten; even so, they have made me.",
    author: 'Ralph Waldo Emerson',
  },
  {
    id: 38,
    text: 'Books are the treasured wealth of the world and the fit inheritance of generations and nations.',
    author: 'Henry David Thoreau',
  },
  {
    id: 39,
    text: 'A book is a version of the world. If you do not like it, ignore it; or offer your own version in return.',
    author: 'Salman Rushdie',
  },
  {
    id: 40,
    text: 'Reading is a conversation with the past, an instruction in empathy, and a private sanctuary.',
    author: 'Alberto Manguel',
  },
  {
    id: 41,
    text: 'We read books to find out who we are. What other persons do and think and feel is an essential guide to our own becoming.',
    author: 'Ursula K. Le Guin',
  },
  {
    id: 42,
    text: 'The best books are those that tell you what you know already.',
    author: 'George Orwell',
  },
  {
    id: 43,
    text: 'Until I feared I would lose it, I never loved to read. One does not love breathing.',
    author: 'Harper Lee',
  },
  {
    id: 44,
    text: 'Reading is to the mind what exercise is to the body.',
    author: 'Joseph Addison',
  },
  {
    id: 45,
    text: "That's the thing about books. They let you travel without moving your feet.",
    author: 'Jhumpa Lahiri',
  },
  {
    id: 46,
    text: 'The serial reader is an explorer of unlived lives and unexpected horizons.',
    author: 'Milan Kundera',
  },
  {
    id: 47,
    text: 'Stories matter. Many stories matter. Stories can be used to dispossess, but they can also empower and humanize.',
    author: 'Chimamanda Ngozi Adichie',
  },
  {
    id: 48,
    text: 'Never trust anyone who has not brought a book with them.',
    author: 'Lemony Snicket',
  },
  {
    id: 49,
    text: 'No two persons ever read the same book.',
    author: 'Edmund Wilson',
  },
  {
    id: 50,
    text: 'A book is a device to ignite the imagination and share the quiet light of another mind.',
    author: 'Alan Bennett',
  },
];

const STORAGE_KEY = 'shelftrade_recent_quotes_history';
const MAX_HISTORY_LEN = 30; // Guarantees a quote will never repeat until at least 30 other quotes have been seen

/**
 * Returns a randomized literary quote with anti-repetition tracking.
 * Remembers the last 30 quotes in localStorage so quotes do not repeat frequently.
 */
export function getRandomLiteraryQuote(): LiteraryQuote {
  try {
    let recentIds: number[] = [];
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        recentIds = JSON.parse(stored);
      } catch {
        recentIds = [];
      }
    }

    // Filter out quotes that appeared recently
    let candidates = LITERARY_QUOTES.filter(q => !recentIds.includes(q.id));

    // If pool is exhausted, prune the history to the last 5 and re-evaluate
    if (candidates.length === 0) {
      recentIds = recentIds.slice(-5);
      candidates = LITERARY_QUOTES.filter(q => !recentIds.includes(q.id));
    }

    // Pick random from candidates
    const chosen =
      candidates[Math.floor(Math.random() * candidates.length)] || LITERARY_QUOTES[0];

    // Record chosen id
    recentIds.push(chosen.id);
    if (recentIds.length > MAX_HISTORY_LEN) {
      recentIds.shift();
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));

    return chosen;
  } catch {
    // Fallback if localStorage is unavailable
    const randomIndex = Math.floor(Math.random() * LITERARY_QUOTES.length);
    return LITERARY_QUOTES[randomIndex];
  }
}

/**
 * React hook that loads a fresh randomized quote on mount with anti-repetition check,
 * maintaining SSR-safe initial render with no hydration mismatches.
 */
export function useRandomQuote(defaultId: number = 1) {
  const fallback = LITERARY_QUOTES.find(q => q.id === defaultId) || LITERARY_QUOTES[0];
  const [quote, setQuote] = useState<LiteraryQuote>(fallback);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const freshQuote = getRandomLiteraryQuote();
      setQuote(freshQuote);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return quote;
}
