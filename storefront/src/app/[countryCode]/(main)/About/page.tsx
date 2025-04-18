import Image from "next/image"

export default function AboutPage() {
  return (
    <section className="px-6 py-20 font-sans tracking-wide text-base text-black">
      <h1 className="text-4xl uppercase font-bold tracking-widest mb-12 text-center">
        GMORKL – wearable art made in Cologne
      </h1>

      <div className="w-full max-w-3xl mx-auto mb-12">
        <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/about/mascha.jpg"
            alt="Masha Rodigina"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 leading-relaxed">
        <p>
          GMORKL is an art project by visual artist and designer Masha Rodigina,
          based in Cologne, Germany. Specializing in handprinted, one-of-a-kind
          T-shirts and textiles, GMORKL brings together art, fashion, and activism.
        </p>

        <p>
          Each item is handprinted using silkscreen techniques on Fairtrade,
          organic cotton. From sketches on paper to digital experiments, every
          GMORKL piece is born as an artwork — then transformed into wearable art.
          No mass production. No replicas. Just unique fashion statements with soul.
        </p>

        <p>
          At GMORKL, we believe clothing should tell stories. That art should be
          worn. That a T-shirt can be a political message, a poetic gesture, or a
          symbol of independent culture.
        </p>

        <p>
          In this store, you’ll also find not only a limited selection of art prints
          and original illustrations but also artworks made by Mascha's friends.
        </p>

        <h2 className="text-xl uppercase font-bold mt-10 tracking-wider">Why Choose GMORKL?</h2>
        <ul className="list-disc list-inside mt-4 space-y-1">
          <li>100% Organic & Fairtrade Cotton</li>
          <li>Handprinted in Cologne’s Kolbhalle Artist Community and DingFabrik</li>
          <li>Each piece is unique — no two prints are 100% identical</li>
          <li>Fashion with meaning, rooted in contemporary art</li>
          <li>Supports the independent art scene in Germany</li>
        </ul>

        <p className="mt-6">
          Whether you're looking for a meaningful gift, a statement shirt, or a
          collector's item, GMORKL offers art pieces that connect art, identity and
          democratic values.
        </p>

        <p className="font-semibold mt-6">• Support independent art and wear your values.</p>
      </div>
    </section>
  )
}
