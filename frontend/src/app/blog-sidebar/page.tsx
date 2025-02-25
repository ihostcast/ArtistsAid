'use client';

import Image from "next/image";

const BlogSidebarPage = () => {
  return (
    <div>
      <section className="overflow-hidden pb-[120px] pt-[180px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-8/12">
              <div>
                <h1 className="mb-8 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight">
                  Blog Title
                </h1>
                <div className="blog-content">
                  <p className="mb-10 text-base font-medium leading-relaxed text-body-color">
                    Blog content goes here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogSidebarPage;
