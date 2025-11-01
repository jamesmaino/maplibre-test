import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/biolinks');
  return null;
}
