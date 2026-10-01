import { redirect } from 'next/navigation';

export default function JoinRedirectPage({
  searchParams,
}: {
  searchParams?: { ref?: string };
}) {
  const ref = searchParams?.ref;
  if (ref) {
    redirect(`/register?ref=${encodeURIComponent(ref)}`);
  }
  redirect('/register');
}
