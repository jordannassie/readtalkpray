export function Multiply() {
  return (
    <section id="how" className="scroll-mt-24 bg-[#f6f4f1] px-5 py-14 sm:py-20">
      <div className="mx-auto grid max-w-[1320px] items-center gap-8 rounded-[32px] bg-[#f7f4ef] px-2 py-6 sm:px-6 lg:grid-cols-2 lg:gap-4 lg:py-8">
        <div className="px-2 sm:px-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#9a9a9a]">LEARN TO LEAD</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Ready to help others grow?</h2>
          <p className="mt-4 max-w-md text-lg text-[#444]">See it. Practice it. Help others do the same.</p>
          <ol className="mt-6 max-w-md space-y-2 text-sm leading-relaxed text-[#444]">
            <li><strong>Join</strong> a Bible study group.</li>
            <li><strong>Do</strong> Read. Talk. Pray.</li>
            <li><strong>Send</strong> — invite and equip someone else.</li>
            <li><strong>Multiply</strong> — start another group.</li>
          </ol>
        </div>
        <div className="mx-auto w-full max-w-[560px] px-2 pb-2" aria-hidden>
          <svg viewBox="0 0 420 420" className="h-auto w-full">
            <path d="M 52.1 152.5 A 168 168 0 0 1 367.9 152.5 L 300.2 177.2 A 96 96 0 0 0 119.8 177.2 Z" fill="#2f6bff" />
            <path d="M 367.9 152.5 A 168 168 0 0 1 180.8 375.4 L 193.3 304.5 A 96 96 0 0 0 300.2 177.2 Z" fill="#1b1b1b" />
            <path d="M 180.8 375.4 A 168 168 0 0 1 52.1 152.5 L 119.8 177.2 A 96 96 0 0 0 193.3 304.5 Z" fill="#d7d7d7" />
            <circle cx="210" cy="210" r="78" fill="white" />
            <text x="210" y="206" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2f6bff">MULTIPLY</text>
            <path d="M174 218 h72" stroke="#2f6bff" strokeWidth="4" strokeLinecap="round" />
            <text x="210" y="72" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">JOIN</text>
            <text x="210" y="90" textAnchor="middle" fill="white" fontSize="11">Join a group.</text>
            <text x="292" y="286" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">DO</text>
            <text x="292" y="304" textAnchor="middle" fill="white" fontSize="11">Practice it.</text>
            <text x="92" y="228" textAnchor="middle" fill="#111" fontSize="18" fontWeight="700">SEND</text>
            <text x="92" y="246" textAnchor="middle" fill="#111" fontSize="11">Invite others.</text>
          </svg>
        </div>
      </div>
    </section>
  );
}
