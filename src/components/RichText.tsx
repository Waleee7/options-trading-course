import { parseInline } from "@/lib/content";

export default function RichText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((t, i) => {
        if (t.k === "strong") return <strong key={i}>{t.v}</strong>;
        if (t.k === "code") return <code key={i}>{t.v}</code>;
        if (t.k === "link") {
          const external = /^https?:/.test(t.href);
          return (
            <a key={i} href={t.href} className="link" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {t.v}
            </a>
          );
        }
        return <span key={i}>{t.v}</span>;
      })}
    </>
  );
}
