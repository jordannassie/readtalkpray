import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SendingLocation } from "@/lib/locations";

export function TrainingBlock({ location }: { location: SendingLocation }) {
  return (
    <div className="rounded-[24px] px-5 py-6">
      <p className="text-sm font-medium text-[#111]">
        {location.training_start_time}
      </p>
      <h4 className="mt-1 text-xl font-semibold tracking-tight">
        12-Week Sending Training
      </h4>
      <p className="mt-3 text-sm text-[#666]">
        For those ready to be trained and sent.
      </p>
      <p className="mt-3 text-sm font-semibold text-[#111]">
        ${location.training_price}
      </p>
      <div className="mt-5">
        <Button href="/#12-weeks" variant="secondary" className="w-full sm:w-auto">
          View Training
          <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}
