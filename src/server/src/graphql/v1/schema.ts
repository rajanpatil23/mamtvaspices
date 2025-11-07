import { makeExecutableSchema } from "@graphql-tools/schema";
import { analyticsResolvers } from "@/modules/analytics/graphql/resolver";
import { productResolvers } from "@/modules/product/graphql/resolver";
import gql from "graphql-tag";

const typeDefs = gql`
  type Query {
    # Analytics
    yearRange: YearRange!
    orderAnalytics(params: DateRangeQueryInput!): OrderAnalytics!
    revenueAnalytics(params: DateRangeQueryInput!): RevenueAnalytics!
    userAnalytics(params: DateRangeQueryInput!): UserAnalytics!
    productPerformance(params: DateRangeQueryInput!): [ProductPerformance!]!
    interactionAnalytics(params: DateRangeQueryInput!): InteractionAnalytics!
    searchDashboard(params: SearchInput!): [SearchResult!]!
    abandonedCartAnalytics(params: DateRangeQueryInput!): AbandonedCartAnalytics!

    # Products
    products(first: Int, skip: Int, filters: ProductFilters): ProductConnection!
    product(slug: String!): Product
    newProducts(first: Int, skip: Int): ProductConnection!
    featuredProducts(first: Int, skip: Int): ProductConnection!
    trendingProducts(first: Int, skip: Int): ProductConnection!
    bestSellerProducts(first: Int, skip: Int): ProductConnection!
    categories: [Category!]!
  }

  scalar DateTime

  type YearRange {
    minYear: Int!
    maxYear: Int!
  }

  type Changes {
    revenue: Float
    orders: Float
    sales: Float
    users: Float
    averageOrderValue: Float
  }

  type MonthlyTrend {
    labels: [String!]!
    revenue: [Float!]!
    orders: [Int!]!
    sales: [Int!]!
    users: [Int!]!
  }

  type OrderAnalytics {
    totalOrders: Int!
    totalSales: Int!
    averageOrderValue: Float!
    changes: Changes!
  }

  type RevenueAnalytics {
    totalRevenue: Float!
    changes: Changes!
    monthlyTrends: MonthlyTrend!
  }

  type UserAnalytics {
    totalUsers: Int!
    totalRevenue: Float!
    retentionRate: Float!
    lifetimeValue: Float!
    repeatPurchaseRate: Float!
    engagementScore: Float!
    topUsers: [TopUser!]!
    interactionTrends: InteractionTrend!
    changes: Changes!
  }

  type ProductPerformance {
    id: ID!
    name: String!
    quantity: Int!
    revenue: Float!
  }

  type TopUser {
    id: ID!
    name: String!
    email: String!
    orderCount: Int!
    totalSpent: Float!
    engagementScore: Float!
  }

  type InteractionTrend {
    labels: [String!]!
    views: [Int!]!
    clicks: [Int!]!
    others: [Int!]!
  }

  type InteractionByType {
    views: Int!
    clicks: Int!
    others: Int!
  }

  type MostViewedProduct {
    productId: ID!
    productName: String!
    viewCount: Int!
  }

  type InteractionAnalytics {
    totalInteractions: Int!
    byType: InteractionByType!
    mostViewedProducts: [MostViewedProduct!]!
  }

  input DateRangeQueryInput {
    timePeriod: String
    year: Int
    startDate: String
    endDate: String
    category: String
  }

  type SearchResult {
    type: String!
    id: String!
    title: String!
    description: String
  }

  input SearchInput {
    searchQuery: String!
  }

  type AbandonedCartAnalytics {
    totalAbandonedCarts: Int!
    abandonmentRate: Float!
    potentialRevenueLost: Float!
  }

  type Product {
    id: String!
    slug: String!
    name: String!
    description: String
    salesCount: Int!
    isNew: Boolean!
    isFeatured: Boolean!
    isTrending: Boolean!
    isBestSeller: Boolean!
    averageRating: Float!
    reviewCount: Int!
    variants: [ProductVariant!]!
    category: Category
    reviews: [Review!]!
  }

  type ProductVariant {
    id: String!
    sku: String!
    images: [String!]!
    price: Float!
    stock: Int!
    lowStockThreshold: Int!
    barcode: String
    warehouseLocation: String
    attributes: [ProductVariantAttribute!]!
  }

  type ProductVariantAttribute {
    id: String!
    attribute: Attribute!
    value: AttributeValue!
  }

  type Attribute {
    id: String!
    name: String!
    slug: String!
  }

  type AttributeValue {
    id: String!
    value: String!
    slug: String!
  }

  type Review {
    id: String!
    rating: Int!
    comment: String
    user: User
    createdAt: DateTime!
  }

  type User {
    id: String!
    name: String!
    email: String!
    avatar: String
  }

  type Category {
    id: String!
    slug: String!
    name: String!
    description: String
  }

  type ProductConnection {
    products: [Product!]!
    hasMore: Boolean!
    totalCount: Int!
  }

  input ProductFilters {
    search: String
    isNew: Boolean
    isFeatured: Boolean
    isTrending: Boolean
    isBestSeller: Boolean
    minPrice: Float
    maxPrice: Float
    categoryId: String
    flags: [String!]
  }
`;

const resolvers = {
  Query: {
    ...analyticsResolvers.Query,
    ...productResolvers.Query
  },
  Product: productResolvers.Product,
  // Add Review type resolver
  Review: {
    user: (parent: any, _: any, context: any) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId }
      });
    }
  },
  // Add resolver for ProductVariant
  ProductVariant: {
    attributes: (parent: any, _: any, context: any) => {
      return context.prisma.productVariantAttribute.findMany({
        where: { variantId: parent.id },
        include: {
          attribute: true,
          value: true
        }
      });
    }
  },
  DateTime: {
    // Add proper DateTime scalar handling
    serialize: (value: Date) => value.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => {
      if (ast.kind === 'StringValue') {
        return new Date(ast.value);
      }
      return null;
    }
  }
};

export const combinedSchemas = makeExecutableSchema({
  typeDefs,
  resolvers
});
