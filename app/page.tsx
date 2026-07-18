// Root page redirects to storefront home
import { redirect } from 'next/navigation';
export default function RootPage() {
  redirect('/home');
}
