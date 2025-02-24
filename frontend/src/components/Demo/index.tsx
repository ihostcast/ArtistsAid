import SectionTitle from "../Common/SectionTitle";
import SingleDemo from "./SingleDemo";
import demoData from "./demoData";
import Link from "next/link";

const Demo = () => {
  return (
    <section
      id="demo"
      className="bg-primary/5 py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        <SectionTitle
          title="Descubre Talento Emergente"
          paragraph="Explora los mejores demos musicales, artículos periodísticos y trabajos fotográficos de nuestra comunidad. Una ventana al talento emergente en diferentes disciplinas artísticas."
          center
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
          {demoData.map((demo) => (
            <div key={demo.id} className="w-full">
              <SingleDemo demo={demo} />
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/demo"
            className="rounded-md bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80"
          >
            Ver Todos los Demos
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Demo;
