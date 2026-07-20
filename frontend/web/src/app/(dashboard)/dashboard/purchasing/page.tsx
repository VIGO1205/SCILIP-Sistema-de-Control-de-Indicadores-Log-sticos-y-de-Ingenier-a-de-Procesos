import dynamic from 'next/dynamic';

const PurchasingPageClient = dynamic(() => import('./page-client'), { ssr: false });

export default function PurchasingPage() {
  return <PurchasingPageClient />;
}
