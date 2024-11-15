import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export default function Heading({
  className,
  children,
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn("text-center text-2xl font-bold leading-[28px]", className)}
    >
      {children}
    </h1>
  );
}
