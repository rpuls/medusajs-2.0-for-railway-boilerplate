import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="w-full px-4 md:px-8 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/about/mascha.jpg"
            alt="Mascha Rodigina"
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        <div className="space-y-6 leading-relaxed text-left text-base md:text-lg">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide">
            GMORKL – Wearable Art Made in Cologne
          </h1>

          <p>
            GMORKL is an art project by visual artist and designer Masha Rodigina, based in Cologne, Germany. Specializing in handprinted, one-of-a-kind T-shirts and textiles, GMORKL brings together art, fashion, and activism.
          </p>

          <p>
            Each item is handprinted using silkscreen techniques on Fairtrade, organic cotton. From sketches on paper to digital experiments, every GMORKL piece is born as an artwork — then transformed into wearable art. No mass production. No replicas. Just unique fashion statements with soul.
          </p>

          <p>
            At GMORKL, we believe clothing should tell stories. That art should be worn. That a T-shirt can be a political message, a poetic gesture, or a symbol of independent culture.
          </p>

          <p>
            In this store, you’ll also find not only a limited selection of art prints and original illustrations but also artworks made by Mascha&apos;s friends.
          </p>

          <div className="mt-8">
            <h2 className="text-xl uppercase font-bold mb-4 tracking-wider">
              Why Choose GMORKL?
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>100% Organic & Fairtrade Cotton</li>
              <li>Handprinted in Cologne’s Kolbhalle Artist Community and DingFabrik</li>
              <li>Each piece is unique — no two prints are 100% identical</li>
              <li>Fashion with meaning, rooted in contemporary art</li>
              <li>Supports the independent art scene in Germany</li>
            </ul>
          </div>

          <p className="mt-8">
            Whether you're looking for a meaningful gift, a statement shirt, or a collector's item, GMORKL offers art pieces that connect art, identity and democratic values.
          </p>

          <p className="font-semibold mt-4">
            • Support independent art and wear your values.
          </p>
        </div>
      </div>
    </div>
  )
}
