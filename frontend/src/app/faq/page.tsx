'use client';

const FAQPage = () => {
  return (
    <>
      <section className="pt-[150px] pb-[120px]">
        <div className="container">
          <div className="flex flex-wrap justify-center -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto mb-[60px] max-w-[920px] text-center">
                <h2 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[42px]">
                  Frequently Asked Questions
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[800px]">
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    What is ArtistsAid?
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color">
                    ArtistsAid is a platform designed to help musicians and artists manage and promote their work.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    How do I get started?
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color">
                    Simply create an account and follow our easy setup guide to start using our features.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    What features are included?
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color">
                    Our platform includes music hosting, promotion tools, analytics, and collaboration features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQPage;
