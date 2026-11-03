import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4" role="status" aria-live="polite">
      <div className="relative grid h-28 w-28 place-items-center">
        <span className="absolute inset-2 animate-ping rounded-full bg-[#1211bb]/15" aria-hidden="true" />
        <Image
          src="/favicon.png"
          alt=""
          width={80}
          height={80}
          priority
          className="relative h-20 w-20"
        />
      </div>
      <p className="text-sm font-semibold text-brand">Loading…</p>
    </div>
  );
}
