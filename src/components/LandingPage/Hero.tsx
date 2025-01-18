'use client';
import React from 'react';
import Link from 'next/link';
import { GoChevronRight } from 'react-icons/go';
import { FaSearch } from 'react-icons/fa';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="h-screen w-full md:max-w-4xl lg:max-w-6xl pt-8">
      <header className="w-full flex justify-between">
        <h1 className="font-bold text-4xl text-gray-700">
          Grow<span className="text-brand">Smart</span>
        </h1>
        <Link
          href="/detect"
          className="transition_button group flex items-center text-xl font-medium"
        >
          Get Started
          <GoChevronRight
            size={24}
            className="group-hover:translate-x-2 transition-all ease-in-out"
          />
        </Link>
      </header>
      <div className="grid md:grid-cols-2 w-full items-center h-4/5">
        <div className="flex flex-col gap-4">
          <div className="">
            <h1 className="text-4xl font-bold">
              Your Plants Deserve the{' '}
              <span className="text-brand">Best Care!</span>
            </h1>
            <p className="font-bold text-gray-500/70">
              Identify issues, track growth, and ensure plant health with ease.
            </p>
          </div>
          <Link href="/detect">
            <button className="w-fit flex items-center gap-2 font-bold p-4 bg-brand rounded-full text-white">
              DETECT
              <FaSearch size={20} />
            </button>
          </Link>
        </div>
        <div className="hidden w-full md:flex justify-end">
          <Image
            src="/heroImage.jpeg"
            alt="Hero Img"
            height={800}
            width={500}
            className="heroImg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
