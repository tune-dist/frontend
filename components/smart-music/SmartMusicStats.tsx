"use client";

const stats = [
  { value: "150+", label: "Streaming Platforms" },
  { value: "50K+", label: "Artists Worldwide" },
  { value: "24–48", label: "Hour Delivery" },
  { value: "100%", label: "Ownership Retained" },
  { value: "$12M+", label: "Royalties Paid Out" },
  { value: "99.9%", label: "Uptime Guarantee" },
];

export default function SmartMusicStats() {
  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/50 bg-muted/20 px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label} className="group">
                <p className="text-2xl sm:text-3xl font-bold font_heading animated-gradient mb-1 transition-transform group-hover:scale-110 duration-300">
                  {value}
                </p>
                <p className="text-muted-foreground text-xs leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
