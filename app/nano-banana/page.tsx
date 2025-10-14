import type { Metadata } from 'next';
import AIEdit from '@/components/AIEdit';

const title = 'Nano Banana - Gemini 2.5 Flash Image';
const description =
  'Start exploring and building with Google’s latest AI models. Access Gemini 2.5 Flash, Gemini Pro, and more to create innovative applications and solutions powered by cutting-edge AI technology.';

export const metadata: Metadata = {
  title,
  description,
};

export default function NanoBanana() {
  return <AIEdit />;
}
