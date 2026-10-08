import { Diego, Lucia, Mateo, Sofia } from "@/components/art";
import { Mascot } from "@/components/ui/Mascot";
import { FlameIcon, GemIcon, HeartIcon, XpIcon } from "@/components/ui/icons";

/** Landing-page hero: the mascot surrounded by the cast and floating game rewards. */
export function HeroCast() {
  return (
    <div className="relative h-[290px] w-[300px] sm:h-[380px] sm:w-[420px]" aria-hidden>
      <div className="absolute inset-8 rounded-full bg-correct-bg" />
      <Sofia mood="happy" className="absolute left-0 top-8 h-28 w-auto sm:h-32" />
      <Mateo mood="happy" className="absolute right-0 top-6 h-28 w-auto sm:h-32" />
      <Lucia mood="happy" className="absolute bottom-2 left-6 h-24 w-auto sm:h-28" />
      <Diego mood="happy" className="absolute bottom-0 right-6 h-24 w-auto sm:h-28" />
      <Mascot
        mood="cheer"
        className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 sm:h-52 sm:w-52"
      />
      <FlameIcon className="animate-float absolute left-1/2 top-0 h-12 w-10 -translate-x-1/2" />
      <XpIcon className="animate-float absolute right-1/4 top-1/3 h-10 w-10 [animation-delay:.6s]" />
      <GemIcon className="animate-float absolute left-1/4 top-1/3 h-9 w-9 [animation-delay:1.2s]" />
      <HeartIcon className="animate-float absolute bottom-6 left-1/2 h-10 w-10 -translate-x-1/2 [animation-delay:.3s]" />
    </div>
  );
}
