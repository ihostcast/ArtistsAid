import { Testimonial } from "@/types/testimonial";
import Image from "next/image";
import { ReactNode } from "react";

const SingleTestimonial = ({ testimonial }: { testimonial: Testimonial }) => {
  const { star, name, image, content, designation } = testimonial;

  return (
    <div className="w-full">
      <div
        className="wow fadeInUp rounded-md bg-white p-8 shadow-one dark:bg-[#1D2144] lg:px-5 xl:px-8"
        data-wow-delay=".1s"
      >
        <div className="mb-5 flex items-center space-x-1">
          {[...Array(star)].map((_, index) => (
            <span key={index} className="text-yellow-500">
              ★
            </span>
          ))}
        </div>
        <p className="mb-8 border-b border-body-color border-opacity-10 pb-8 text-base font-medium leading-relaxed text-body-color dark:border-white dark:border-opacity-10 dark:text-white">
          {content}
        </p>
        <div className="flex items-center">
          <div className="relative mr-4 h-[50px] w-[50px] overflow-hidden rounded-full">
            <Image
              src={image}
              alt={name}
              fill
              sizes="50px"
              className="object-cover"
              priority
            />
          </div>
          <div className="w-full">
            <h5 className="mb-1 text-lg font-semibold text-dark dark:text-white lg:text-base xl:text-lg">
              {name}
            </h5>
            <p className="text-sm text-body-color">{designation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTestimonial;
