

export function AnnouncementBar({ text = "ONLY GOD CAN JUDGE ME!" }: { text?: string }) {
  return (
    <div className="w-full bg-white text-black py-2 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest z-50">
      {text}
    </div>
  );
}
