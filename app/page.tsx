import type { Metadata } from 'next';
import MDIndex from '@/content/index.md';
import SelectImage from '@/components/SelectImage';

const pageTitle = 'AI Background Remover';
const secondTitle = 'Free, Batch, No Login, No Quality Loss';
const title =
  'BgGone - Free AI Background Remover. Free, Batch, No Login, No Quality Loss';
const description =
  'A free, private background remover that runs entirely in your browser. Upload, drag, or paste images to remove backgrounds using AI — no uploads, no tracking.';

export const metadata: Metadata = {
  title,
  description,
};

export default function Home() {
  return (
    <>
      <h1 className="text-center py-6 sm:py-8 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
        {pageTitle}
        <p className="mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl">
          {secondTitle}
        </p>
      </h1>
      <SelectImage />
      <div className="mt-5 md:mt-8 px-4 main-width">
        <div className="prose dark:prose-invert max-w-max">
          <MDIndex />
        </div>

        <div className="mt-4">
          <a className="cursor-pointer hover:underline" id="back-to-top">
            Remove Backgrounds Now
          </a>
        </div>
      </div>
    </>
  );
}
