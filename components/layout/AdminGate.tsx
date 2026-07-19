'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, isStaff, type SessionUser } from '@/lib/session';

// Guards every /admin/* route: no session -> /login, customer session -> /home.
// Vendor and admin both pass through unchanged (vendor has full operational
// access; admin additionally sees the Users page, gated in the sidebar/page).
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null | 'checking'>('checking');

  useEffect(() => {
    const user = getSession();
    if (!user) { router.replace('/login'); return; }
    if (!isStaff(user.role)) { router.replace('/home'); return; }
    setSession(user);
  }, [router]);

  if (session === 'checking' || session === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory">
        <span className="material-symbols-outlined animate-spin text-slate" style={{ fontSize: '28px' }}>refresh</span>
      </div>
    );
  }

  return <>{children}</>;
}
