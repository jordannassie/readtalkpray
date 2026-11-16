export type BookMeta = {
  slug: string;
  name: string;
  shortName: string;
  order: number;
  testament: "old" | "new";
  chapterCount: number;
};

export const BOOKS: BookMeta[] = [
  // ─── Old Testament ────────────────────────────────────────
  { slug: "genesis",          name: "Genesis",          shortName: "Gen",   order: 1,  testament: "old", chapterCount: 50  },
  { slug: "exodus",           name: "Exodus",           shortName: "Exod",  order: 2,  testament: "old", chapterCount: 40  },
  { slug: "leviticus",        name: "Leviticus",        shortName: "Lev",   order: 3,  testament: "old", chapterCount: 27  },
  { slug: "numbers",          name: "Numbers",          shortName: "Num",   order: 4,  testament: "old", chapterCount: 36  },
  { slug: "deuteronomy",      name: "Deuteronomy",      shortName: "Deut",  order: 5,  testament: "old", chapterCount: 34  },
  { slug: "joshua",           name: "Joshua",           shortName: "Josh",  order: 6,  testament: "old", chapterCount: 24  },
  { slug: "judges",           name: "Judges",           shortName: "Judg",  order: 7,  testament: "old", chapterCount: 21  },
  { slug: "ruth",             name: "Ruth",             shortName: "Ruth",  order: 8,  testament: "old", chapterCount: 4   },
  { slug: "1-samuel",         name: "1 Samuel",         shortName: "1Sam",  order: 9,  testament: "old", chapterCount: 31  },
  { slug: "2-samuel",         name: "2 Samuel",         shortName: "2Sam",  order: 10, testament: "old", chapterCount: 24  },
  { slug: "1-kings",          name: "1 Kings",          shortName: "1Kgs",  order: 11, testament: "old", chapterCount: 22  },
  { slug: "2-kings",          name: "2 Kings",          shortName: "2Kgs",  order: 12, testament: "old", chapterCount: 25  },
  { slug: "1-chronicles",     name: "1 Chronicles",     shortName: "1Chr",  order: 13, testament: "old", chapterCount: 29  },
  { slug: "2-chronicles",     name: "2 Chronicles",     shortName: "2Chr",  order: 14, testament: "old", chapterCount: 36  },
  { slug: "ezra",             name: "Ezra",             shortName: "Ezra",  order: 15, testament: "old", chapterCount: 10  },
  { slug: "nehemiah",         name: "Nehemiah",         shortName: "Neh",   order: 16, testament: "old", chapterCount: 13  },
  { slug: "esther",           name: "Esther",           shortName: "Esth",  order: 17, testament: "old", chapterCount: 10  },
  { slug: "job",              name: "Job",              shortName: "Job",   order: 18, testament: "old", chapterCount: 42  },
  { slug: "psalms",           name: "Psalms",           shortName: "Ps",    order: 19, testament: "old", chapterCount: 150 },
  { slug: "proverbs",         name: "Proverbs",         shortName: "Prov",  order: 20, testament: "old", chapterCount: 31  },
  { slug: "ecclesiastes",     name: "Ecclesiastes",     shortName: "Eccl",  order: 21, testament: "old", chapterCount: 12  },
  { slug: "song-of-solomon",  name: "Song of Solomon",  shortName: "Song",  order: 22, testament: "old", chapterCount: 8   },
  { slug: "isaiah",           name: "Isaiah",           shortName: "Isa",   order: 23, testament: "old", chapterCount: 66  },
  { slug: "jeremiah",         name: "Jeremiah",         shortName: "Jer",   order: 24, testament: "old", chapterCount: 52  },
  { slug: "lamentations",     name: "Lamentations",     shortName: "Lam",   order: 25, testament: "old", chapterCount: 5   },
  { slug: "ezekiel",          name: "Ezekiel",          shortName: "Ezek",  order: 26, testament: "old", chapterCount: 48  },
  { slug: "daniel",           name: "Daniel",           shortName: "Dan",   order: 27, testament: "old", chapterCount: 12  },
  { slug: "hosea",            name: "Hosea",            shortName: "Hos",   order: 28, testament: "old", chapterCount: 14  },
  { slug: "joel",             name: "Joel",             shortName: "Joel",  order: 29, testament: "old", chapterCount: 3   },
  { slug: "amos",             name: "Amos",             shortName: "Amos",  order: 30, testament: "old", chapterCount: 9   },
  { slug: "obadiah",          name: "Obadiah",          shortName: "Obad",  order: 31, testament: "old", chapterCount: 1   },
  { slug: "jonah",            name: "Jonah",            shortName: "Jonah", order: 32, testament: "old", chapterCount: 4   },
  { slug: "micah",            name: "Micah",            shortName: "Mic",   order: 33, testament: "old", chapterCount: 7   },
  { slug: "nahum",            name: "Nahum",            shortName: "Nah",   order: 34, testament: "old", chapterCount: 3   },
  { slug: "habakkuk",         name: "Habakkuk",         shortName: "Hab",   order: 35, testament: "old", chapterCount: 3   },
  { slug: "zephaniah",        name: "Zephaniah",        shortName: "Zeph",  order: 36, testament: "old", chapterCount: 3   },
  { slug: "haggai",           name: "Haggai",           shortName: "Hag",   order: 37, testament: "old", chapterCount: 2   },
  { slug: "zechariah",        name: "Zechariah",        shortName: "Zech",  order: 38, testament: "old", chapterCount: 14  },
  { slug: "malachi",          name: "Malachi",          shortName: "Mal",   order: 39, testament: "old", chapterCount: 4   },

  // ─── New Testament ────────────────────────────────────────
  { slug: "matthew",          name: "Matthew",          shortName: "Matt",  order: 40, testament: "new", chapterCount: 28  },
  { slug: "mark",             name: "Mark",             shortName: "Mark",  order: 41, testament: "new", chapterCount: 16  },
  { slug: "luke",             name: "Luke",             shortName: "Luke",  order: 42, testament: "new", chapterCount: 24  },
  { slug: "john",             name: "John",             shortName: "John",  order: 43, testament: "new", chapterCount: 21  },
  { slug: "acts",             name: "Acts",             shortName: "Acts",  order: 44, testament: "new", chapterCount: 28  },
  { slug: "romans",           name: "Romans",           shortName: "Rom",   order: 45, testament: "new", chapterCount: 16  },
  { slug: "1-corinthians",    name: "1 Corinthians",    shortName: "1Cor",  order: 46, testament: "new", chapterCount: 16  },
  { slug: "2-corinthians",    name: "2 Corinthians",    shortName: "2Cor",  order: 47, testament: "new", chapterCount: 13  },
  { slug: "galatians",        name: "Galatians",        shortName: "Gal",   order: 48, testament: "new", chapterCount: 6   },
  { slug: "ephesians",        name: "Ephesians",        shortName: "Eph",   order: 49, testament: "new", chapterCount: 6   },
  { slug: "philippians",      name: "Philippians",      shortName: "Phil",  order: 50, testament: "new", chapterCount: 4   },
  { slug: "colossians",       name: "Colossians",       shortName: "Col",   order: 51, testament: "new", chapterCount: 4   },
  { slug: "1-thessalonians",  name: "1 Thessalonians",  shortName: "1Thes", order: 52, testament: "new", chapterCount: 5   },
  { slug: "2-thessalonians",  name: "2 Thessalonians",  shortName: "2Thes", order: 53, testament: "new", chapterCount: 3   },
  { slug: "1-timothy",        name: "1 Timothy",        shortName: "1Tim",  order: 54, testament: "new", chapterCount: 6   },
  { slug: "2-timothy",        name: "2 Timothy",        shortName: "2Tim",  order: 55, testament: "new", chapterCount: 4   },
  { slug: "titus",            name: "Titus",            shortName: "Titus", order: 56, testament: "new", chapterCount: 3   },
  { slug: "philemon",         name: "Philemon",         shortName: "Phlm",  order: 57, testament: "new", chapterCount: 1   },
  { slug: "hebrews",          name: "Hebrews",          shortName: "Heb",   order: 58, testament: "new", chapterCount: 13  },
  { slug: "james",            name: "James",            shortName: "Jas",   order: 59, testament: "new", chapterCount: 5   },
  { slug: "1-peter",          name: "1 Peter",          shortName: "1Pet",  order: 60, testament: "new", chapterCount: 5   },
  { slug: "2-peter",          name: "2 Peter",          shortName: "2Pet",  order: 61, testament: "new", chapterCount: 3   },
  { slug: "1-john",           name: "1 John",           shortName: "1John", order: 62, testament: "new", chapterCount: 5   },
  { slug: "2-john",           name: "2 John",           shortName: "2John", order: 63, testament: "new", chapterCount: 1   },
  { slug: "3-john",           name: "3 John",           shortName: "3John", order: 64, testament: "new", chapterCount: 1   },
  { slug: "jude",             name: "Jude",             shortName: "Jude",  order: 65, testament: "new", chapterCount: 1   },
  { slug: "revelation",       name: "Revelation",       shortName: "Rev",   order: 66, testament: "new", chapterCount: 22  },
];

export function getBook(slug: string): BookMeta | undefined {
  return BOOKS.find((b) => b.slug === slug.toLowerCase());
}

export function getBookByOrder(order: number): BookMeta | undefined {
  return BOOKS.find((b) => b.order === order);
}

export const OLD_TESTAMENT = BOOKS.filter((b) => b.testament === "old");
export const NEW_TESTAMENT = BOOKS.filter((b) => b.testament === "new");
