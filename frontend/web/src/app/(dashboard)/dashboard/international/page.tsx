import dynamic from 'next/dynamic';

const InternationalPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function InternationalPage() {
  return <InternationalPageClient />;
}
