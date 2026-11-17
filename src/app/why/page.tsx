import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { publicMetadata, SITE } from "@/lib/groups/seo";

const WHY_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/WHY.png";
const STORY_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/jordan%202.jpg";
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

        <section className="mx-auto max-w-5xl px-5 py-16">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#1976F3]">THE STORY BEHIND THE MOVEMENT</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">I Thought I Was Failing as a Pastor.</h2>
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={STORY_IMAGE}
                alt="Jordan Nassie, founder of Read Talk Pray"
                className="h-auto w-full rounded-3xl"
              />
              <figcaption className="mt-3 text-sm font-semibold text-[#142033]">Jordan Nassie — Founder, Read Talk Pray</figcaption>
            </figure>
            <div className="space-y-4 text-lg leading-relaxed text-[#334155]">
              <p>For years, I thought I was failing as a pastor.</p>
              <p>I didn&apos;t have a big church building. I didn&apos;t have hundreds of people sitting in rows. I didn&apos;t have a stage, giant screens, professional lighting, or a large staff.</p>
              <p>I had something much simpler.</p>
              <p>I had people gathering together to read the Bible.</p>
              <p>And if I&apos;m being transparent, sometimes that made me feel like I wasn&apos;t succeeding.</p>
              <p>I would look at large churches with beautiful buildings, packed auditoriums, and professional productions and wonder why my ministry didn&apos;t look like that.</p>
              <p>But something incredible was happening in our small Bible groups.</p>
              <p>People were reading God&apos;s Word. They were asking questions. They were praying for one another. They were building real friendships and growing in their faith.</p>
              <p>Lives were being changed.</p>
              <p>And one day, I began asking myself a different question.</p>
              <Pull>What if I wasn&apos;t failing at building a church? What if I had been measuring church by the wrong things?</Pull>
              <p>Jesus never told us to build bigger buildings. He told us to make disciples.</p>
              <p>The early believers gathered in homes, shared meals, prayed together, and devoted themselves to the apostles&apos; teaching.</p>
              <p>They didn&apos;t need a stage to worship Jesus.</p>
              <p>They didn&apos;t need a building to become a church.</p>
              <p>And they didn&apos;t need a paid professional leading every gathering to care for one another and grow in faith.</p>
              <p>That&apos;s when I began to see something differently.</p>
              <Pull>What if the very thing I thought made my church small was actually what could make it multiply?</Pull>
              <p>What if ordinary Christians everywhere could gather around a Bible, build relationships, pray together, and help others do the same?</p>
              <p>What if starting a church didn&apos;t require raising money, purchasing property, or hiring staff?</p>
              <p>What if the Church could be bigger than a building?</p>
              <p>That vision became Read Talk Pray.</p>
              <p>Not another institution to maintain.</p>
              <p>Not another building to finance.</p>
              <p>But a simple way for people everywhere to gather around God&apos;s Word, follow Jesus, and make disciples.</p>
              <p>My dream is to see Bible reading churches multiplying in homes, coffee shops, neighborhoods, cities, and villages around the world.</p>
              <p>Because I believe the Church was never meant to be limited by the size of a building.</p>
              <Pull>The Church is people following Jesus.</Pull>
              <p>And everyone has a place at the table.</p>
              <p className="pt-2 text-base font-semibold text-[#142033]">
                Jordan Nassie
                <span className="mt-1 block text-sm font-medium text-[#52627a]">Founder, Read Talk Pray</span>
              </p>
            </div>
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

function Practice({ name, body }: { name: string; body: string }) {
  return (
    <li className="rounded-3xl border border-[#e6ebf2] bg-[#f8fafc] p-5">
      <p className="text-sm font-semibold tracking-[0.14em] text-[#1976F3]">{name.toUpperCase()}</p>
      <p className="mt-2 text-base leading-relaxed text-[#334155]">{body}</p>
    </li>
  );
}
