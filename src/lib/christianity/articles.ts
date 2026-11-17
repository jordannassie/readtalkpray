export const TOPICS = [
  "Jesus",
  "Salvation",
  "Baptism",
  "Bible",
  "Prayer",
  "Christian Living",
  "Bible Groups",
] as const;

export type ChristianityTopic = (typeof TOPICS)[number];

export type ChristianityArticle = {
  slug: string;
  title: string;
  topic: ChristianityTopic;
  keywords: string[];
  intro: string;
  references: string[];
  paragraphs: string[];
};

export const FEATURED = [
  {
    slug: "who-is-jesus",
    title: "Who Is Jesus?",
    description: "Discover His life, His love, and why He changes everything.",
    button: "Learn About Jesus",
    image: "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/jesus.png",
  },
  {
    slug: "why-get-baptized",
    title: "Why Get Baptized?",
    description: "A public step of faith that shows you're following Jesus.",
    button: "Learn About Baptism",
    image: "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/Baptisim.png",
  },
  {
    slug: "why-join-a-bible-group",
    title: "Why Join a Bible Group?",
    description: "Read the Bible, talk about it, pray together, and grow in your faith.",
    button: "Learn About Groups",
    image: "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/groups.png",
  },
] as const;

export const ARTICLES: ChristianityArticle[] = [
  {
    slug: "who-is-jesus",
    title: "Who Is Jesus?",
    topic: "Jesus",
    keywords: ["jesus", "christ", "son of god", "savior", "lord", "gospel"],
    intro: "Jesus is the Christ, the Son of God. He is fully God and fully man, and he is the only way to the Father.",
    references: ["John 1:1–14", "John 3:16", "John 14:6", "1 Corinthians 15:3–4"],
    paragraphs: [
      "Jesus was born in Bethlehem, lived a sinless life, and taught people to repent and follow him. He healed the sick, welcomed outsiders, and told the truth about God and about human sin.",
      "His love is not a vague feeling. He gave his life on the cross for sinners and rose bodily from the dead. That is why the first Christians called him Lord.",
      "Knowing about Jesus is the start. He invites people to trust him, turn from sin, and follow him with others who are reading the Bible, talking about it, and praying.",
    ],
  },
  {
    slug: "is-jesus-god",
    title: "Is Jesus God?",
    topic: "Jesus",
    keywords: ["deity", "trinity", "son of god", "lord", "divine"],
    intro: "Yes. Scripture presents Jesus as God the Son, one with the Father and the Holy Spirit, and also truly human.",
    references: ["John 1:1–3", "John 10:30", "Colossians 1:15–20", "Hebrews 1:1–3"],
    paragraphs: [
      "Christians believe there is one God, eternally Father, Son, and Holy Spirit. Jesus is not a lesser god or a created being. The Son has always been God.",
      "He also became man. He ate, slept, suffered, and died. His humanity is real, and his deity is real. That is why he can represent people before God and reveal God to people.",
      "The right response is worship and trust, not curiosity alone. Jesus is Lord.",
    ],
  },
  {
    slug: "why-did-jesus-die",
    title: "Why Did Jesus Die?",
    topic: "Jesus",
    keywords: ["cross", "crucifixion", "atonement", "sacrifice", "forgiveness"],
    intro: "Jesus died on the cross for our sins. His death is the way God forgives guilty people without ignoring justice.",
    references: ["Isaiah 53:5–6", "Romans 3:23–26", "Romans 5:8", "1 Peter 2:24"],
    paragraphs: [
      "All people have sinned. Sin is not a small mistake. It separates people from the holy God, and it cannot be paid off by good intentions.",
      "Jesus, who had no sin of his own, bore the penalty of sin. He died in the place of sinners. God shows his love in this: Christ died for us.",
      "The cross is not the end of the story. Jesus was buried and rose again. Forgiveness rests on a finished work, received by faith.",
    ],
  },
  {
    slug: "did-jesus-rise-from-the-dead",
    title: "Did Jesus Rise from the Dead?",
    topic: "Jesus",
    keywords: ["resurrection", "easter", "empty tomb", "alive"],
    intro: "Yes. Jesus rose bodily on the third day. The resurrection is how we know the cross worked and that he is Lord.",
    references: ["Matthew 28:1–10", "Luke 24:1–12", "1 Corinthians 15:3–8", "Romans 1:4"],
    paragraphs: [
      "The Gospels say the tomb was empty and that Jesus appeared to his followers. Paul later wrote that Jesus appeared to many witnesses, including people who were still alive when he wrote.",
      "A resurrection that is only a metaphor would not match what those witnesses claimed. They said they saw the Lord, and they were willing to suffer for that testimony.",
      "Because Jesus lives, death does not have the last word. He will return, and those who belong to him will receive eternal life.",
    ],
  },
  {
    slug: "what-is-the-gospel",
    title: "What Is the Gospel?",
    topic: "Salvation",
    keywords: ["gospel", "good news", "message", "christ died"],
    intro: "The gospel is the good news that Jesus Christ died for our sins, was buried, and rose again, and that everyone who trusts him is forgiven.",
    references: ["1 Corinthians 15:1–4", "Romans 1:16", "Mark 1:15"],
    paragraphs: [
      "Gospel means good news. It is news about what Jesus has done, not a ladder of tasks that earn God's favor.",
      "The news has a response. Jesus called people to repent and believe. Turning to him is how a person receives what he accomplished.",
      "This is the message Read Talk Pray groups are learning to share: God's love, our sin, Jesus' death and resurrection, and the invitation to trust him.",
    ],
  },
  {
    slug: "how-can-i-be-saved",
    title: "How Can I Be Saved?",
    topic: "Salvation",
    keywords: ["saved", "salvation", "faith", "grace", "born again"],
    intro: "Salvation is God's gift. It is received through repentance and faith in Jesus Christ, not earned by good works.",
    references: ["Ephesians 2:8–9", "Romans 10:9–13", "John 3:16", "Acts 16:31"],
    paragraphs: [
      "You do not become right with God by trying harder, joining a group, or coming from a Christian family. Those things cannot remove guilt.",
      "God saves people who turn from sin and trust Jesus as Lord. Call on him. Confess that he is Lord and believe that God raised him from the dead.",
      "Then follow him. Read the Bible, pray, be baptized, and walk with other believers. Those steps do not purchase salvation. They are how a forgiven person lives.",
    ],
  },
  {
    slug: "what-is-repentance",
    title: "What Is Repentance?",
    topic: "Salvation",
    keywords: ["repent", "turn", "confession", "sin"],
    intro: "Repentance is turning from sin to God. It is a change of mind that shows up in a new direction.",
    references: ["Mark 1:15", "Acts 3:19", "Acts 2:38", "2 Corinthians 7:10"],
    paragraphs: [
      "Jesus began his preaching by calling people to repent and believe the gospel. Sorry feelings are not the whole of it. Repentance agrees with God about sin and turns toward Christ.",
      "Faith and repentance belong together. You turn from trusting yourself and turn to trusting Jesus.",
      "A repentant life keeps turning. Christians still sin, and they keep coming back to God for forgiveness and a new start.",
    ],
  },
  {
    slug: "can-i-be-sure-i-belong-to-jesus",
    title: "Can I Be Sure I Belong to Jesus?",
    topic: "Salvation",
    keywords: ["assurance", "eternal life", "confidence", "security"],
    intro: "Yes. Assurance rests on Jesus' promise, not on having a perfect week.",
    references: ["John 10:27–29", "1 John 5:11–13", "Romans 8:1", "Romans 8:38–39"],
    paragraphs: [
      "Jesus says his sheep hear his voice and follow him, and that no one will snatch them out of his hand. John writes so that believers may know they have eternal life.",
      "There is no condemnation for those who are in Christ Jesus. Nothing in life or death can separate them from the love of God in Christ.",
      "A changed love for God and for people is a sign of that life. The foundation is still Christ, not your latest success or failure.",
    ],
  },
  {
    slug: "why-get-baptized",
    title: "Why Get Baptized?",
    topic: "Baptism",
    keywords: ["baptism", "baptized", "water", "public"],
    intro: "Baptism is a public step of faith that shows you are following Jesus. It does not earn salvation.",
    references: ["Matthew 28:19", "Acts 2:38–41", "Romans 6:3–4", "Colossians 2:12"],
    paragraphs: [
      "Jesus commanded his followers to make disciples and baptize them. In the book of Acts, people who believed were baptized. It is the ordinary next step after trusting Christ.",
      "Going into the water pictures dying with Jesus. Coming up pictures rising to a new life. It tells the church, and anyone watching, that you belong to him.",
      "Baptism is not the payment for sin. Salvation is God's gift, received by faith. Baptism is the obedient, public sign of that faith. If you have trusted Jesus and have not been baptized, talk with a believer or a local church about taking this step.",
    ],
  },
  {
    slug: "what-does-baptism-mean",
    title: "What Does Baptism Mean?",
    topic: "Baptism",
    keywords: ["meaning", "symbol", "identify", "union with christ"],
    intro: "Baptism means you are joined to Jesus in his death and resurrection, and you are saying so in public.",
    references: ["Romans 6:3–4", "Galatians 3:27", "Acts 8:36–38"],
    paragraphs: [
      "Paul says that those who are baptized into Christ are baptized into his death, so that they might walk in newness of life. The water is a picture of that union.",
      "It is also a confession. The person being baptized is identifying with Jesus in front of other people.",
      "The meaning is personal, but it is not private. Baptism puts a believer into the visible story of the church.",
    ],
  },
  {
    slug: "who-should-be-baptized",
    title: "Who Should Be Baptized?",
    topic: "Baptism",
    keywords: ["believer", "new christian", "when", "candidate"],
    intro: "Baptism is for a person who has personally trusted Jesus. In the New Testament, belief comes first.",
    references: ["Acts 2:41", "Acts 8:12", "Acts 16:31–33", "Matthew 28:19"],
    paragraphs: [
      "On the day of Pentecost, those who received the word were baptized. In Samaria, people believed and were baptized. The same pattern appears with the Philippian jailer and his household after they heard the word of the Lord.",
      "A ceremony cannot replace faith. Baptism announces a faith that is already there.",
      "If you trust Jesus, you should be baptized. Do not wait for a perfect record. Speak with a Bible-believing church or with the leader of a group you trust, and take the step Jesus commanded.",
    ],
  },
  {
    slug: "why-read-the-bible",
    title: "Why Read the Bible?",
    topic: "Bible",
    keywords: ["scripture", "word of god", "reading", "authority"],
    intro: "The Bible is God's Word and the authority for faith, doctrine, and Christian living.",
    references: ["2 Timothy 3:16–17", "Psalm 119:105", "Romans 15:4"],
    paragraphs: [
      "Scripture is inspired by God. It teaches, corrects, and trains God's people so they are equipped for every good work.",
      "Reading the Bible is how a person hears who God is, what Jesus has done, and how to follow him. It is a lamp for the path, not a book to leave closed.",
      "Read Talk Pray starts here on purpose. Open a chapter, talk about what it says, and pray. That is a simple way to let Scripture lead.",
    ],
  },
  {
    slug: "where-should-i-start-reading-the-bible",
    title: "Where Should I Start Reading the Bible?",
    topic: "Bible",
    keywords: ["start", "john", "beginner", "gospel", "plan"],
    intro: "Start with the Gospel of John. Read one chapter at a time and ask what it says, what it means, and what you should do.",
    references: ["John 20:31", "Luke 24:27", "Psalm 1:1–2"],
    paragraphs: [
      "John wrote so that readers would believe that Jesus is the Christ, the Son of God, and have life in his name. It is a clear front door.",
      "After John, read Matthew, Mark, or Luke, then Acts. The whole Bible matters. The story of Jesus is the place to begin so the rest has a center.",
      "A group helps. You do not have to understand every verse alone. Read with someone, talk about the passage, and pray before you leave.",
    ],
  },
  {
    slug: "is-the-bible-trustworthy",
    title: "Is the Bible Trustworthy?",
    topic: "Bible",
    keywords: ["inspiration", "truth", "authority", "reliable"],
    intro: "Christians receive the Bible as God's Word. It is the authority for what we believe and how we live.",
    references: ["2 Timothy 3:16–17", "2 Peter 1:20–21", "Matthew 4:4"],
    paragraphs: [
      "Peter says no prophecy of Scripture came from someone's private interpretation. Men spoke from God as they were carried along by the Holy Spirit.",
      "Jesus treated Scripture as the Word people live by. He answered temptation with what is written. His followers do the same.",
      "Trusting the Bible does not mean you will understand every line on the first reading. It means you come to it as God's Word, ready to believe and obey what it says.",
    ],
  },
  {
    slug: "how-do-i-pray",
    title: "How Do I Pray?",
    topic: "Prayer",
    keywords: ["prayer", "talking to god", "lord's prayer", "ask"],
    intro: "Prayer is talking with God. You do not need special words. Be honest, and pray in Jesus' name.",
    references: ["Matthew 6:9–13", "Philippians 4:6–7", "1 Thessalonians 5:16–18"],
    paragraphs: [
      "Jesus taught his followers to pray simply. Honor the Father. Ask that his will be done. Ask for daily needs, forgiveness, and help against temptation.",
      "Paul says not to be anxious, but to let your requests be made known to God with thanksgiving. Pray regularly, not only in a crisis.",
      "A helpful pattern in a group is short and sincere: thank God, confess sin, pray for people by name, and ask for what the passage you just read requires.",
    ],
  },
  {
    slug: "does-god-hear-prayer",
    title: "Does God Hear Prayer?",
    topic: "Prayer",
    keywords: ["answered prayer", "listen", "ask", "father"],
    intro: "God hears his children. He answers as a wise Father, which is better than granting every request on our schedule.",
    references: ["Matthew 7:7–11", "1 John 5:14–15", "Psalm 34:17", "James 1:5"],
    paragraphs: [
      "Jesus tells his followers to ask, seek, and knock. He compares God to a father who gives good gifts, not a stranger who ignores the door.",
      "John says that if we ask according to God's will, he hears us. Some requests are refused or delayed because they are not good for us. That is still an answer.",
      "Keep praying. Pray Scripture back to God. Ask for wisdom. And pray with other believers, not only alone.",
    ],
  },
  {
    slug: "what-does-it-mean-to-follow-jesus",
    title: "What Does It Mean to Follow Jesus?",
    topic: "Christian Living",
    keywords: ["disciple", "obedience", "lordship", "follow"],
    intro: "Following Jesus means trusting him as Savior and Lord and learning to obey him day by day.",
    references: ["Luke 9:23", "John 14:15", "Matthew 28:18–20"],
    paragraphs: [
      "Jesus said that anyone who would come after him must deny himself, take up his cross daily, and follow. Following costs comfort and self-rule.",
      "Love for Jesus shows up as obedience. He said the person who loves him keeps his words. Obedience is not how we earn him. It is how we walk with him.",
      "He also sends his followers to make disciples. Following includes helping someone else learn to read, talk, and pray.",
    ],
  },
  {
    slug: "how-do-i-grow-as-a-christian",
    title: "How Do I Grow as a Christian?",
    topic: "Christian Living",
    keywords: ["growth", "discipleship", "holy spirit", "habits"],
    intro: "The Holy Spirit grows believers through the Bible, prayer, and the people of God. Growth is real, and it is not instant.",
    references: ["2 Peter 3:18", "Galatians 5:22–23", "Colossians 3:16", "Hebrews 10:24–25"],
    paragraphs: [
      "Peter tells Christians to grow in the grace and knowledge of our Lord and Savior Jesus Christ. Growth is expected.",
      "The Spirit produces love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control. Those are his fruit, not a costume we put on.",
      "Simple practices make room for that work: read a passage, talk about it with someone, pray, and do not give up meeting together. A Bible group is one clear way to do all four.",
    ],
  },
  {
    slug: "what-is-the-church",
    title: "What Is the Church?",
    topic: "Christian Living",
    keywords: ["church", "body of christ", "gathering", "local church"],
    intro: "The church is the body of Christ. It is people, not a building.",
    references: ["Acts 2:42–47", "1 Corinthians 12:12–27", "Matthew 18:20"],
    paragraphs: [
      "The first believers devoted themselves to the apostles' teaching, fellowship, the breaking of bread, and prayers. They cared for one another and shared the gospel.",
      "Every believer belongs to the one body of Christ. A local gathering is where that body becomes visible: Scripture, prayer, care, baptism, and the Lord's Supper.",
      "A Read Talk Pray group is a simple way to gather around the Bible. It does not replace a healthy local church. Baptism, communion, and the ongoing care of a congregation belong with a church.",
    ],
  },
  {
    slug: "why-join-a-bible-group",
    title: "Why Join a Bible Group?",
    topic: "Bible Groups",
    keywords: ["group", "join", "community", "read talk pray", "fellowship"],
    intro: "A Bible group gives you people to read with, talk with, and pray with. Faith grows in conversation, not only in private.",
    references: ["Acts 2:42", "Hebrews 10:24–25", "Matthew 18:20", "Colossians 3:16"],
    paragraphs: [
      "The New Testament church gathered. They held to the Word, prayed, and stirred one another toward love and good works. Meeting together is normal Christian life.",
      "In a Read Talk Pray group you open the Bible, talk about what it means, and pray. You can come as you are. You do not need a church building or a polished testimony.",
      "If a group is near you, join it. If one is not, you can learn the same simple pattern and start one.",
    ],
  },
  {
    slug: "what-happens-in-a-read-talk-pray-group",
    title: "What Happens in a Read Talk Pray Group?",
    topic: "Bible Groups",
    keywords: ["meeting", "hour", "format", "read talk pray", "gathering"],
    intro: "A group meets for about an hour. You read a passage, talk about it, and pray. Any day, any place.",
    references: ["Acts 2:42", "Nehemiah 8:8", "James 1:22"],
    paragraphs: [
      "Read the Bible together, usually a chapter. Stay with the passage in front of you instead of chasing a long list of side topics.",
      "Talk about what the passage says and what it asks of you. The goal is understanding and obedience, not winning a debate.",
      "Pray before you leave. Thank God, pray for one another, and pray for people who do not yet know Jesus. The leader is responsible for the gathering and the care of the people who come.",
    ],
  },
  {
    slug: "can-i-start-a-bible-group",
    title: "Can I Start a Bible Group?",
    topic: "Bible Groups",
    keywords: ["start", "lead", "leader", "new group", "multiply"],
    intro: "Yes. You need a Bible and a few people. New groups are reviewed before they are listed publicly.",
    references: ["Matthew 28:18–20", "2 Timothy 2:2", "1 Peter 5:2–3"],
    paragraphs: [
      "Jesus sends his followers to make disciples. Paul told Timothy to entrust the message to faithful people who would teach others. Ordinary Christians can open the Bible with a few friends.",
      "Read Talk Pray asks a new leader to agree to the statement of faith and the leader commitments, then submit the group. An admin reviews the application. A private home address is not published as the public meeting place.",
      "Leadership is service. A leader lives a life that reflects Jesus: humility, integrity, and faithfulness to Scripture. If you are ready to serve that way, start the application. Approval comes before the group is shown to everyone else.",
    ],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}

export function relatedArticles(slug: string, limit = 3) {
  const current = getArticle(slug);
  if (!current) return [];
  const others = ARTICLES.filter((article) => article.slug !== slug);
  const sameTopic = others.filter((article) => article.topic === current.topic);
  const rest = others.filter((article) => article.topic !== current.topic);
  return [...sameTopic, ...rest].slice(0, limit);
}

export function filterArticles(articles: ChristianityArticle[], query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return articles;
  return articles.filter((article) => {
    const haystack = [article.title, article.topic, ...article.keywords].join(" ").toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
