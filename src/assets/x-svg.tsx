import type { SvgProps } from "@/props/svgProps";
import React from "react";

export default function XSvg({ className, ...events }: SvgProps) {
  return (
    <svg
      className={className}
      {...events}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.8841 4.11599C20.3722 4.60415 20.3722 5.39561 19.8841 5.88376L5.88407 19.8838C5.39591 20.3719 4.60445 20.3719 4.1163 19.8838C3.62814 19.3956 3.62814 18.6041 4.1163 18.116L18.1163 4.11599C18.6045 3.62784 19.3959 3.62784 19.8841 4.11599Z"
        fill="#0676FF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.1163 4.11599C4.60445 3.62784 5.39591 3.62784 5.88407 4.11599L19.8841 18.116C20.3722 18.6041 20.3722 19.3956 19.8841 19.8838C19.3959 20.3719 18.6045 20.3719 18.1163 19.8838L4.1163 5.88376C3.62814 5.39561 3.62814 4.60415 4.1163 4.11599Z"
        fill="#0676FF"
      />
    </svg>
  );
}
