import { Outlet } from 'react-router-dom';
import { Nav } from '@/components/navigation/Nav';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { Footer } from './Footer';

export function SiteLayout() {
  return (
    <>
      <Nav />
      <MobileMenu />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
