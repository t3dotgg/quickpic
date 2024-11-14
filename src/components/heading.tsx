import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export default function Heading({
  className,
  children,
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn("heading", className)}>{children}</h1>;
}
