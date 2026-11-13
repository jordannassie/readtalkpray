import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export const BELIEFS = [
  {
    title: "The Bible",
    body: "We believe the Bible is inspired by God and is our authority for faith, doctrine, and Christian living.",
    scripture: "2 Timothy 3:16–17; 2 Peter 1:20–21",
  },
  {
    title: "One God",
    body: "We believe there is one God, eternally existing as Father, Son, and Holy Spirit.",
    scripture: "Deuteronomy 6:4; Matthew 28:19",
  },
  {
    title: "Jesus Christ",
    body: "We believe Jesus Christ is fully God and fully man. He lived a sinless life, died on the cross for our sins, and rose bodily from the dead. He is the only way to salvation.",
    scripture: "John 1:1–14; John 14:6; 1 Corinthians 15:3–4",
  },
  {
    title: "Sin and Salvation",
    body: "We believe all people have sinned and need salvation. Salvation is God's gift of grace, received through repentance and faith in Jesus Christ, not earned through good works.",
    scripture: "Romans 3:23; Ephesians 2:8–9; Romans 10:9–13",
  },
  {
    title: "The Holy Spirit",
    body: "We believe the Holy Spirit lives in believers, empowers them to share the gospel, produces Christlike character, and equips them for ministry.",
    scripture: "Acts 1:8; Galatians 5:22–23; 1 Corinthians 12:4–7",
  },
  {
    title: "The Church",
    body: "We believe the church is the body of Christ. Believers gather together to study Scripture, pray, worship, celebrate communion, care for one another, make disciples, and share the gospel.",
    scripture: "Acts 2:42–47; 1 Corinthians 12:12–27",
  },
  {
    title: "Baptism and Communion",
    body: "We believe followers of Jesus should be baptized in obedience to His command. We celebrate the Lord's Supper regularly to remember His sacrifice.",
    scripture: "Matthew 28:19; Acts 2:41; 1 Corinthians 11:23–26",
  },
  {
    title: "The Great Commission",
    body: "We believe every follower of Jesus is called to make disciples, baptize believers, and teach others to obey everything Jesus commanded.",
    scripture: "Matthew 28:18–20",
  },
  {
    title: "The Return of Christ",
    body: "We believe Jesus Christ will return, the dead will be raised, and those who belong to Him will receive eternal life.",
    scripture: "John 11:25–26; 1 Thessalonians 4:16–17",
  },
] as const;

const DNA = [
  ["Radical Simplicity", "Keep church simple and reproducible."],
  ["Everyone Practices", "Every believer participates in ministry."],
  ["Leaders Reproduce Leaders", "Every leader develops other leaders."],
  ["Move People to Mission", "Help believers actively follow Jesus and reach others."],
  ["Churches Reproduce Churches", "Healthy churches start new churches."],
  ["Scripture First", "God's Word guides everything we do."],
  ["Short Runway", "Equip people to begin without unnecessary delays or barriers."],
  ["Local Ownership", "Every group is locally led."],
  ["Healthy Reproduction", "Multiply biblical, healthy churches and leaders."],
] as const;

function Dropdown({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-[24px] border border-white/15 bg-transparent open:border-white/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-lg font-semibold tracking-tight text-white sm:px-7 sm:text-xl [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sending-blue)]">
        {title}
        <ChevronDown
          aria-hidden
          size={20}
          className="shrink-0 text-[var(--sending-blue)] transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-7 sm:px-7">{children}</div>
    </details>
  );
}

function Scripture({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-sm text-white/45">
      <span className="font-medium text-white/60">Scripture: </span>
      {children}
    </p>
  );
}

export function Beliefs() {
  return (
    <section id="beliefs" className="scroll-mt-28 bg-black py-16 text-white sm:py-20">
      <div className="mx-auto max-w-3xl px-5">
        <p className="text-xs font-medium tracking-[0.2em] text-white/45 uppercase">
          Read Talk Pray
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Our Beliefs and Church Structure
        </h2>

        <div className="mt-10 space-y-4">
          <Dropdown title="Our Beliefs">
            <h3 className="text-sm font-semibold tracking-[0.16em] text-white uppercase">
              Our Statement of Faith
            </h3>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              We believe the Bible is God&apos;s Word, Jesus Christ is Lord, and
              every believer is called to follow Jesus, make disciples, and
              share the gospel with the world.
            </p>
            <ol className="mt-8 space-y-6">
              {BELIEFS.map((item, index) => (
                <li key={item.title}>
                  <h4 className="text-base font-semibold tracking-tight text-white">
                    {index + 1}. {item.title}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-white/75">
                    {item.body}
                  </p>
                  <Scripture>{item.scripture}</Scripture>
                </li>
              ))}
            </ol>
          </Dropdown>

          <Dropdown title="Church Structure">
            <h3 className="text-sm font-semibold tracking-[0.16em] text-white uppercase">
              A simple way to follow Jesus together
            </h3>
            <p className="mt-4 text-base font-semibold tracking-tight text-white">
              Scripture. Jesus. Prayer. Discipleship.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Read Talk Pray is an open Bible study network. Groups gather around
              Scripture, follow Jesus, pray, and help others grow. Anyone can
              join. Anyone can learn the method and start another group.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              It is a simple discipleship model that churches and individuals
              can use. It is not a replacement for the responsibilities of a
              healthy local church.
            </p>
            <p className="mt-4 text-sm text-white/75">A group follows three steps:</p>
            <p className="mt-3 space-y-1 text-sm font-semibold tracking-tight text-white">
              <span className="block">READ the Bible together.</span>
              <span className="block">TALK about what it means.</span>
              <span className="block">PRAY and take a next step.</span>
            </p>

            <div className="mt-8 space-y-7 text-sm leading-relaxed text-white/75">
              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">
                  Locally led Bible studies
                </h4>
                <p className="mt-2">
                  Each Read Talk Pray group is locally led. The leader is
                  responsible for the gathering, the conversation, and the
                  care of the people who come.
                </p>
                <p className="mt-2">
                  A group can meet in a home, a coffee shop, a workplace, or
                  anywhere people can open the Bible. It does not need a
                  building, a budget, or paid staff.
                </p>
                <p className="mt-2">
                  Ordinary Christians can follow Jesus, read Scripture with
                  others, pray, and help someone else learn to do the same.
                  Baptism, communion, and the ongoing care of a congregation
                  belong with a healthy local church.
                </p>
                <Scripture>Acts 2:42–47; Matthew 18:20; 1 Peter 2:9</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">
                  Connected and Accountable
                </h4>
                <p className="mt-2">
                  Groups share this statement of faith and a simple way of
                  meeting. Leaders remain accountable to Scripture and, where
                  they belong to one, to their local church.
                </p>
                <p className="mt-2">
                  Local autonomy does not mean independence from biblical
                  accountability.
                </p>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">
                  Biblical Leadership
                </h4>
                <p className="mt-2">
                  Group leaders are called to live lives that reflect Jesus Christ.
                </p>
                <p className="mt-2">
                  Leaders must demonstrate biblical character, humility,
                  integrity, sound doctrine, servant leadership, and
                  faithfulness to Scripture.
                </p>
                <p className="mt-2">
                  Leadership is about serving people, not controlling them.
                </p>
                <Scripture>
                  1 Timothy 3:1–7; Titus 1:5–9; 1 Peter 5:2–3
                </Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">
                  Biblical Accountability and Church Discipline
                </h4>
                <p className="mt-2">
                  Leaders are accountable to Scripture and to the people they serve.
                </p>
                <p className="mt-2">
                  Leaders who persist in unrepentant sin, teach false doctrine,
                  engage in serious misconduct, or reject biblical
                  accountability may be removed from leadership and may no
                  longer be recognized with Read Talk Pray.
                </p>
                <p className="mt-2">
                  Biblical correction should be handled fairly, with truth,
                  appropriate witnesses, and a desire for repentance and
                  restoration wherever possible. Protecting people and
                  maintaining sound biblical teaching are essential.
                </p>
                <Scripture>
                  Matthew 18:15–17; 1 Timothy 5:19–21; Titus 1:9; Romans
                  16:17; Galatians 6:1
                </Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">
                  How Our Churches Gather
                </h4>
                <p className="mt-2">
                  Groups follow a simple gathering:
                </p>
                <p className="mt-2 font-semibold tracking-tight text-white">
                  READ → TALK → PRAY
                </p>
                <p className="mt-2">
                  Groups study the Bible book by book and chapter by chapter,
                  keeping Jesus and Scripture at the center.
                </p>
                <p className="mt-2">Every group shares the gospel using:</p>
                <p className="mt-2 font-semibold tracking-tight text-white">
                  LOVE → SIN → JESUS → PRAY
                </p>
                <p className="mt-2">
                  People are invited to follow Jesus, take a next step with a
                  local church, and eventually help lead another group.
                </p>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">
                  Our Nine DNA Values
                </h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-white">
                  {DNA.map(([title, body]) => (
                    <li key={title} className="pl-1">
                      <span className="font-semibold text-white">{title}</span>
                      {" — "}
                      {body}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">
                  Our Commitment to Multiplication
                </h4>
                <p className="mt-2">
                  Anyone can learn this method and help someone else follow Jesus.
                </p>
                <p className="mt-2">
                  Join a group. Practice Read. Talk. Pray. Invite someone else.
                  Start another group.
                </p>
                <p className="mt-2">
                  Foundations is 52 weekly lessons over one year. People can
                  participate, serve, and develop while completing Foundations.
                  Completing the course alone does not qualify someone to lead.
                </p>
                <p className="mt-2">
                  We measure success not simply by how many people gather, but
                  by disciples made, believers baptized, leaders developed, and
                  new churches started.
                </p>
                <p className="mt-4 font-semibold tracking-tight text-white">
                  Every believer equipped. Every church locally led. Every
                  church multiplying.
                </p>
                <p className="mt-3 font-semibold tracking-tight text-white">
                  READ. TALK. PRAY.
                </p>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </section>
  );
}
