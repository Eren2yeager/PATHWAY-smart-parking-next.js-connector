import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import Navbar from '@/components/layout/Navbar';
import ResponsiveSidebar from '@/components/layout/ResponsiveSidebar';
import SkipLinks from '@/components/layout/SkipLinks';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  // Check if user needs to set up password (first-time Google users)
  if (session.user.needsPasswordSetup) {
    redirect('/auth/setup-password');
  }

  return (
    <div className="flex h-screen">
      {/* Skip Navigation Links */}
      <SkipLinks />

      {/* Responsive Sidebar */}
      <ResponsiveSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-20">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto px-6 py-4 md:px-8 md:py-6" style={{ outline: 'none' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
