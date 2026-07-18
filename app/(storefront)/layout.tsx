import StorefrontHeader from '@/components/layout/StorefrontHeader';
import StorefrontFooter from '@/components/layout/StorefrontFooter';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3EF', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      <StorefrontHeader />
      <main style={{ flex: 1 }}>{children}</main>
      <StorefrontFooter />
    </div>
  );
}
