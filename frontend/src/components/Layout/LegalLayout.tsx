'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const LegalLayout = ({ children, title, description }: LegalLayoutProps) => {
  return (
    <>
      <Header />
      <section className="pt-[150px] pb-[120px]">
        <div className="container">
          <div className="flex flex-wrap justify-center -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto mb-[60px] max-w-[920px] text-center">
                <h2 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[42px]">
                  {title}
                </h2>
                {description && (
                  <p className="text-base font-medium leading-relaxed text-body-color dark:text-body-color-dark">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[800px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default LegalLayout;
