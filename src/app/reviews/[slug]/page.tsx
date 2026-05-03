import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ReviewsRedirectPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/blog/${slug}`);
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    robots: { index: false },
    alternates: { canonical: `/blog/${slug}` },
  };
}
