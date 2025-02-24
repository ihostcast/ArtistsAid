import { Metadata } from 'next';
import AdminLoginForm from '@/components/Admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login - ArtistsAid',
  description: 'Admin login page for ArtistsAid platform',
};

const AdminLoginPage = () => {
  return (
    <>
      <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[500px] rounded-md bg-white px-6 py-10 shadow-md dark:bg-dark sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Admin Login
                </h3>
                <p className="mb-11 text-center text-base font-medium text-body-color">
                  Login to access the admin dashboard
                </p>
                <AdminLoginForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminLoginPage;
