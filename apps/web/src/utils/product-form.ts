import { centsToRupiahInput, rupiahToCents } from "./admin-client";

export type Availability = "available" | "preorder" | "soldout";

/** Isian form editor produk. Semua teks kecuali kategori, ketersediaan, dan unggulan. */
export type ProductForm = {
  name: string;
  slug: string;
  categoryId: number | "";
  description: string;
  price: string;
  availability: Availability;
  isFeatured: boolean;
  imageUrl: string;
  imageAlt: string;
};

export const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  categoryId: "",
  description: "",
  price: "",
  availability: "available",
  isFeatured: false,
  imageUrl: "",
  imageAlt: "",
};

export function toForm(product: {
  name: string;
  slug: string;
  categoryId: number;
  description: string | null;
  priceCents: number | null;
  availability: Availability;
  isFeatured: boolean;
  imageUrl: string | null;
  imageAlt: string | null;
}): ProductForm {
  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    description: product.description ?? "",
    price: centsToRupiahInput(product.priceCents),
    availability: product.availability,
    isFeatured: product.isFeatured,
    imageUrl: product.imageUrl ?? "",
    imageAlt: product.imageAlt ?? "",
  };
}

export function isDirty(initial: ProductForm, current: ProductForm): boolean {
  return (Object.keys(initial) as Array<keyof ProductForm>).some((key) => initial[key] !== current[key]);
}

/** Data yang dikirim ke server. categoryId harus sudah dipilih (dicek sebelum memanggil). */
export function toPayload(form: ProductForm & { categoryId: number }) {
  return {
    categoryId: form.categoryId,
    name: form.name.trim(),
    slug: form.slug,
    description: form.description.trim() || null,
    priceCents: rupiahToCents(form.price),
    availability: form.availability,
    isFeatured: form.isFeatured,
    imageUrl: form.imageUrl.trim() || null,
    imageAlt: form.imageAlt.trim() || null,
  };
}
