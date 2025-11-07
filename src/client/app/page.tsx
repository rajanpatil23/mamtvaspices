"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_SUMMARY } from "./gql/Product";
import { useMemo } from "react";
import groupProductsByFlag from "./utils/groupProductsByFlag";
import SkeletonLoader from "./components/feedback/SkeletonLoader";

const HeroSection = dynamic(() => import("./(public)/(home)/HeroSection"), {
  ssr: false,
});
const CategoryBar = dynamic(() => import("./(public)/(home)/CategoryBar"), {
  ssr: false,
});
const ProductSection = dynamic(
  () => import("./(public)/product/ProductSection"),
  { ssr: false }
);
const MainLayout = dynamic(() => import("./components/templates/MainLayout"), {
  ssr: false,
});

const Home = () => {
  const { data, loading, error } = useQuery(GET_PRODUCTS_SUMMARY, {
    variables: { first: 100 },
    fetchPolicy: "no-cache",
  });

  const { featured, trending, newArrivals, bestSellers } = useMemo(() => {
    if (!data?.products?.products)
      return { featured: [], trending: [], newArrivals: [], bestSellers: [] };
    return groupProductsByFlag(data.products.products);
  }, [data]);

  if (loading) {
    return (
      <MainLayout>
        <HeroSection />
        <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:max-w-7xl 2xl:mx-auto">
          <SkeletonLoader />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <HeroSection />
      <div className="w-full px-8 sm:px-12 lg:px-16 xl:px-20 2xl:max-w-7xl 2xl:mx-auto">
        <CategoryBar />
        <ProductSection
          title="Featured"
          products={featured}
          loading={false}
          error={error}
          showTitle={true}
        />
        <ProductSection
          title="Trending"
          products={trending}
          loading={false}
          error={error}
          showTitle={true}
        />
        <ProductSection
          title="New Arrivals"
          products={newArrivals}
          loading={false}
          error={error}
          showTitle={true}
        />
        <ProductSection
          title="Best Sellers"
          products={bestSellers}
          loading={false}
          error={error}
          showTitle={true}
        />
      </div>
    </MainLayout>
  );
};

export default Home;
