import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    // Analytics schema
    "src/modules/analytics/graphql/schema.ts",
    // Product schema
    "src/modules/product/graphql/schema.ts"
  ],
  generates: {
    "src/graphql/v1/types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "./context#GraphQLContext",
        mappers: {
          Product: "@prisma/client#Product",
          ProductVariant: "@prisma/client#ProductVariant",
          Category: "@prisma/client#Category",
          User: "@prisma/client#User"
        }
      }
    }
  }
}