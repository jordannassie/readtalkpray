type Size = "sm" | "md" | "lg";

const singleSize: Record<Size, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-11 w-11 text-sm",
  lg: "h-[92px] w-[92px] text-3xl sm:h-[116px] sm:w-[116px]",
};

const pairSize: Record<Size, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-[76px] w-[76px] text-2xl sm:h-[96px] sm:w-[96px]",
};

export function LeaderFaces({
  leaderName,
  leaderPhoto,
  coLeaderName,
  coLeaderPhoto,
  size = "md",
}: {
  leaderName: string;
  leaderPhoto?: string | null;
  coLeaderName?: string | null;
  coLeaderPhoto?: string | null;
  size?: Size;
}) {
  if (!coLeaderName) return <Face photo={leaderPhoto} name={leaderName} className={singleSize[size]} />;
  return (
    <span className={`flex shrink-0 items-center ${size === "lg" ? "max-w-[148px]" : size === "sm" ? "w-14" : ""}`}>
      <Face photo={leaderPhoto} name={leaderName} className={pairSize[size]} />
      <span className="-ml-2 rounded-full ring-2 ring-white">
        <Face photo={coLeaderPhoto} name={coLeaderName} className={pairSize[size]} />
      </span>
    </span>
  );
}

function Face({ photo, name, className }: { photo?: string | null; name: string; className: string }) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photo} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />
    );
  }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-[#1976F3] font-semibold text-white ${className}`}>
      {name.slice(0, 1).toUpperCase() || "•"}
    </span>
  );
}
