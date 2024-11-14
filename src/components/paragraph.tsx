import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export default function Paragraph({
  className,
  children,
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-[10px] leading-[15px] tracking-[0.5px]", className)}>
      {children}
    </p>
  );
}
