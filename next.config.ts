// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below

  async headers() {
    return [
      // {
      //   source: '/',
      //   headers: [
      //     {
      //       key: 'Cross-Origin-Opener-Policy',
      //       value: 'same-origin',
      //     },
      //     {
      //       key: 'Cross-Origin-Embedder-Policy',
      //       value: 'require-corp',
      //     },
      //   ],
      // },
      {
        source: '/_models/:path*', // *
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.(md|mdx)$/,
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
