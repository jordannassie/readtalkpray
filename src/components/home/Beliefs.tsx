import type { ReactNode } from "react";
import Link from "next/link";
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
          Our Beliefs & Leadership
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
            <h3 className="text-base font-semibold tracking-tight text-white">
              A Bible Reading Church That&apos;s Bigger Than a Building.
            </h3>
            <p className="mt-4 text-sm font-semibold tracking-tight text-white">
              Scripture. Jesus. Prayer. Discipleship.
            </p>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/75">
              <p>Read Talk Pray is a worldwide network of locally led Bible-reading churches.</p>
              <p>
                We believe the church is not a building but a community of believers gathering in Jesus&apos; name, devoted to God&apos;s Word, prayer, fellowship, caring for one another, and making disciples.
              </p>
              <p>Our groups gather in homes, coffee shops, workplaces, and communities. We follow a simple model:</p>
              <p className="space-y-1 font-semibold tracking-tight text-white">
                <span className="block">READ — Read the Bible together.</span>
                <span className="block">TALK — Discuss what Scripture means and how to follow Jesus.</span>
                <span className="block">PRAY — Pray for one another and take the next step in faith.</span>
              </p>
              <p>Anyone is welcome, including people exploring Christianity for the first time.</p>
              <p>Our vision is to see healthy, biblical communities of believers multiplying around the world.</p>
              <p>No building. No paid staff required. No donations required to participate. Just people following Jesus together.</p>
            </div>
            <Scripture>Acts 2:42–47; Matthew 18:20; 1 Corinthians 12:27; Colossians 3:16</Scripture>

            <div className="mt-8 space-y-8 text-sm leading-relaxed text-white/75">
              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">1. Our Biblical Foundation</h4>
                <p className="mt-2">Read Talk Pray seeks to follow the example of the New Testament church through simple gatherings, biblical leadership, shared life, and a commitment to making disciples.</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">The Church Is God&apos;s People</h5>
                <p className="mt-2">The New Testament describes believers as the body of Christ, God&apos;s household, and living stones being built into a spiritual house.</p>
                <p className="mt-2">The church is a people united in Christ, not a particular physical building.</p>
                <Scripture>1 Corinthians 12:27; Ephesians 2:19–22; 1 Peter 2:5</Scripture>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Churches Can Gather Anywhere</h5>
                <p className="mt-2">The early church gathered in homes and shared life together. Paul even referred to congregations meeting in homes as churches.</p>
                <p className="mt-2">Read Talk Pray churches can gather in homes, coffee shops, workplaces, or other welcoming places.</p>
                <p className="mt-2">A dedicated church building is not required.</p>
                <Scripture>Acts 2:46; Romans 16:5; 1 Corinthians 16:19; Colossians 4:15; Philemon 1:2</Scripture>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Scripture, Fellowship, and Prayer Are Central</h5>
                <p className="mt-2">The earliest Christians devoted themselves to the apostles&apos; teaching, fellowship, breaking bread, and prayer.</p>
                <p className="mt-2">Our gatherings keep Scripture, Jesus, fellowship, and prayer at the center.</p>
                <Scripture>Acts 2:42–47; Colossians 3:16; 1 Timothy 4:13</Scripture>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Biblical Leadership Matters</h5>
                <p className="mt-2">New Testament churches appointed qualified elders to shepherd and care for believers.</p>
                <p className="mt-2">Read Talk Pray groups are locally led and connected to ministry oversight for prayer, encouragement, guidance, and biblical accountability.</p>
                <Scripture>Acts 14:23; Titus 1:5–9; 1 Peter 5:2–3</Scripture>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Disciples Make Disciples</h5>
                <p className="mt-2">Jesus commissioned His followers to make disciples, baptize them, and teach them to obey His commands.</p>
                <p className="mt-2">We want every believer to grow in faith and become equipped to help others follow Jesus.</p>
                <Scripture>Matthew 28:19–20; 2 Timothy 2:2</Scripture>
                <p className="mt-3 text-white/55">These passages support our foundational church practices. The exact one-hour READ → TALK → PRAY schedule, administrative structure, and monthly Zoom gatherings are Read Talk Pray&apos;s practical ministry methods, not commands that Scripture requires every church to follow.</p>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">2. How Our Churches Gather</h4>
                <p className="mt-2">Every Read Talk Pray group follows a simple, repeatable gathering centered on Scripture and Jesus Christ.</p>
                <p className="mt-3 font-semibold tracking-tight text-white">READ → TALK → PRAY</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Read the Bible Together</h5>
                <p className="mt-2">Open with prayer, asking God to speak through His Word.</p>
                <p className="mt-2">Read through the Bible book by book and chapter by chapter, taking turns reading aloud.</p>
                <p className="mt-2">Pause naturally as you go so everyone can follow along.</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Talk About Scripture</h5>
                <p className="mt-2">Discuss what you have read.</p>
                <p className="mt-2">Ask simple questions:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>What stands out?</li>
                  <li>What does this passage teach us about God?</li>
                  <li>What does it reveal about Jesus?</li>
                  <li>How can we apply it to our lives?</li>
                </ul>
                <p className="mt-2">Everyone is encouraged to participate, ask honest questions, and grow.</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Pray Together</h5>
                <p className="mt-2">End by praying for one another, the group, and people who do not yet know Jesus.</p>
                <p className="mt-2">Encourage everyone to take a next step of faith.</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Meeting Format</h5>
                <p className="mt-2">Most groups gather for approximately one hour.</p>
                <p className="mt-2">They may meet on any day, at any time, in homes, coffee shops, workplaces, or welcoming public locations.</p>
                <p className="mt-2">There is no mandatory building, admission fee, or paid staff requirement.</p>
                <Scripture>Acts 2:42–47; Matthew 18:20; Colossians 3:16</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">3. Locally Led Bible Groups</h4>
                <p className="mt-2">Every Read Talk Pray group has an approved local leader responsible for welcoming people, facilitating Scripture reading, encouraging discussion, and caring for those who attend.</p>
                <p className="mt-2">Groups may also have a co-leader, such as a spouse or another Christian helping lead the gathering.</p>
                <p className="mt-2">All leaders must personally affirm our Statement of Christian Faith and agree to our Leader Commitments.</p>
                <p className="mt-2">We expect our leaders to demonstrate biblical character, humility, integrity, sound doctrine, faithfulness to Scripture, and servant leadership.</p>
                <p className="mt-2">Leadership is about serving people, not controlling them.</p>
                <Scripture>1 Timothy 3:1–7; Titus 1:5–9; 1 Peter 5:2–3</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">4. Connected Leadership &amp; Oversight</h4>
                <h5 className="mt-3 text-sm font-semibold tracking-tight text-white">You&apos;re Not Leading Alone.</h5>
                <p className="mt-2">Every approved Read Talk Pray group will be connected with a ministry overseer as our leadership network develops.</p>
                <p className="mt-2">Overseers provide:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Prayer and encouragement</li>
                  <li>Biblical guidance</li>
                  <li>Leadership accountability</li>
                  <li>Help with questions and challenges</li>
                  <li>Support for healthy discipleship and group growth</li>
                </ul>
                <p className="mt-2">Group leaders remain responsible for their local gatherings while staying connected to the wider Read Talk Pray leadership network.</p>
                <p className="mt-2">This structure seeks to combine local ownership with shared biblical accountability.</p>
                <p className="mt-2">No leader should have to carry the responsibility of ministry alone.</p>
                <Scripture>Acts 14:23; Titus 1:5; 1 Peter 5:2–3; Hebrews 13:17</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">5. Monthly Leadership Gatherings</h4>
                <p className="mt-2">All approved group leaders commit to participating in monthly online Read Talk Pray leadership gatherings.</p>
                <p className="mt-2">Through Zoom, leaders can:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Pray together</li>
                  <li>Share testimonies</li>
                  <li>Encourage one another</li>
                  <li>Receive biblical teaching and leadership guidance</li>
                  <li>Discuss questions and ministry challenges</li>
                  <li>Learn how to help others start groups</li>
                </ul>
                <p className="mt-2">These gatherings help leaders remain supported, accountable, and connected as the movement grows.</p>
                <p className="mt-2 text-white/55">Monthly Zoom gatherings are our chosen way for leaders to stay connected. They are not a command that Scripture requires every church to follow.</p>
                <Scripture>Hebrews 10:24–25; 2 Timothy 2:2; Acts 15:30–32</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">6. Baptism, Communion &amp; Spiritual Care</h4>
                <p className="mt-2">We believe the life of the church includes more than a weekly Bible discussion.</p>
                <p className="mt-2">Jesus commands His followers to make disciples and baptize believers. The New Testament also teaches believers to remember Christ through the Lord&apos;s Supper and to care for one another.</p>
                <p className="mt-2">Read Talk Pray is committed to supporting:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Biblical baptism</li>
                  <li>The Lord&apos;s Supper</li>
                  <li>Prayer and pastoral care</li>
                  <li>Fellowship and mutual encouragement</li>
                  <li>Teaching and discipleship</li>
                  <li>Caring for people in need</li>
                </ul>
                <p className="mt-2">These responsibilities are carried out with appropriate biblical leadership and ministry oversight.</p>
                <p className="mt-2">Individual one-hour group meetings do not need to contain every church practice each week.</p>
                <p className="mt-2">Read Talk Pray leadership will provide guidance on how groups practice baptism, communion, and pastoral care in a biblically responsible way.</p>
                <Scripture>Matthew 28:19–20; Acts 2:38–42; 1 Corinthians 11:23–26; James 5:14–16</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">7. Biblical Accountability</h4>
                <p className="mt-2">Leaders are accountable to Scripture, Read Talk Pray ministry leadership, and the people they serve.</p>
                <p className="mt-2">Leaders who persist in serious unrepentant sin, teach doctrine contrary to our Statement of Christian Faith, engage in serious misconduct, or reject biblical accountability may have their recognition or leadership approval suspended or removed following an appropriate review.</p>
                <p className="mt-2">Biblical correction should be handled fairly, with truth, appropriate witnesses, concern for those affected, and a desire for repentance and restoration wherever appropriate.</p>
                <p className="mt-2">Protecting people and maintaining sound biblical teaching are essential.</p>
                <Scripture>Matthew 18:15–17; 1 Timothy 5:19–21; Titus 1:9; Galatians 6:1</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">8. Sharing Jesus</h4>
                <p className="mt-2">Read Talk Pray exists to help people discover Jesus, understand the gospel, and grow in a personal relationship with Him.</p>
                <p className="mt-2">Anyone is welcome to attend and ask honest questions about Christianity.</p>
                <p className="mt-2">We share the gospel through four simple truths:</p>
                <p className="mt-3 font-semibold tracking-tight text-white">LOVE → SIN → JESUS → PRAY</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Love</h5>
                <p className="mt-2">God loves us and created us for a relationship with Him.</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Sin</h5>
                <p className="mt-2">Sin separates us from God, and we all need forgiveness.</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Jesus</h5>
                <p className="mt-2">Jesus Christ died for our sins and rose again, offering forgiveness and eternal life.</p>
                <h5 className="mt-4 text-sm font-semibold tracking-tight text-white">Pray</h5>
                <p className="mt-2">We invite people to repent, believe in Jesus Christ, and respond to Him in faith and prayer.</p>
                <p className="mt-2">We encourage new believers to grow in Scripture, be baptized, and help others discover Jesus.</p>
                <Scripture>John 3:16; Romans 3:23; Romans 10:9–13; 1 Corinthians 15:3–4; Matthew 28:19–20</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">9. Our Nine DNA Values</h4>
                <p className="mt-2">These nine principles help guide how Read Talk Pray churches grow, lead, serve, and multiply.</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-white">
                  {DNA.map(([title, body]) => (
                    <li key={title} className="pl-1">
                      <span className="font-semibold text-white">{title}</span>
                      {" — "}
                      {body}
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-white/55">These nine values are our ministry principles. The Bible does not present this exact numbered list.</p>
                <Scripture>Acts 2:42–47; Matthew 28:19–20; 2 Timothy 2:2; Titus 1:5; 1 Peter 5:2–3</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">10. Our Commitment to Multiplication</h4>
                <p className="mt-2">We believe every follower of Jesus can grow in faith and help someone else discover Christ.</p>
                <p className="mt-2">Our process is simple:</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-white">
                  <li className="pl-1"><span className="font-semibold text-white">Join a Group.</span> Find a welcoming gathering and begin reading the Bible with others.</li>
                  <li className="pl-1"><span className="font-semibold text-white">Read. Talk. Pray.</span> Grow through Scripture, meaningful conversation, and prayer.</li>
                  <li className="pl-1"><span className="font-semibold text-white">Start a Group.</span> Those who desire to lead can apply, affirm our Statement of Christian Faith, agree to our Leader Commitments, and complete a simple approval process.</li>
                  <li className="pl-1"><span className="font-semibold text-white">Help Others Begin.</span> Invite friends, encourage new leaders, and help healthy Bible-reading churches multiply.</li>
                </ol>
                <p className="mt-3">We celebrate:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>People joining Bible Groups</li>
                  <li>People being saved</li>
                  <li>People being baptized</li>
                  <li>People being sent to help others follow Jesus</li>
                </ul>
                <p className="mt-2">We measure ministry fruit through faithful discipleship, transformed lives, healthy leadership, and multiplying communities—not simply attendance.</p>
                <Scripture>Matthew 28:19–20; Acts 2:46–47; 2 Timothy 2:2</Scripture>
              </div>

              <div>
                <h4 className="text-base font-semibold tracking-tight text-white">A Church Bigger Than a Building.</h4>
                <p className="mt-2">We believe the church is God&apos;s people gathered in Jesus&apos; name.</p>
                <p className="mt-2">Our vision is to see Bible-reading communities in homes, coffee shops, workplaces, and neighborhoods around the world.</p>
                <p className="mt-2">Locally led. Biblically grounded. Connected in leadership. Committed to making disciples.</p>
                <p className="mt-3 space-y-1 font-semibold tracking-tight text-white">
                  <span className="block">No building required.</span>
                  <span className="block">No paid staff required.</span>
                  <span className="block">No donations required to participate.</span>
                </p>
                <p className="mt-3">Just people discovering Jesus and following Him together.</p>
                <p className="mt-4 font-semibold tracking-tight text-white">One Church Movement. Thousands of Local Gatherings. Jesus at the Center.</p>
                <p className="mt-3 font-semibold tracking-tight text-white">READ. TALK. PRAY.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/#groups" className="inline-flex h-11 items-center justify-center rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white">
                    Find a Group
                  </Link>
                  <Link href="/app/start" className="inline-flex h-11 items-center justify-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white">
                    Start a Group
                  </Link>
                </div>
              </div>
            </div>
          </Dropdown>

          <Dropdown title="Leading a Group">
            <h3 className="text-base font-semibold tracking-tight text-white">Leading a Group</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Anyone who follows Jesus, personally affirms our Statement of Christian Faith, and agrees to our Leader Commitments can apply to lead a Read Talk Pray group.
            </p>
            <h4 className="mt-6 text-base font-semibold tracking-tight text-white">You&apos;re Not Leading Alone</h4>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Every approved Read Talk Pray group will be connected with a ministry overseer as our leadership network develops. That overseer provides encouragement, prayer, guidance, and accountability.
            </p>
            <h4 className="mt-6 text-base font-semibold tracking-tight text-white">Monthly Leadership Gatherings</h4>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              Group leaders stay connected through monthly online Zoom gatherings for prayer, training, encouragement, and sharing what God is doing through their groups.
            </p>
            <h4 className="mt-6 text-base font-semibold tracking-tight text-white">Leader Commitments</h4>
            <ol className="mt-3 space-y-4">
              <li>
                <p className="text-sm font-semibold tracking-wide text-white">1. SHARED FAITH</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">Personally affirm our Statement of Christian Faith and agree to lead according to Scripture.</p>
              </li>
              <li>
                <p className="text-sm font-semibold tracking-wide text-white">2. CONNECTED LEADERSHIP</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">Stay connected with your ministry overseer for encouragement, prayer, guidance, and accountability.</p>
              </li>
              <li>
                <p className="text-sm font-semibold tracking-wide text-white">3. MONTHLY LEADERSHIP GATHERINGS</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">Participate in monthly Read Talk Pray leadership Zoom calls to grow and encourage other leaders.</p>
              </li>
            </ol>
            <Link href="/app/start" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#1976F3] px-5 text-sm font-semibold text-white">
              Start a Group
            </Link>
          </Dropdown>
        </div>
      </div>
    </section>
  );
}
