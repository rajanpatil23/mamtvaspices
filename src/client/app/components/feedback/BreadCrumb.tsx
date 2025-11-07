"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const BreadCrumb: React.FC = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  // Map segment names for better display
  const getSegmentDisplay = (segment: string) => {
    const segmentMap: Record<string, string> = {
      product: "Shop",
    };
    return segmentMap[segment] || segment;
  };

  // Map segment hrefs for correct navigation
  const getSegmentHref = (segment: string, index: number) => {
    if (segment === "product" && index === 0) {
      return "/shop";
    }
    return "/" + pathSegments.slice(0, index + 1).join("/");
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center text-sm text-gray-500 space-x-1 sm:space-x-2">
        <li>
          <Link
            href="/"
            className="hover:text-indigo-600 font-medium transition"
          >
            Home
          </Link>
        </li>

        {pathSegments.map((segment, index) => {
          const href = getSegmentHref(segment, index);
          const displayName = getSegmentDisplay(segment);
          const isLast = index === pathSegments.length - 1;

          return (
            <React.Fragment key={href}>
              <span className="text-gray-400">/</span>
              <li>
                {isLast ? (
                  <span className="capitalize font-semibold">
                    {decodeURIComponent(displayName)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="capitalize hover:text-indigo-600 font-medium transition"
                  >
                    {decodeURIComponent(displayName)}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadCrumb;
