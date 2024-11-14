import LogoSvg from "@/assets/logo-svg";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <LogoSvg />
      <span className="heading">QuickPic</span>
    </Link>
  );
}
