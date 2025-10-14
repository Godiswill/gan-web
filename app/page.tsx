import type { Metadata } from 'next';
import AIEdit from '@/components/AIEdit';

const title =
  'BgGone - Free AI Background Remover. Free, Batch, No Login, No Quality Loss';
const description =
  'A free, private background remover that runs entirely in your browser. Upload, drag, or paste images to remove backgrounds using AI — no uploads, no tracking.';

export const metadata: Metadata = {
  title,
  description,
};

export default function Home() {
  return <AIEdit />;
}
