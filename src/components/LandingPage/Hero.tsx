'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { GoChevronRight } from 'react-icons/go';
import { FaSearch } from 'react-icons/fa';
import Image from 'next/image';

import { gsap } from 'gsap';

import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

const Hero = () => {
  gsap.registerPlugin(MotionPathPlugin);

  const iconRef = useRef(null);

  const handleMouseEnter = () => {
    gsap.to(iconRef.current, {
      scale: 1.5, // Scale up
      duration: 1.5, // Total duration of animation
      motionPath: {
        path: [
          { x: 0, y: 0 }, // Start position
          { x: -50, y: -50 }, // Move left and up
          { x: 0, y: -100 }, // Top of the circular path
          { x: 50, y: -50 }, // Move right and down
          { x: 0, y: 0 }, // Back to the initial position
        ],
        curviness: 1.5, // Smoothness of the path
      },
      ease: 'power2.inOut',
    });
  };

  // const handleMouseLeave = () => {
  //   gsap.to(iconRef.current, {
  //     scale: 1, // Scale back to normal
  //     rotate: 0, // Reset rotation
  //     duration: 0.8,
  //     ease: 'power2.inOut',
  //   });
  // };

  return (
    <section className="relative h-screen w-full md:max-w-4xl lg:max-w-6xl pt-8">
      <header className="w-full flex justify-between">
        <h1 className="font-bold text-4xl text-gray-700">
          <span className="text-brand">Plant</span> HealthCare
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
          <Link href="/detect" className="w-fit">
            <button className="w-fit flex items-center gap-2 font-bold px-4 py-3 bg-brand rounded-full text-white">
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

      {/* <div
        className="absolute bottom-20 text-green-800"
        onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
      >
        <div className="" ref={iconRef}>
          <FaSearch size={40} />
        </div>
      </div> */}
    </section>
  );
};

export default Hero;
