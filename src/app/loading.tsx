export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        {/* Minimal loading indicator — less jarring than full white blocker */}
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    </div>
  );
}
