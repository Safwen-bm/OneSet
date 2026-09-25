const NOTES = [
  {
    label: 'STOCK',
    title: 'Everything is in stock in Tunis',
    body: 'No pre-orders, no three-week import wait. What the site says is on the shelf is on the shelf.',
  },
  {
    label: 'COMPATIBILITY',
    title: 'Parts checked together',
    body: 'Memory matched to platform, GPU sizes verified. We test and flag conflicts before you pay.',
  },
  {
    label: 'WARRANTY',
    title: 'Warranty handled locally',
    body: 'Two years on every product, claimed directly at our counter in Tunis, no overseas shipping.',
  },
];

export function ServiceNotes() {
  return (
    <section className="relative w-full overflow-hidden border-t border-white/10 bg-neutral-950 text-neutral-100 py-12 lg:py-24">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/service-notes-bg.jpg"
          alt="Hardware Stock, Compatibility Verification, and Local Warranty Station"
          className="h-full w-full object-cover object-center opacity-85 brightness-95"
        />
        {/* Soft gradient overlay ensures text contrast without obscuring the background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/80 via-neutral-950/30 to-neutral-950/80" />
      </div>

      {/* Content Container - Expanded max-width to reach image edges */}
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/15 pb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent font-medium">
              Service
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              We take care of the details.
            </h2>
          </div>
          <span className="mt-4 sm:mt-0 font-mono text-xs tracking-wider text-neutral-400 uppercase">
            ONESET / SERVICE
          </span>
        </div>

        {/* 3-Column Grid mapped directly to background image sections */}
        <div className="grid grid-cols-1 gap-6 pt-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          {NOTES.map((note, index) => {
            // Align each card directly over its corresponding image zone
            const alignmentClasses =
              index === 0
                ? 'md:justify-self-start'  // Left side: Shelf / Stock
                : index === 1
                ? 'md:justify-self-center' // Center: Compatibility check table
                : 'md:justify-self-end';   // Right side: Service counter / Warranty

            return (
              <div
                key={note.title}
                className={`group relative flex w-full max-w-md flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/35 p-8 backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-neutral-900/50 hover:shadow-2xl ${alignmentClasses}`}
              >
                <div>
                  <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-accent">
                    {note.label}
                  </span>

                  <h3 className="mt-6 font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
                    {note.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                    {note.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}