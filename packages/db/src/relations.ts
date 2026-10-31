import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  productCategories: {
    products: r.many.products({
      from: r.productCategories.id,
      to: r.products.categoryId,
    }),
  },
  products: {
    category: r.one.productCategories({
      from: r.products.categoryId,
      to: r.productCategories.id,
    }),
    variants: r.many.productVariants({
      from: r.products.id,
      to: r.productVariants.productId,
    }),
  },
  productVariants: {
    product: r.one.products({
      from: r.productVariants.productId,
      to: r.products.id,
    }),
  },
}));
