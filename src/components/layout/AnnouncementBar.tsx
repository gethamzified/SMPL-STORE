

export function AnnouncementBar({ text = "ONLY GOD CAN JUDGE ME!" }: { text?: string }) {
  return (
    <div className="w-full bg-white text-black py-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-widest border-b border-gray-200 z-50">
      {text}
    </div>
  );
}
