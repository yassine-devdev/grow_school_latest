'use client'

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {

  return (
    <nav className="border-gray-200 bg-gray-900 border-b">
      <div className="mx-auto md:px-12 lg:px-20 max-w-7xl relative">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="https://www.reactvideoeditor.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <Image
              src="/icons/logo.svg"
              width={36}
              height={36}
              alt="React Video Editor Logo"
              className="h-9"
            />
            <span className="self-center text-xl md:text-2xl font-light whitespace-nowrap text-white">
              RVE
            </span>
          </Link>
        
        </div>
      </div>
    </nav>
  );
}