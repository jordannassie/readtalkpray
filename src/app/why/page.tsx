import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { publicMetadata, SITE } from "@/lib/groups/seo";

const WHY_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/WHY.png";
const STORY_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/jordan%202.jpg";
const STAR_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/thestar.png";
const GROUP_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/biblegroup.JPG";
const ATTENDANCE = [2, 4, 2, 14, 30, 20];
const TITLE = "Why Read Talk Pray? | A Church Bigger Than a Building";
const DESCRIPTION = "Discover why Read Talk Pray is rethinking church through simple Bible reading groups, volunteer leadership, real community, and a movement bigger than a building.";

export const metadata: Metadata = {
  ...publicMetadata({ title: TITLE, description: DESCRIPTION, path: "/why" }),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE}/why`,
    siteName: "Read Talk Pray",
    type: "website",
    images: [{ url: WHY_IMAGE, alt: "A comparison of a traditional church service and a Read Talk Pray group gathered around a table" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [WHY_IMAGE],
  },
};

const CONVICTIONS = [
  "Jesus Christ is the head of His Church.",
  "The Bible is our foundation.",
  "Every believer has a place in God's mission.",
  "Local gatherings should remain simple and accessible.",
  "No local group should require a building, mandatory donations, or paid staff to exist.",
  "Leaders are servants, not owners.",
  "Leaders must remain biblically accountable and protect the people they serve.",
  "Local groups should be able to continue even without headquarters.",
  "Money must serve the mission, never replace it.",
  "Success is measured through faithfulness, discipleship, care, and multiplication, not property or institutional power.",
];

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-white text-[#142033]">
      <SiteHeader activeHref="/why" />
      <main>
        <header className="mx-auto max-w-3xl px-5 pt-16 pb-8 text-center sm:pt-24">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#1976F3]">THE WHY BEHIND READ TALK PRAY</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Why Read Talk Pray?</h1>
          <p className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">A Bible Reading Church That&apos;s Bigger Than a Building.</p>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-[#334155]">
            <p>We believe church should be simple enough to gather anywhere, personal enough for everyone to participate, and accessible enough to multiply around the world.</p>
            <p className="font-semibold text-[#142033]">No building required. No paid local staff required. No mandatory donations.</p>
          </div>
        </header>

        <figure className="mx-auto max-w-5xl px-5 pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={WHY_IMAGE}
            alt="A comparison of a traditional church service and a Read Talk Pray group gathered around a table"
            width={1672}
            height={941}
            className="h-auto w-full"
          />
        </figure>

        <section className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#1976F3]">THE STORY BEHIND THE MOVEMENT</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">I Thought I Was Failing as a Pastor.</h2>
          <div className="mt-6 flex items-center gap-4 border-b border-[#e6ebf2] pb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STORY_IMAGE} alt="Jordan Nassie, co-founder of Read Talk Pray" className="h-32 w-32 rounded-2xl object-cover ring-1 ring-[#e6ebf2] sm:h-40 sm:w-40" />
            <div>
              <p className="font-semibold text-[#142033]">Jordan Nassie</p>
              <p className="text-sm text-[#52627a]">Co-founder, Read Talk Pray</p>
            </div>
          </div>

          <div className="mt-8 space-y-5 text-lg leading-8 text-[#334155]">
            <p>For years, I thought I was failing as a pastor.</p>
            <p>I didn&apos;t have a big church building. I didn&apos;t have hundreds of people sitting in rows. I didn&apos;t have a stage, giant screens, professional lighting, or a large staff.</p>
            <p>What I had was something much simpler.</p>
            <Quote>I had people gathering together to read the Bible, every Sunday morning.</Quote>
            <p>We started a Bible reading group at a coffee shop at The Star in Frisco, Texas.</p>
            <p>Nothing fancy. Just ordinary people sitting around a table, drinking coffee, opening their Bibles, talking about life, and praying together.</p>
            <StoryPhoto src={STAR_IMAGE} alt="The Star in Frisco, Texas, where the Sunday morning Bible group began" caption="The Star, Frisco, Texas — where our Sunday morning Bible group began." contained />
            <p>At first, there were just two of us.</p>
            <p>Then four came.</p>
            <p>Then we were back down to two.</p>
            <p>Eventually, we grew to 14, then 30, and sometimes back down to 20.</p>
            <p>Our attendance fluctuated almost every Sunday.</p>
            <AttendanceTrail />
            <p>Some people came once and never returned. Others visited occasionally. Some became regulars, and others brought friends.</p>
            <p>There were Sundays when I wondered whether we were actually growing or going backward.</p>
            <p>And I&apos;ll be honest, sometimes it was discouraging.</p>
            <p>I would see large churches with beautiful buildings, packed auditoriums, impressive stages, and hundreds of people attending every weekend.</p>
            <p>And there I was, sitting around a coffee shop table with a handful of people and an open Bible.</p>
            <p>I wondered whether I was doing something wrong.</p>
            <Quote>Was I really building a church? Or was I just leading a Bible study?</Quote>
            <p>But something beautiful was happening that I almost overlooked.</p>
            <p>People were getting to know one another.</p>
            <p>They were sharing what was happening in their lives.</p>
            <p>They were asking honest questions about God, Scripture, and faith.</p>
            <p>They were encouraging one another, praying together, and developing real friendships.</p>
            <p>People weren&apos;t just attending a service.</p>
            <Quote>They were becoming family.</Quote>
            <StoryPhoto src={GROUP_IMAGE} alt="The Sunday morning coffee shop Bible group gathered around a table" caption="Our Sunday morning coffee shop Bible group." />
            <p>And over the course of a single year, something remarkable happened.</p>
            <p>Although our group might have had only 10, 20, or 30 people around the table on any given Sunday, we had the opportunity to minister to <strong className="font-semibold text-[#142033]">more than 300 people</strong> throughout that year.</p>
            <p>Three hundred people.</p>
            <p>Not because we had a building.</p>
            <p>Not because we had a big budget.</p>
            <p>Not because we had a professional production.</p>
            <p>But because we kept showing up, opening the Bible, welcoming people, and making room at the table.</p>
            <p>That&apos;s when I began to realize something.</p>
            <Quote>Maybe I had been measuring church by the wrong things all along.</Quote>
            <p>I had been measuring success by if we looked like all the mega churches.</p>
            <p>But what if I should have been looking at how many people we were reaching, encouraging, discipling, and connecting with Jesus?</p>
            <p>What if a church didn&apos;t need to grow into one enormous gathering to make an enormous impact?</p>
            <p>What if it could simply keep welcoming people, raising up leaders, and multiplying into other neighborhoods?</p>
            <p>I started thinking about the early church.</p>
            <p>The believers gathered in homes. They shared meals. They devoted themselves to the apostles&apos; teaching, fellowship, and prayer.</p>
            <p>They didn&apos;t need a massive building to be the Church.</p>
            <p>And Jesus didn&apos;t command us to build bigger auditoriums.</p>
            <Quote>He commanded us to make disciples.</Quote>
            <p>Then a new question began forming in my heart.</p>
            <p>What if the very thing I thought made my church small was actually what made it possible to multiply?</p>
            <p>What if ordinary Christians could start Bible reading churches in coffee shops, homes, neighborhoods, and communities all over the world?</p>
            <p>What if we removed the financial barriers?</p>
            <p className="font-semibold text-[#142033]">No building required.</p>
            <p className="font-semibold text-[#142033]">No paid local staff required.</p>
            <p className="font-semibold text-[#142033]">No mandatory donations.</p>
            <p>Just people gathering around God&apos;s Word, building genuine relationships, praying together, and helping others follow Jesus.</p>
            <p>And when a group grows, instead of needing a bigger building, what if we simply help someone start another group?</p>
            <Quote>One group becomes two. Two become four. And the Church keeps multiplying.</Quote>
            <p>That&apos;s the vision behind Read Talk Pray.</p>
            <p>I no longer believe a small gathering is a lesser expression of church simply because it doesn&apos;t have a building.</p>
            <p>I believe something extraordinary can happen when ordinary people gather around the Bible.</p>
            <p>I&apos;ve seen it happen.</p>
            <p>I&apos;ve watched strangers become friends and friends become family.</p>
            <p>And I&apos;ve seen how a simple coffee shop Bible group can touch hundreds of lives.</p>
            <p>Now I dream of seeing that happen in thousands of communities around the world.</p>
            <p>Not because we&apos;re trying to build the biggest institution.</p>
            <p>But because we want to help more people encounter Jesus, discover their purpose, and become disciples who make disciples.</p>
            <Quote>The Church was never meant to be limited by the size of a building.</Quote>
            <p>That&apos;s why we started Read Talk Pray.</p>
            <p className="italic">A Bible Reading Church That&apos;s Bigger Than a Building.</p>
            <p className="pt-2 text-base font-semibold text-[#142033]">
              — Jordan Nassie
              <span className="mt-1 block text-sm font-medium text-[#52627a]">Co-founder, Read Talk Pray</span>
            </p>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-5 pb-20">
          <Section title="The Church Was Never a Building">
            <p>Before church buildings, professional productions, and institutional structures, Christians gathered around Jesus and His Word.</p>
            <p>The early believers met in homes. They shared meals, learned from the apostles&apos; teaching, prayed together, cared for one another, and shared the Gospel.</p>
            <p>Acts 2:42 describes their devotion to the apostles&apos; teaching, fellowship, breaking bread, and prayer.</p>
            <p>Acts 2:46 describes believers meeting from house to house.</p>
            <p>Romans 16:5 mentions a church meeting in a home.</p>
            <p>The Church was a community of believers, not a piece of property.</p>
            <p>Buildings can serve the Church. But buildings do not define the Church.</p>
            <Pull>The Church is people following Jesus.</Pull>
          </Section>

          <Section title="The Lesson from the Methodist Movement">
            <p>In the eighteenth century, John Wesley and the early Methodists helped spread a movement through small gatherings called class meetings.</p>
            <p>Many were led by ordinary laypeople rather than ordained ministers. A new paid pastor was not required for every new group.</p>
            <p>These groups helped people grow through fellowship, prayer, and accountability.</p>
            <p>Simple, reproducible gatherings helped the movement spread.</p>
            <p>The Methodist movement also had clergy, organization, and financial structures. Its history is complex, and paid leadership did not cause the movement to die.</p>
            <Pull>You don&apos;t need a paid professional leading every gathering for discipleship to multiply.</Pull>
          </Section>

          <Section title="What If Every Christian Could Do Ministry?">
            <p>God never intended ministry to belong only to a few professionals.</p>
            <p>Every Christian has gifts. Every Christian has a purpose. Every Christian can encourage someone, pray for someone, share Scripture, serve others, and participate in making disciples.</p>
            <p>Ephesians 4:11–12 describes ministry leadership equipping God&apos;s people for works of service.</p>
            <p>Yet many believers spend years attending church without discovering how they can actively participate in ministry.</p>
            <p>Read Talk Pray is designed to change that.</p>
            <p>Instead of sitting in rows watching a few people lead, we gather around tables where everyone can participate.</p>
            <p>You don&apos;t need a microphone to encourage someone.</p>
            <p>You don&apos;t need a stage to share God&apos;s Word.</p>
            <p>You don&apos;t need a salary to care for people.</p>
            <p>You don&apos;t need a building to gather as the Church.</p>
            <Pull>You have a place at the table.</Pull>
          </Section>

          <Section title="Built to Multiply. Not Built to Maintain.">
            <p>Buildings cost money. Staff require salaries. Facilities need maintenance.</p>
            <p>These things aren&apos;t inherently wrong. Many faithful churches use their resources to do tremendous good.</p>
            <p>But what happens when keeping an institution running becomes more important than reaching and discipling people?</p>
            <p>What happens when a church can&apos;t survive without a constant flow of donations?</p>
            <p>What happens when starting a new church requires hundreds of thousands of dollars?</p>
            <p>We believe there is a simpler way.</p>
            <p>Read Talk Pray churches don&apos;t require buildings, paid local staff, or mandatory donations.</p>
            <p>People can gather anywhere.</p>
            <p>Ordinary believers can lead with biblical accountability.</p>
            <p>New groups can begin without taking on institutional financial obligations.</p>
            <p>Money can help ministry. But ministry should not depend on money to exist.</p>
            <Pull>The mission must always be greater than the organization.</Pull>
          </Section>

          <Section title="Read. Talk. Pray.">
            <p>Three simple practices:</p>
            <ul className="grid gap-4 sm:grid-cols-3">
              <Practice name="Read" body="Open the Bible together and discover what God's Word says." />
              <Practice name="Talk" body="Discuss Scripture honestly, ask questions, encourage one another, and grow in faith." />
              <Practice name="Pray" body="Pray together, care for one another, and put God's Word into action." />
            </ul>
            <p>Groups can meet in homes, coffee shops, community spaces, parks, or wherever people can gather safely.</p>
            <p>No dedicated building required.</p>
            <p>No mandatory donations.</p>
            <p>No required paid local staff.</p>
            <p>No membership fee.</p>
            <p>Groups are led by approved, accountable volunteer leaders who agree to our biblical beliefs and leadership commitments.</p>
          </Section>

          <Section title="One Group Can Become Many.">
            <p>Imagine five friends gathering around a Bible.</p>
            <p>They read, talk, and pray together.</p>
            <p>Their faith grows. Their relationships deepen. They invite others.</p>
            <p>Eventually, someone who has experienced the group is equipped and approved to start another.</p>
            <p>One becomes two. Two can become four.</p>
            <p>This is a vision of multiplication, not a promise of automatic growth.</p>
            <p>No new building needs to be purchased.</p>
            <p>No new salaried pastor needs to be hired.</p>
            <p>Every new gathering can begin simply.</p>
            <Pull>Join One. Then Start One.</Pull>
          </Section>

          <Section title="Protecting the Movement for Future Generations">
            <p>We believe:</p>
            <ul className="space-y-3">
              {CONVICTIONS.map((item) => (
                <li key={item} className="border-l-2 border-[#1976F3] pl-4">{item}</li>
              ))}
            </ul>
            <Pull>The mission must always be greater than the organization.</Pull>
            <p>This is an introduction to the Founding Covenant, not the complete legal or doctrinal covenant.</p>
          </Section>

          <Section title="A Bible Reading Church That's Bigger Than a Building.">
            <p>Imagine communities of believers gathering around God&apos;s Word in cities, towns, villages, and neighborhoods around the world.</p>
            <p>Not because someone raised millions to construct buildings.</p>
            <p>Not because every gathering could afford a professional pastor.</p>
            <p>But because ordinary people chose to follow Jesus together.</p>
            <p>We don&apos;t need to build the biggest institution.</p>
            <p>We want to help people become disciples who make disciples.</p>
            <p>A church without walls.</p>
            <p>A movement that can multiply.</p>
            <p>A Bible reading church that&apos;s bigger than a building.</p>
          </Section>

          <section className="mt-16 border-t border-[#e6ebf2] pt-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Church Can Start Around a Table.</h2>
            <div className="mx-auto mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-[#334155]">
              <p>You don&apos;t need a building to gather as the Church.</p>
              <p>You don&apos;t need to be a professional pastor to help others grow in faith.</p>
              <p>You can begin by joining a Bible reading group, building relationships, and discovering what God can do through ordinary people.</p>
            </div>
            <p className="mt-6 text-xl font-semibold">Join One. Then Start One.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/#groups" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1976F3] px-6 text-sm font-semibold text-white sm:w-auto">
                Find a Bible Group
              </Link>
              <Link href="/app/start" className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#1976F3] bg-white px-6 text-sm font-semibold text-[#1976F3] sm:w-auto">
                Start a Group
              </Link>
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-16 border-t border-[#e6ebf2] pt-16">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <div className="mt-6 space-y-4 text-lg leading-relaxed text-[#334155]">{children}</div>
    </section>
  );
}

function Pull({ children }: { children: ReactNode }) {
  return <p className="text-xl font-semibold tracking-tight text-[#142033]">{children}</p>;
}

function Quote({ children }: { children: ReactNode }) {
  return <p className="border-l-2 border-[#1976F3] pl-4 text-xl font-semibold leading-snug tracking-tight text-[#142033]">{children}</p>;
}

function StoryPhoto({ src, alt, caption, contained = false }: { src: string; alt: string; caption: string; contained?: boolean }) {
  return (
    <figure className="py-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={contained ? "mx-auto h-auto w-full max-w-md rounded-2xl ring-1 ring-black/5" : "h-auto w-full rounded-2xl ring-1 ring-black/5"} />
      <figcaption className="mt-2.5 text-sm leading-relaxed text-[#52627a]">{caption}</figcaption>
    </figure>
  );
}

function AttendanceTrail() {
  return (
    <div className="rounded-2xl bg-[#f4f7fb] px-4 py-5 sm:px-6">
      <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
        {ATTENDANCE.map((count, index) => (
          <li key={`${count}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-sm font-semibold text-[#1976F3]" aria-hidden>→</span> : null}
            <span className="grid h-11 min-w-11 place-items-center rounded-xl bg-white px-2.5 text-lg font-semibold text-[#142033] ring-1 ring-[#e6ebf2]">{count}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-center text-sm text-[#52627a]">Our Sunday attendance went up and down.</p>
    </div>
  );
}

function Practice({ name, body }: { name: string; body: string }) {
  return (
    <li className="rounded-3xl border border-[#e6ebf2] bg-[#f8fafc] p-5">
      <p className="text-sm font-semibold tracking-[0.14em] text-[#1976F3]">{name.toUpperCase()}</p>
      <p className="mt-2 text-base leading-relaxed text-[#334155]">{body}</p>
    </li>
  );
}
