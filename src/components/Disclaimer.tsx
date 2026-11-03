import { DISCLAIMER_LONG, DISCLAIMER_SHORT } from "@/data/site";

export default function Disclaimer({ long = false, className = "" }: { long?: boolean; className?: string }) {
  return (
    <p className={`mono text-xs leading-relaxed ${className}`} role="note">
      {long ? DISCLAIMER_LONG : DISCLAIMER_SHORT}
    </p>
  );
}
