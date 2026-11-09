export function Multiply() {
  return (
    <section id="how" className="scroll-mt-24 bg-[#f6f4f1] px-5 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[32px] bg-[#f7f4ef] lg:grid-cols-2 lg:gap-6">
        <div className="px-2 sm:px-6">
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
        <div className="mx-auto w-full max-w-[420px] px-2 pb-4" aria-hidden>
          <svg viewBox="0 0 420 420" className="h-auto w-full">
            <path d="M 52.1 152.5 A 168 168 0 0 1 367.9 152.5 L 300.2 177.2 A 96 96 0 0 0 119.8 177.2 Z" fill="#2f6bff" />
            <path d="M 367.9 152.5 A 168 168 0 0 1 180.8 375.4 L 193.3 304.5 A 96 96 0 0 0 300.2 177.2 Z" fill="#1b1b1b" />
            <path d="M 180.8 375.4 A 168 168 0 0 1 52.1 152.5 L 119.8 177.2 A 96 96 0 0 0 193.3 304.5 Z" fill="#d7d7d7" />
            <circle cx="210" cy="210" r="78" fill="white" />
            <text x="210" y="206" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2f6bff">MULTIPLY</text>
            <path d="M174 218 h72" stroke="#2f6bff" strokeWidth="4" strokeLinecap="round" />
            <text x="210" y="118" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">JOIN</text>
            <text x="210" y="138" textAnchor="middle" fill="white" fontSize="12">Join a Bible group.</text>
            <text x="300" y="268" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">DO</text>
            <text x="300" y="288" textAnchor="middle" fill="white" fontSize="11">Practice Read. Talk. Pray.</text>
            <text x="112" y="248" textAnchor="middle" fill="#111" fontSize="22" fontWeight="700">SEND</text>
            <text x="112" y="268" textAnchor="middle" fill="#111" fontSize="11">Invite and equip</text>
            <text x="112" y="284" textAnchor="middle" fill="#111" fontSize="11">someone else.</text>
          </svg>
        </div>
      </div>
    </section>
  );
}
