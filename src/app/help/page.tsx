'use client';

const HelpPage = () => {
  return (
    <>
      <section className="pt-[150px] pb-[120px]">
        <div className="container">
          <div className="flex flex-wrap justify-center -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto mb-[60px] max-w-[920px] text-center">
                <h2 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[42px]">
                  Help Center
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[800px]">
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Getting Started
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color">
                    Learn how to create an account and start using our platform.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Common Issues
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color">
                    Find solutions to common problems and troubleshooting guides.
                  </p>
                </div>
                <div className="mb-9">
                  <h3 className="mb-4 text-xl font-bold text-dark dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
                    Contact Support
                  </h3>
                  <p className="text-base font-medium leading-relaxed text-body-color">
                    Need more help? Contact our support team for assistance.
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

export default HelpPage;
