import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Microvision Enterprises Ltd"
      width={200}
      height={47}
      quality={60}
      sizes="200px"
      priority
      className={className ?? "h-[47px] w-[200px]"}
    />
  );
}
