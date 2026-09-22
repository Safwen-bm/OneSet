const NOTES = [
  {
    title: 'Everything is in stock in Tunis',
    body: 'No pre-orders, no three-week import wait. What the site says is on the shelf is on the shelf.',
  },
  {
    title: 'Parts are checked against each other',
    body: 'Memory that matches the platform, a panel your card can actually drive. We flag it before you pay.',
  },
  {
    title: 'Warranty handled here',
    body: 'Two years on every product, claimed at our counter rather than through a shipping label abroad.',
  },
];

export function ServiceNotes() {
  return (
    <section className="border-t border-hairline">
      <div className="container grid gap-px bg-hairline md:grid-cols-3">
        {NOTES.map((note) => (
          <div key={note.title} className="bg-paper px-6 py-10">
            <h2 className="font-display text-heading">{note.title}</h2>
            <p className="mt-3 max-w-[40ch] text-sm text-muted">{note.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
