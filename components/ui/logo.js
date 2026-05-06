import Link from "next/link";
import { cn } from "@/utils/cn";

function Mark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("h-10 w-10", className)}
    >
      <rect x="2" y="2" width="44" height="44" rx="14" fill="#059669" />
      <path
        d="M24 11.5 34 17.25v11.5L24 34.5 14 28.75v-11.5L24 11.5Z"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  href = "/dashboard",
  className = "",
  markClassName = "",
  labelClassName = "",
  showWordmark = true,
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Mark className={markClassName} />
      {showWordmark ? (
        <span
          className={cn(
            "font-heading text-2xl font-bold tracking-tight text-text-primary",
            labelClassName,
          )}
        >
          SkillTrack
        </span>
      ) : null}
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="inline-flex rounded-md">
      {content}
    </Link>
  );
}
