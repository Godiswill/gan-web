import Image from 'next/image';
export default function Navigation() {
  // const nav = [
  //   { title: 'AI Background Remover', url: '/' },
  //   { title: 'Portfolio', url: '/portfolio' },
  //   { title: 'About', url: '/about' },
  //   { title: 'Blog', url: '/blog' },
  //   { title: 'Tags', url: '/tags' },
  // ];

  return (
    <div className="flex items-center text-xl">
      <Image
        className="w-8 h-8"
        src="/icon2.png"
        alt="BgGone - Free AI Background Remover"
        width={48}
        height={48}
      />
      <a className="mx-4" href="/">
        BgGone
      </a>
      {/* <div className="hidden sm:block">
        {nav.map(({ title, url }) => (
          <a className="mr-4" href={url}>
            {title}
          </a>
        ))}
      </div> */}
    </div>
  );
}
