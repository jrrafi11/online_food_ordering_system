import { Footer } from './Footer';
import { NavBar } from './NavBar';

export const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
