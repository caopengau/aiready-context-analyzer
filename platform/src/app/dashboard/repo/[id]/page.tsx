import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import { getRepository } from '@/lib/db';
import RepoDetailClient from './RepoDetailClient';

export default async function RepoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const repo = await getRepository(id);

  if (!repo) {
    notFound();
  }

  // Auth check: User must own the repo
  if (repo.userId !== session.user.id) {
    redirect('/dashboard');
  }

  return (
    <RepoDetailClient
      repo={repo}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
