import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SendingLocation } from "@/lib/locations";

export function ChurchBlock({ location }: { location: SendingLocation }) {
  return (
    <div className="rounded-[24px] border border-[var(--sending-blue-line)] px-5 py-6">
      <p className="text-sm font-medium text-[#111]">{location.church_start_time}</p>
      <h4 className="mt-1 text-xl font-semibold tracking-tight">Sending Church</h4>
      <p className="mt-2 text-sm text-[#666]">Free • Everyone Welcome</p>
      <p className="mt-3 text-sm text-[#666]">Come as you are. Come and grow.</p>
      <div className="mt-5">
        <Button href="/#sunday" className="w-full sm:w-auto">
          Come This Sunday
          <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}
