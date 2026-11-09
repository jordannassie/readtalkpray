export const HERO_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/8a25b7cc-e852-4e7b-a895-adfff22a453c.jpg";

export const HERO_VIDEO =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/video/720bible.mov";

export const DEMO_USER = {
  name: "Jordan",
  church: "Frisco, TX",
  city: "Frisco, TX",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
};

export const IMPACT_STATS = [
  { label: "Churches", value: "280" },
  { label: "Nations", value: "23" },
  { label: "Trained", value: "15,203" },
  { label: "Baptized", value: "6,259" },
  { label: "Gospel Reach", value: "223M+" },
] as const;

export const HOW_IT_WORKS = [
  {
    title: "SAVE",
    body: "Reach the lost with the gospel.",
  },
  {
    title: "TRAIN",
    body: "Equip believers through Scripture and practical discipleship.",
  },
  {
    title: "SEND",
    body: "Send ordinary people to start new Sending Churches.",
  },
] as const;

export const HOW_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/How.png";

export const TWELVE_WEEKS = [
  {
    title: "SAVE",
    weeks: "WEEKS 1–4",
    accent: "save",
    steps: ["Pray", "Invite", "Share", "Gather"],
  },
  {
    title: "TRAIN",
    weeks: "WEEKS 5–8",
    accent: "train",
    steps: ["Read", "Discuss", "Obey", "Lead"],
  },
  {
    title: "SEND",
    weeks: "WEEKS 9–12",
    accent: "send",
    steps: ["Identify", "Prepare", "Launch", "Multiply"],
  },
] as const;

export const WHY_SENDING = [
  {
    number: "01",
    title: "Radical Simplicity",
    body: "Everything is simple enough to remember, do, and teach to someone else.",
  },
  {
    number: "02",
    title: "Everyone Practices",
    body: "We don’t just listen. Everyone learns by actually doing.",
  },
  {
    number: "03",
    title: "Leaders Reproduce Leaders",
    body: "Every leader is trained to develop the next leader.",
  },
  {
    number: "04",
    title: "Move People to Mission",
    body: "We help people belong and grow, and we equip those who are ready to live on mission.",
  },
  {
    number: "05",
    title: "Churches Reproduce Churches",
    body: "The goal is not simply bigger churches. It is more healthy churches.",
  },
  {
    number: "06",
    title: "Local Ownership",
    body: "Local leaders lead the mission in their own communities and cultures.",
  },
  {
    number: "07",
    title: "Ultra-Low-Cost Reproduction",
    body: "The model is designed to be affordable and reproducible almost anywhere.",
  },
  {
    number: "08",
    title: "Mission-First Economics",
    body: "Money exists to fuel leaders, mission, and multiplication.",
  },
  {
    number: "09",
    title: "Healthy Reproduction",
    body: "We multiply with sound doctrine, healthy character, resilient leaders, and churches that last.",
  },
] as const;

export const GATHERING_STEPS = [
  {
    time: "0–5 min",
    part: "WELCOME",
    happens: "Welcome everyone and repeat the mission: Save. Train. Send.",
  },
  {
    time: "5–10 min",
    part: "READ",
    happens: "Read the Bible together and let Scripture set the agenda.",
  },
  {
    time: "10–40 min",
    part: "DISCUSS",
    happens: "Talk about what the passage means and what God is saying.",
  },
  {
    time: "40–50 min",
    part: "OBEY",
    happens:
      "Decide one thing you will believe, change, or do because of what we read.",
  },
  {
    time: "50–55 min",
    part: "SEND",
    happens:
      "Decide who you will tell, invite, serve, disciple, or train this week.",
  },
  {
    time: "55–60 min",
    part: "PRAY",
    happens: "Pray for one another and send everyone out on mission.",
  },
] as const;

export const START_FLOW = [
  "2 PEOPLE",
  "GATHER",
  "SAVE",
  "TRAIN",
  "SEND",
  "START AGAIN",
] as const;

export const START_CHECKLIST = [
  "Find one other person",
  "Choose a weekly meeting place",
  "Use the 60-minute gathering format",
  "Invite people",
  "Save → Train → Send",
  "Multiply",
] as const;

export const PATH_CARDS = [
  {
    number: "1",
    title: "GET SAVED",
    body: "Know Jesus and begin a new life.",
    href: "/training",
    cta: "Learn More",
    image:
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1400&q=80",
  },
  {
    number: "2",
    title: "GET TRAINED",
    body: "Grow in your faith and learn the Sending Church model.",
    href: "/training",
    cta: "Start Training",
    image:
      "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    number: "3",
    title: "GET SENT",
    body: "Reach people, make disciples, and start a Sending Church.",
    href: "/start-a-church",
    cta: "Get Sent",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

export const DEMO_CHURCH = {
  city: "Frisco, TX",
  leader: "Jordan",
  meeting: "Sundays, 9:00 AM",
  team: 2,
  reached: 0,
  baptized: 0,
  trained: 0,
  sent: 0,
};

export const DEMO_EVENT = {
  title: "Sending Team Gathering",
  day: "Sunday",
  time: "9:00 AM",
  location: "Frisco, TX",
  dateLabel: "Sunday, September 28",
  image:
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
};

export const EVENTS = [
  DEMO_EVENT,
  {
    title: "Training Night",
    day: "Wednesday",
    time: "7:00 PM",
    location: "Frisco, TX",
    dateLabel: "Wednesday, October 1",
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

export const TRAINING = {
  SAVE: [
    "How to Share the Gospel",
    "How to Invite Someone",
    "How to Lead Someone to Jesus",
  ],
  TRAIN: [
    "How to Lead the 60-Minute Gathering",
    "How to Teach the Bible Simply",
    "How to Disciple Someone",
  ],
  SEND: [
    "How to Start With Two",
    "How to Choose a Meeting Location",
    "How to Launch a New Sending Church",
    "How to Train the Next Leader",
  ],
} as const;

export const STORIES = [
  {
    name: "Maria",
    city: "Frisco, TX",
    quote:
      "We started with two people in a living room. Three months later, another Sending Church began across town.",
  },
  {
    name: "David",
    city: "Dallas, TX",
    quote:
      "The 60-minute format made it simple. I did not need a stage. I needed a Bible and one other person.",
  },
] as const;

export const STAR_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/the-star_entertainment-district_00009.jpg";

export const STAR_VISIT_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/e8dc9c51-ddad-4215-85fb-2bd0f7fe5a00.png";

export const OMNI_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/Omni.png";

export const START_WITH_TWO_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/2.png";

export const GATHERING_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/8299d76d-4aff-4190-8b61-f21b24a8d5fc.png";

export const SEE_DO_SEND_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/Sending2/logos/Bible2.png";

export const ONE_BILLION_LOGO =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/Sending2/logos/1Blogo.png";

export const ONE_BILLION_URL = "https://1Billion.org";

export const BOOK_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/Sending2/logos/book2.png";

export const BOOK_AMAZON_URL =
  "https://www.amazon.com/Sending-Church-Movement-Saved-Trained/dp/B0HLRTWFMS";

export const BOOK_AMAZON_LOGO =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/Book/Amazon-Logo-White-PNG-Image.png";

export const CHURCH_GUIDE_IMAGE =
  "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/Book/Groupme.jpg";

export const PASTORS = {
  jordanImage:
    "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/Jordan/Jordan2.png",
  susieImage:
    "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/Jordan/Susie2.png",
  giveUrl: "https://give.tithe.ly/?formId=d5d258dc-6865-11ee-90fc-1260ab546d11",
  tithelyLogo:
    "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/images/61fbe41d8e639d18d7c516b7_be57441f903d5eb3a34d0c9563110b0d_Logomark.svg",
  address: "11 Cowboys Way, Frisco, TX 75034",
  phone: "949-331-6367",
  phoneHref: "tel:9493316367",
} as const;
