import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import {
  getRepository,
  listUserTeams,
  listUserRepositories,
  getLatestAnalysis,
} from '@/lib/db';
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

  const teams = await listUserTeams(session.user.id);
  const userRepos = await listUserRepositories(session.user.id);

  const reposWithScores = userRepos.filter(
    (r) => r.aiScore !== null && r.aiScore !== undefined
  );
  const overallScore =
    reposWithScores.length > 0
      ? Math.round(
          reposWithScores.reduce((sum, r) => sum + (r.aiScore || 0), 0) /
            reposWithScores.length
        )
      : null;

  return (
    <RepoDetailClient
      repo={repo}
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      teams={teams}
      overallScore={overallScore}
    />
  );
}
