const steps = [
  {
    title: "Describe the space",
    body: "City, sun, size and wind — for a balcony, a terrace or a garden.",
  },
  {
    title: "Say how you want to use it",
    body: "Mediterranean, edible, or almost no work. Set the time and the budget.",
  },
  {
    title: "See the planting",
    body: "A picture of the whole space, then each plant by name, with a note on why it fits.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-title" className="px-5 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <h2
          id="how-it-works-title"
          className="font-display text-3xl leading-tight font-medium tracking-tight sm:text-5xl"
        >
          Three questions, then the plants.
        </h2>
        <ol className="mt-12 grid gap-10 border-t border-leaf-200 pt-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ title, body }, index) => (
            <li key={title}>
              <span className="font-display text-sm tracking-[0.18em] text-leaf-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 max-w-xs leading-relaxed text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
