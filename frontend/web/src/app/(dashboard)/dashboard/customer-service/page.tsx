import dynamic from 'next/dynamic';

const CustomerServicePageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function CustomerServicePage() {
  return <CustomerServicePageClient />;
}
