import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { scriptureHref } from "@/lib/christianity/articles";
import { publicMetadata, SITE } from "@/lib/groups/seo";

const WHY_IMAGE = "https://eeeprmtermreavivzswn.supabase.co/storage/v1/object/public/STORAGE/readtalkpray/FAQ/WHY.png";
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
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Why We&apos;re Rethinking Church.</h1>
          <p className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">A Bible Reading Church That&apos;s Bigger Than a Building.</p>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 text-lg leading-relaxed text-[#334155]">
            <p>What if starting a church didn&apos;t require a building, a budget, or a paid pastor?</p>
            <p>What if ordinary believers could gather anywhere, open the Bible, build real relationships, pray together, and multiply communities around the world?</p>
            <p className="font-semibold text-[#142033]">We believe they can.</p>
          </div>
        </header>

        <figure className="mx-auto max-w-5xl px-5 pb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={WHY_IMAGE}
            alt="A comparison of a traditional church service and a Read Talk Pray group gathered around a table"
            width={1672}
            height={941}
            className="h-auto w-full"
          />
        </figure>

        <article className="mx-auto max-w-3xl px-5 pb-20">
          <Section title="The Church Was Never a Building">
            <p>Before church buildings, professional productions, and institutional structures, Christians gathered around Jesus and His Word.</p>
            <p>The early believers met in homes. They shared meals, learned from the apostles&apos; teaching, prayed together, cared for one another, and shared the Gospel.</p>
            <p><Verse reference="Acts 2:42" /> describes their devotion to the apostles&apos; teaching, fellowship, breaking bread, and prayer.</p>
            <p><Verse reference="Acts 2:46" /> describes believers meeting from house to house.</p>
            <p><Verse reference="Romans 16:5" /> mentions a church meeting in a home.</p>
            <p>The Church was a community of believers, not a piece of property.</p>
            <p>Buildings can serve the Church. But buildings do not define the Church.</p>
            <Pull>The Church is people following Jesus.</Pull>
          </Section>

          <Section title="When Did Church Become Something We Attend?">
            <p>Many churches today are organized around a weekly event.</p>
            <p>People arrive, sit in rows, listen to worship music and a sermon, and go home.</p>
            <p>There is value in corporate worship, preaching, and pastoral leadership. We honor the many faithful pastors and congregations serving people around the world.</p>
            <p>But we believe something essential can be lost when most people become spectators rather than active participants.</p>
            <p>Every Christian has gifts. Every Christian can pray. Every Christian can encourage someone. Every Christian can share Scripture, serve others, and participate in making disciples.</p>
            <p><Verse reference="1 Corinthians 14:26" /> describes believers contributing to their gatherings.</p>
            <p><Verse reference="Ephesians 4:11–12" /> describes ministry leadership equipping God&apos;s people for works of service.</p>
            <Pull>Church should not simply be something you attend. It should be a community where you belong, grow, and participate.</Pull>
          </Section>

          <Section title="The Lesson from the Methodist Movement">
            <p>In the eighteenth century, John Wesley and the early Methodists helped spread a movement through small gatherings called class meetings.</p>
            <p>Many were led by ordinary laypeople rather than ordained ministers.</p>
            <p>These groups provided spiritual accountability, encouragement, prayer, and practical discipleship.</p>
            <p>The movement could expand without appointing a new paid minister for every small gathering.</p>
            <p>The Methodist movement also had clergy, organization, and financial structures. Its history is complex, and we should not claim that paid leadership caused its eventual institutional development or decline.</p>
            <p>But one lesson remains powerful:</p>
            <Pull>You don&apos;t need a paid professional leading every gathering for discipleship to multiply.</Pull>
            <Source href="https://www.umc.org/en/content/ask-the-umc-how-did-john-wesley-empower-lay-people">United Methodist Church: how John Wesley empowered laypeople</Source>
          </Section>

          <Section title="The Lesson from the Cell Church Movement">
            <p>Yoido Full Gospel Church in South Korea became one of the world&apos;s largest congregations.</p>
            <p>Its growth was supported by thousands of small groups meeting in homes and other everyday locations.</p>
            <p>Ordinary believers were equipped to lead, care for people, pray, study Scripture, and share the Gospel.</p>
            <p>The church also maintained large gatherings, paid pastors, and organizational structures.</p>
            <p>The lesson isn&apos;t that every successful church eliminated paid leadership.</p>
            <p>The lesson is that ministry could be shared with thousands of ordinary believers.</p>
            <Pull>The movement multiplied because ministry wasn&apos;t limited to one person standing on a stage.</Pull>
            <Source href="https://english.fgtv.com/a04/01.asp">Yoido Full Gospel Church: the cell group story</Source>
          </Section>

          <Section title="What Happens When a Church Can't Survive Without Money?">
            <p>Buildings require mortgages or rent.</p>
            <p>Facilities require maintenance.</p>
            <p>Staff require salaries.</p>
            <p>Programs require budgets.</p>
            <p>None of these things is inherently wrong. Money can be used generously and faithfully to serve people.</p>
            <p>But financial dependence can create a dangerous pressure.</p>
            <p>What happens when a church must keep raising money simply to keep its doors open?</p>
            <p>What happens when maintaining the organization begins competing with caring for people?</p>
            <p>What happens when church planting becomes too expensive for ordinary believers to attempt?</p>
            <p>We believe the mission should never become dependent on maintaining an expensive institution.</p>
            <Pull>Money can serve the Church. But the Church must never exist to serve money.</Pull>
            <p>Read Talk Pray is designed to remove unnecessary financial barriers from local church gatherings.</p>
          </Section>

          <Section title="Everyone Has a Place at the Table.">
            <p>At Read Talk Pray, you don&apos;t need a stage to participate.</p>
            <p>You don&apos;t need a microphone to encourage someone.</p>
            <p>You don&apos;t need a salary to care for people.</p>
            <p>You don&apos;t need a building to gather around Scripture.</p>
            <p>You can read the Bible together.</p>
            <p>You can ask questions and talk about what it means.</p>
            <p>You can pray for one another.</p>
            <p>You can build friendships, serve your community, share Jesus, and help others grow.</p>
            <p>We believe every Christian has a meaningful part to play.</p>
            <Pull>No spectators required. Everyone has a purpose.</Pull>
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
              <p>You don&apos;t have to wait for a building.</p>
              <p>You don&apos;t have to be a professional minister.</p>
              <p>You can begin by joining others who want to read the Bible, talk about life and faith, and pray together.</p>
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

function Verse({ reference }: { reference: string }) {
  const href = scriptureHref(reference);
  if (!href) return <span className="font-semibold text-[#142033]">{reference}</span>;
  return <Link href={href} className="font-semibold text-[#1976F3] underline decoration-[#1976F3]/30 underline-offset-2">{reference}</Link>;
}

function Source({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p className="text-sm">
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#52627a] underline decoration-[#52627a]/40 underline-offset-2">
        {children}
      </a>
    </p>
  );
}
