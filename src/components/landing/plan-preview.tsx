import Image from "next/image";

const plants = [
  {
    name: "English lavender",
    note: "The sunniest corner, in a pot that drains.",
    src: "/images/landing-detail.jpg",
  },
  {
    name: "Geranium",
    note: "Months of colour, and it forgives a missed day.",
    src: "/images/blog-sunny-geranium.jpg",
  },
  {
    name: "Sedum",
    note: "Stores water in its leaves. Good on a hot railing.",
    src: "/images/blog-low-succulents.jpg",
  },
];

export function PlanPreview() {
  return (
    <section aria-labelledby="preview-title" className="bg-leaf-950 text-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-leaf-300 uppercase">
            What you get
          </p>
          <h2
            id="preview-title"
            className="mt-4 font-display text-3xl leading-tight font-medium tracking-tight text-balance sm:text-5xl"
          >
            A picture of the planting, then each plant on its own.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-leaf-100/75">
            No long report. A few sentences, the scene, and a name next to every plant.
          </p>
          <Image
            src="/images/landing-hero.jpg"
            alt="Suggested planting: olive, lavender and jasmine on a balcony"
            width={1600}
            height={900}
            className="mt-8 aspect-[16/10] w-full rounded-[1.75rem] object-cover"
          />
        </div>
        <ul className="flex flex-col gap-3">
          {plants.map((plant) => (
            <li
              key={plant.name}
              className="flex items-center gap-4 rounded-3xl bg-white/10 p-3 ring-1 ring-white/15"
            >
              <Image
                src={plant.src}
                alt=""
                width={160}
                height={160}
                className="size-20 shrink-0 rounded-2xl object-cover"
              />
              <div>
                <p className="font-display text-xl font-medium">{plant.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-leaf-100/70">{plant.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
