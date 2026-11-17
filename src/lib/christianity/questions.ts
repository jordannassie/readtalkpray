import type { ChristianityArticle } from "./articles";

const IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/10%20more";

export const QUESTION_CARDS = [
  { slug: "why-does-god-allow-suffering", title: "Why Does God Allow Suffering?", image: `${IMAGE}/suffering.png` },
  { slug: "what-is-my-purpose-in-life", title: "What Is My Purpose in Life?", image: `${IMAGE}/purpose.png` },
  { slug: "does-god-hear-my-prayers", title: "Does God Hear My Prayers?", image: `${IMAGE}/prayers.png` },
  { slug: "can-god-forgive-me", title: "Can God Forgive Me?", image: `${IMAGE}/forgive.png` },
  { slug: "what-happens-after-we-die", title: "What Happens After We Die?", image: `${IMAGE}/what%20happens.png` },
  { slug: "how-do-i-read-the-bible", title: "How Do I Read the Bible?", image: `${IMAGE}/read%20bible.png` },
  { slug: "how-do-i-pray", title: "How Do I Pray?", image: `${IMAGE}/how%20to%20pray.png` },
  { slug: "how-can-i-find-hope", title: "How Can I Find Hope?", image: `${IMAGE}/find%20hope.png` },
  { slug: "how-can-i-find-community", title: "How Can I Find Community?", image: `${IMAGE}/find%20community.png` },
  { slug: "how-do-i-follow-jesus", title: "How Do I Follow Jesus?", image: `${IMAGE}/follow%20jesus.png` },
] as const;

export const QUESTION_ARTICLES: ChristianityArticle[] = [
  {
    slug: "why-does-god-allow-suffering",
    title: "Why Does God Allow Suffering?",
    topic: "Christian Living",
    keywords: ["suffering", "pain", "tragedy", "hurt", "grief", "evil", "why"],
    image: `${IMAGE}/suffering.png`,
    intro: "Suffering is real, and the Bible does not pretend otherwise. Christians are not promised a pain-free life. God is near to the brokenhearted, and Jesus offers hope even in the middle of it.",
    references: ["John 16:33", "Romans 8:18", "Romans 8:28", "Revelation 21:4", "Psalm 34:18"],
    paragraphs: [],
    cta: { label: "Find a Bible Group", href: "/#groups" },
    sections: [
      {
        heading: "We live in a fallen world",
        paragraphs: [
          "The Bible says the world is not the way God first made it. Sin entered human life, and with it came death, grief, sickness, and injustice. Much of what hurts people is the result of that broken world, not a private score God is settling.",
          "A tragedy is not proof that the person who suffers committed some hidden sin. Jesus refused that explanation when people asked about a man born blind. Suffering is not a simple formula.",
        ],
      },
      {
        heading: "Jesus did not promise an easy life",
        paragraphs: [
          "Jesus told his followers they would have trouble in this world. He also told them to take heart, because he has overcome the world. Following him does not cancel pain. It gives you a Lord who has suffered himself.",
          "He was betrayed, beaten, and crucified. He knows what it is to weep. Christian faith does not look away from the cross and then promise that nothing hard will happen to you.",
        ],
      },
      {
        heading: "God is near to the brokenhearted",
        paragraphs: [
          "Psalm 34 says the Lord is close to the brokenhearted and saves those who are crushed in spirit. Prayer in suffering is not a performance. It can be a cry. God invites that cry.",
          "Romans 8 says that God works all things together for the good of those who love him. That is not a claim that every event feels good, or that we can always see the reason. It is a promise that God is not absent and that his purpose is not defeated by what hurts us.",
        ],
      },
      {
        heading: "Hope that outlasts the pain",
        paragraphs: [
          "Paul writes that the sufferings of this present time are not worth comparing with the glory that will be revealed. Revelation looks ahead to a day when God will wipe away every tear and death will be no more.",
          "Until that day, you do not have to carry pain alone. Read the Bible with other people, talk honestly, and pray. A Bible group is one place to be known while you wait on God.",
        ],
      },
    ],
  },
  {
    slug: "what-is-my-purpose-in-life",
    title: "What Is My Purpose in Life?",
    topic: "Christian Living",
    keywords: ["purpose", "meaning", "why am i here", "created", "calling", "good works"],
    image: `${IMAGE}/purpose.png`,
    intro: "You were made by God, for God. Your life is not an accident. The Bible gives a purpose that is bigger than a job title: know God, love him, love people, and do the good he prepared for you.",
    references: ["Genesis 1:27", "Matthew 22:37–39", "Ephesians 2:10", "Colossians 1:16"],
    paragraphs: [],
    cta: { label: "Find a Bible Group", href: "/#groups" },
    sections: [
      {
        heading: "Made by God",
        paragraphs: [
          "Genesis says people are made in God's image. That gives every person dignity. You are not a product of chance with no name. God knows you.",
          "Colossians says all things were created through Christ and for him. Purpose starts with the one who made you, not with inventing a meaning on your own.",
        ],
      },
      {
        heading: "Made for relationship with him",
        paragraphs: [
          "The greatest command is to love the Lord your God with all your heart, soul, and mind, and to love your neighbor as yourself. That is the shape of a human life that fits what we were made for.",
          "Sin bends that love inward. Jesus restores people to God so they can love him again and love the people around them.",
        ],
      },
      {
        heading: "Made for good work",
        paragraphs: [
          "Ephesians says we are God's workmanship, created in Christ Jesus for good works he prepared beforehand. Good work is not how you earn his love. It is what a loved person gets to do.",
          "That work can look ordinary: telling the truth, caring for a family, serving a neighbor, opening the Bible with a few people. Faithfulness in small places is not a lesser purpose.",
        ],
      },
      {
        heading: "A life you learn with others",
        paragraphs: [
          "Purpose gets clearer as you listen to Scripture and walk with people who are doing the same. Read a passage, talk about what it says, and pray for the courage to live it.",
          "If you are asking what your life is for, start with Jesus. Trust him, and then take the next faithful step in front of you.",
        ],
      },
    ],
  },
  {
    slug: "does-god-hear-my-prayers",
    title: "Does God Hear My Prayers?",
    topic: "Prayer",
    keywords: ["prayer", "prayers", "hear", "pray", "ask", "answered"],
    image: `${IMAGE}/prayers.png`,
    intro: "Yes. God invites people to pray, and he hears them. He answers with wisdom, not as a machine that grants every request in the way and at the time we prefer.",
    references: ["1 John 5:14–15", "Philippians 4:6–7", "Psalm 34:17", "Matthew 6:9–13"],
    paragraphs: [],
    cta: { label: "Read the Bible", href: "/app/bible/matthew/6" },
    sections: [
      {
        heading: "God invites you to speak",
        paragraphs: [
          "Prayer is not a ritual reserved for people who have the right words. Jesus taught his followers to pray simply, calling God Father. Philippians says to bring your requests to God with thanksgiving instead of being consumed by anxiety.",
          "You can pray about small things and heavy things. Nothing true is too ordinary for him, and nothing honest is too messy.",
        ],
      },
      {
        heading: "He hears",
        paragraphs: [
          "John writes that if we ask anything according to God's will, he hears us. The Psalms say the Lord hears the cry of the righteous and delivers them from their troubles. Hearing is not the same as instant agreement with every plan we bring.",
          "God is a Father, not a vending machine. He knows what we need before we ask, and he still wants us to ask. The asking is part of the relationship.",
        ],
      },
      {
        heading: "He answers according to his will",
        paragraphs: [
          "Sometimes the answer is yes. Sometimes it is not yet. Sometimes God gives a different good than the one we named. Jesus himself prayed, 'Not my will, but yours,' in the garden before the cross.",
          "A delayed answer is not proof that you were ignored. Peace that guards your heart, which Philippians describes, can come even while the circumstance has not changed.",
        ],
      },
      {
        heading: "Keep praying",
        paragraphs: [
          "The Lord's Prayer is a pattern: worship God, ask for his will, ask for daily bread, ask for forgiveness, and ask for help against temptation. You can pray that way in your own words.",
          "Pray alone, and pray with other people. A Bible group is a simple place to practice both.",
        ],
      },
    ],
  },
  {
    slug: "can-god-forgive-me",
    title: "Can God Forgive Me?",
    topic: "Salvation",
    keywords: ["forgive", "forgiveness", "guilt", "sin", "grace", "repent", "prodigal"],
    image: `${IMAGE}/forgive.png`,
    intro: "Yes. God forgives through Jesus Christ. His grace is for real guilt, not only for small mistakes, and it opens a new beginning.",
    references: ["1 John 1:9", "Ephesians 1:7", "Romans 5:8", "Luke 15:11–32"],
    paragraphs: [],
    cta: { label: "Learn About Jesus", href: "/christianity/who-is-jesus" },
    sections: [
      {
        heading: "Forgiveness is for real sin",
        paragraphs: [
          "If you are asking this question, you already know something is wrong. The Bible agrees. Everyone has sinned. Hiding it, minimizing it, or trying to outweigh it with good behavior does not remove it.",
          "God does not forgive by pretending sin does not matter. He forgives because Jesus bore the penalty of sin on the cross. Ephesians says we have redemption through his blood, the forgiveness of our trespasses.",
        ],
      },
      {
        heading: "Grace comes first",
        paragraphs: [
          "Romans says God shows his love for us in that while we were still sinners, Christ died for us. You do not clean yourself up and then qualify for mercy. Mercy is how God meets guilty people.",
          "Jesus told a story about a son who wasted his inheritance and came home ashamed. The father ran to him. That is the heart of God toward a person who turns back.",
        ],
      },
      {
        heading: "Repentance and a new start",
        paragraphs: [
          "John writes that if we confess our sins, God is faithful and just to forgive us and to cleanse us. Confession means agreeing with God and turning toward him, not writing a speech that earns the pardon.",
          "Forgiveness is a beginning. A forgiven person still has habits to leave and people to love. The gospel gives both the pardon and the power to start again.",
        ],
      },
      {
        heading: "You can come today",
        paragraphs: [
          "You do not need a perfect past. Tell God the truth. Trust Jesus as the one who died and rose for you. Ask him to forgive you and to lead you.",
          "Then tell someone who follows Jesus. Read the Bible, pray, and walk with a group. Forgiveness is personal, and it is meant to be lived in community.",
        ],
      },
    ],
  },
  {
    slug: "what-happens-after-we-die",
    title: "What Happens After We Die?",
    topic: "Salvation",
    keywords: ["die", "death", "afterlife", "heaven", "resurrection", "judgment", "eternal life"],
    image: `${IMAGE}/what%20happens.png`,
    intro: "Death is not the end of the person. The Bible teaches that people die once, face judgment, and that eternal life is God's gift to everyone who trusts Jesus, who died and rose again.",
    references: ["John 11:25–26", "John 3:16", "Hebrews 9:27", "Revelation 21:1–4", "1 Corinthians 15:20–22"],
    paragraphs: [],
    cta: { label: "Learn About Jesus", href: "/christianity/who-is-jesus" },
    sections: [
      {
        heading: "Death is real, and it is not the end",
        paragraphs: [
          "Hebrews says people are appointed to die once, and after that comes judgment. Scripture does not treat death as a illusion or as the soul simply disappearing.",
          "The Bible does not invite us to invent details about the moment after death. It tells us what God has revealed: death, judgment, and the hope of resurrection.",
        ],
      },
      {
        heading: "Jesus rose, and that changes death",
        paragraphs: [
          "Jesus told Martha that he is the resurrection and the life, and that whoever believes in him will live even though they die. His own resurrection is the proof, not a symbol. Paul calls him the firstfruits of those who have died.",
          "Because Jesus lives, death does not have the final word over those who belong to him. Eternal life is a gift, not a wage. John 3:16 ties that gift to faith in the Son.",
        ],
      },
      {
        heading: "Judgment and mercy",
        paragraphs: [
          "Judgment is part of the Christian hope, because God will not ignore evil forever. It is also why we need a Savior. No one stands before God on the strength of a good reputation.",
          "Those who trust Christ are not received because they were impressive. They are received because Jesus died for their sins and rose. Those who refuse him remain under judgment. That is the sober line Scripture draws.",
        ],
      },
      {
        heading: "A restored world",
        paragraphs: [
          "Revelation looks forward to a new heaven and a new earth, where God dwells with his people, and where death, mourning, and pain are gone. That future is concrete. It is not a vague glow.",
          "Until then, Christians grieve, and they grieve with hope. If you want to understand this more clearly, read the Gospel of John and talk about it with people who trust Jesus.",
        ],
      },
    ],
  },
  {
    slug: "how-do-i-read-the-bible",
    title: "How Do I Read the Bible?",
    topic: "Bible",
    keywords: ["bible", "read", "scripture", "john", "beginner", "chapter"],
    image: `${IMAGE}/read%20bible.png`,
    intro: "Start small, start with Jesus, and keep going. The Bible is God's word, and a beginner can read it without already knowing everything.",
    references: ["2 Timothy 3:16–17", "Psalm 119:105", "Acts 17:11", "Luke 24:27"],
    paragraphs: [],
    cta: { label: "Read the Bible", href: "/app/bible/john/1" },
    sections: [
      {
        heading: "Start with the Gospel of John",
        paragraphs: [
          "John was written so that readers would believe that Jesus is the Christ and have life in his name. It is a clear place to begin. Read one chapter, or even one scene, at a time.",
          "You do not need to start at Genesis and force your way through. Come back to the rest of the Bible. The whole book points to Jesus, which is what he himself showed his friends on the road to Emmaus.",
        ],
      },
      {
        heading: "Read with a few questions",
        paragraphs: [
          "Ask what the passage says about God. Ask what it says about people. Notice the context: who is speaking, and what happened just before this chapter.",
          "Then ask what you should do with it. Scripture is useful for teaching, correction, and training in righteousness. It is meant to be obeyed, not only admired.",
        ],
      },
      {
        heading: "Pray about what you read",
        paragraphs: [
          "The psalmist calls God's word a lamp for the path. Ask God to help you understand what you are reading and to give you a willing heart.",
          "A short prayer is enough: 'Lord, show me what is true here, and help me live it.'",
        ],
      },
      {
        heading: "Read with other people",
        paragraphs: [
          "The people in Berea examined the Scriptures for themselves when they heard the message. That is a good pattern: listen, open the Bible, and check what it says.",
          "Read Talk Pray is built for this. Read a passage together, talk about what it means, and pray. You will notice more in a conversation than you will notice alone.",
        ],
      },
    ],
  },
  {
    slug: "how-can-i-find-hope",
    title: "How Can I Find Hope?",
    topic: "Christian Living",
    keywords: ["hope", "encouragement", "despair", "resurrection", "promises"],
    image: `${IMAGE}/find%20hope.png`,
    intro: "Christian hope is not a mood and it is not a promise of an easy life. It rests on Jesus Christ, his resurrection, and God's promises to stay with his people.",
    references: ["Romans 15:13", "1 Peter 1:3", "Psalm 42:11", "John 16:33"],
    paragraphs: [],
    cta: { label: "Learn About Jesus", href: "/christianity/who-is-jesus" },
    sections: [
      {
        heading: "Hope has a name",
        paragraphs: [
          "Peter says God has given new birth into a living hope through the resurrection of Jesus Christ from the dead. If Jesus is alive, the future is not closed. Hope is tied to a person, not to your current streak of good news.",
          "Romans asks the God of hope to fill his people with joy and peace as they trust him. Hope grows where trust grows.",
        ],
      },
      {
        heading: "Hope in a hard season",
        paragraphs: [
          "The writer of Psalm 42 talks to his own discouraged soul: hope in God. He does not deny the sadness. He aims it. You can tell God the truth about how low you feel and still put your weight on his character.",
          "Jesus said his followers would have trouble, and he told them to take heart because he has overcome the world. Hope does not deny the trouble. It refuses to let the trouble be the last chapter.",
        ],
      },
      {
        heading: "What hope does not promise",
        paragraphs: [
          "The Bible does not promise wealth, constant health, or a life without loss. Anyone who offers those guarantees is offering something Scripture does not. God's people have suffered, and some of the strongest words of hope were written from hard places.",
          "What God does promise is his presence, forgiveness in Christ, and a future resurrection. That is enough to live on when circumstances are thin.",
        ],
      },
      {
        heading: "Hope is strengthened with people",
        paragraphs: [
          "Isolation makes discouragement louder. Reading Scripture with others, saying your fears out loud, and praying together gives hope something to hold besides your own thoughts.",
          "Start with Jesus. Trust him. Then stay near people who will open the Bible with you when your hope feels small.",
        ],
      },
    ],
  },
  {
    slug: "how-can-i-find-community",
    title: "How Can I Find Community?",
    topic: "Bible Groups",
    keywords: ["community", "church", "friends", "fellowship", "belong", "gather", "group"],
    image: `${IMAGE}/find%20community.png`,
    intro: "God did not design faith to be lived alone. Christian community is people gathering around Jesus, encouraging one another, and carrying each other's burdens.",
    references: ["Acts 2:42–47", "Hebrews 10:24–25", "Galatians 6:2", "Matthew 18:20"],
    paragraphs: [],
    cta: { label: "Find a Bible Group", href: "/#groups" },
    sections: [
      {
        heading: "The first Christians gathered",
        paragraphs: [
          "Acts describes a church that devoted itself to the apostles' teaching, to fellowship, to breaking bread, and to prayer. They shared life, not only a weekly meeting. Community was ordinary and serious at the same time.",
          "Jesus said that where two or three gather in his name, he is there among them. A small group is not a lesser church. It is one of the ways his people meet.",
        ],
      },
      {
        heading: "Why we need each other",
        paragraphs: [
          "Hebrews tells believers to stir one another up to love and good works, and not to neglect meeting together. Encouragement is a reason to gather, especially when the days are hard.",
          "Galatians says to bear one another's burdens. Friendship in Christ is practical. People notice when you are missing, pray when you are weak, and tell you the truth when you drift.",
        ],
      },
      {
        heading: "A simple way to begin",
        paragraphs: [
          "You do not have to have a large network already. Look for a few people who will read the Bible, talk about it, and pray. That is the whole method of Read Talk Pray.",
          "Read Talk Pray is a welcoming, locally led network of Bible-reading churches. Groups meet in ordinary places, with ordinary leaders, around Scripture.",
        ],
      },
      {
        heading: "Come as you are",
        paragraphs: [
          "You do not need to know the answers before you walk in. Come with your questions. A healthy group will open the Bible with you instead of asking you to pretend.",
          "If you are ready to be known by other believers, find a group near you and ask to join.",
        ],
      },
    ],
  },
  {
    slug: "how-do-i-follow-jesus",
    title: "How Do I Follow Jesus?",
    topic: "Jesus",
    keywords: ["jesus", "follow", "disciple", "saved", "salvation", "faith", "grace", "baptism", "repent"],
    image: `${IMAGE}/follow%20jesus.png`,
    intro: "Following Jesus begins with trusting him, not with earning a religious score. He calls people to turn from sin, believe the gospel, and learn his way with others.",
    references: ["Mark 1:15", "Luke 9:23", "Romans 10:9–10", "John 14:15", "Matthew 28:19–20"],
    paragraphs: [],
    cta: { label: "Find a Bible Group", href: "/#groups" },
    sections: [
      {
        heading: "The gospel",
        paragraphs: [
          "Jesus, the Son of God, lived without sin, died on the cross for our sins, and rose from the dead. That is the good news. He is Savior and Lord.",
          "Salvation is God's gift. It is received by grace through faith in Jesus. You cannot earn it by church attendance, kindness, or trying harder. Those things matter, but they do not purchase forgiveness.",
        ],
      },
      {
        heading: "Repent and trust him",
        paragraphs: [
          "Jesus' first public call was simple: repent and believe the gospel. Repentance is a turn. You stop trusting yourself as the one who can make you right with God, and you trust Christ.",
          "Paul says that if you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved. Tell him that, in your own words, and mean it.",
        ],
      },
      {
        heading: "A disciple's life",
        paragraphs: [
          "Jesus said that anyone who would follow him must deny self, take up the cross daily, and follow. Following costs comfort. It is also where real life is.",
          "He said that if you love him, you will keep his commands. Obedience is the fruit of love, not the fee for it. Baptism is the public sign that you belong to him. Reading Scripture, prayer, and fellowship are how a disciple keeps walking.",
        ],
      },
      {
        heading: "Walk with others",
        paragraphs: [
          "Jesus sends his people to make disciples, baptizing them and teaching them to obey everything he commanded. No one is meant to figure this out in isolation.",
          "Find a Bible group. Read with them, talk about what Jesus said, and pray. That is how faith becomes a shared life instead of a private idea.",
        ],
      },
    ],
  },
];
