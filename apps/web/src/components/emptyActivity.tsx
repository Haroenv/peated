import Link from "@peated/web/components/link";
import type { ReactNode } from "react";

type Props =
  | {
      href: string;
      children?: ReactNode;
    }
  | {
      href?: never;
      children?: ReactNode;
    };

export default function EmptyActivity({ href, children }: Props) {
  const baseStyles =
    "border-slate-700 text-muted m-3 sm:my-4 flex flex-col items-center rounded-lg border border-dashed p-12 font-muted";

  if (href) {
    return (
      <Link
        className={`${baseStyles} group hover:border-slate-400 hover:text-slate-400`}
        href={href}
      >
        {children}
      </Link>
    );
  }
  return <div className={baseStyles}>{children}</div>;
}
