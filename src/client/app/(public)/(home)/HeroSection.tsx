"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface HeroSectionProps {
  isPreview?: boolean;
}

const HeroSection = ({ isPreview = false }: HeroSectionProps) => {
  return (
    <section className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw]">
      <div className="relative w-full overflow-hidden">
        {/* Hero Image */}
        <div className="relative w-full">
          <div className="aspect-[16/9] sm:aspect-[16/7] lg:aspect-[21/9] w-full relative">
            <Image
              src="/assets/Mamtva Spices hero bg.png"
              alt="Mamtva Spices"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:max-w-7xl 2xl:mx-auto">
                <div className="max-w-3xl">
                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight"
                  >
                    Discover The Finest Spices
                    <br />
                    With <span className="text-orange-500">Mamtva</span> Spices
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl leading-relaxed"
                  >
                    <span className="font-semibold">MAMTVA</span> brings you pure, authentic spices packed with rich aroma
                    <br />
                    and natural goodness. Experience unmatched quality in every pinch -
                    <br />
                    from our roots to your kitchen.
                  </motion.p>

                  {/* Feature Tags and CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 sm:gap-4 flex-wrap lg:flex-nowrap"
                  >
                    {/* Badges on the left */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm whitespace-nowrap">
                      <span className="text-white text-xs sm:text-sm">🌿 Authentic Flavors</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm whitespace-nowrap">
                      <span className="text-white text-xs sm:text-sm">✨ Pure & Natural</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm whitespace-nowrap">
                      <span className="text-white text-xs sm:text-sm">👨‍🍳 Handcrafted for authentic taste</span>
                    </div>
                    
                    {/* CTA Button - Right side */}
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 sm:gap-3 bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-xs sm:text-sm whitespace-nowrap lg:ml-auto"
                    >
                      <ShoppingBag size={16} className="sm:w-5 sm:h-5" />
                      Shop Now
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
