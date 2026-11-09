import { Button } from "@/components/ui/Button";

export function EmptyLocationCTA() {
  return (
    <div className="mt-8 text-center">
      <p className="text-sm text-[#777]">Don’t see a location near you?</p>
      <div className="mt-3">
        <Button href="/login" variant="secondary">
          Start a Sending Church
        </Button>
      </div>
    </div>
  );
}
