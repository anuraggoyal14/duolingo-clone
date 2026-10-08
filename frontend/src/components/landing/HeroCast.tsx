import { Mascot } from "@/components/ui/Mascot";
import { FlameIcon, GemIcon, HeartIcon, XpIcon } from "@/components/ui/icons";

/** Landing-page hero: the mascot surrounded by floating game rewards. */
export function HeroCast() {
  return (
    <div className="relative h-[300px] w-[320px] sm:h-[360px] sm:w-[400px]" aria-hidden>
      <div className="absolute inset-6 rounded-full bg-correct-bg" />
      <Mascot mood="cheer" className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 sm:h-60 sm:w-60" />
      <FlameIcon className="animate-float absolute left-6 top-6 h-16 w-14" />
      <XpIcon className="animate-float absolute right-8 top-10 h-14 w-14 [animation-delay:.6s]" />
      <GemIcon className="animate-float absolute bottom-10 left-4 h-12 w-12 [animation-delay:1.2s]" />
      <HeartIcon className="animate-float absolute bottom-6 right-6 h-14 w-14 [animation-delay:.3s]" />
    </div>
  );
}
