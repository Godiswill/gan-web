import type { Metadata } from 'next';
import AIEdit from '@/components/AIEdit';

const title = 'Photo restoration - BgGone';
const description = 'AI old photo restoration, restore old photos.';

export const metadata: Metadata = {
  title,
  description,
};

export default function PhotoRestoration() {
  return <AIEdit prompt="One06" filesRequired={true} />;
}
