'use client';

import { toDinars, toMillimes, type Product } from '@oneset/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/use-catalog';
import {
  adminProductsApi,
  type ProductImageInput,
  type ProductInput,
  type ProductSpecInput,
  type ProductVariantInput,
} from '@/lib/api';

function toFormState(product?: Product) {
  return {
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    categoryId: product?.category.id ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    price: product ? String(toDinars(product.priceMillimes)) : '',
    compareAt: product?.compareAtMillimes ? String(toDinars(product.compareAtMillimes)) : '',
    stock: product ? String(product.stock) : '0',
    tags: product?.tags.join(', ') ?? '',
    isFeatured: product?.isFeatured ?? false,
  };
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();

  const [form, setForm] = useState(toFormState(product));
  const [images, setImages] = useState<ProductImageInput[]>(
    product?.images.map((image) => ({ url: image.url, alt: image.alt })) ?? [],
  );
  const [variants, setVariants] = useState<ProductVariantInput[]>(
    product?.variants.map((variant) => ({
      name: variant.name,
      sku: variant.sku,
      optionName: variant.optionName,
      optionValue: variant.optionValue,
      swatchHex: variant.swatchHex ?? undefined,
      priceMillimes: variant.priceMillimes,
      stock: variant.stock,
    })) ?? [],
  );
  const [specs, setSpecs] = useState<ProductSpecInput[]>(
    product?.specifications.map((spec) => ({ group: spec.group, label: spec.label, value: spec.value })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const body: ProductInput = {
        name: form.name,
        brand: form.brand,
        categoryId: form.categoryId,
        shortDescription: form.shortDescription,
        description: form.description,
        priceMillimes: toMillimes(Number(form.price) || 0),
        compareAtMillimes: form.compareAt ? toMillimes(Number(form.compareAt)) : null,
        stock: Number(form.stock) || 0,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        isFeatured: form.isFeatured,
        images: images.filter((image) => image.url && image.alt),
        variants: variants.filter((variant) => variant.name && variant.sku),
        specifications: specs.filter((spec) => spec.group && spec.label && spec.value),
      };
      return product ? adminProductsApi.update(product.id, body) : adminProductsApi.create(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/admin/products');
    },
    onError: (cause) => setError((cause as Error).message),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    mutation.mutate();
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-heading">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </Field>
          <Field label="Brand">
            <Input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} required />
          </Field>
        </div>
        <Field label="Category">
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            required
            className="h-11 w-full rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus:outline-none"
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Short description">
          <Input
            value={form.shortDescription}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            required
          />
        </Field>
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
            rows={4}
            className="w-full rounded-tile border border-hairline bg-surface px-4 py-3 text-sm text-ink focus:border-ink/30 focus:outline-none"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-heading">Price & stock</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (TND)">
            <Input
              inputMode="decimal"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </Field>
          <Field label="Compare-at price (optional)">
            <Input
              inputMode="decimal"
              value={form.compareAt}
              onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))}
            />
          </Field>
          <Field label="Stock">
            <Input
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              required
            />
          </Field>
        </div>
        <Field label="Tags (comma separated)">
          <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
            className="h-4 w-4 rounded-[4px] border-hairline accent-[hsl(var(--accent))]"
          />
          Feature on the homepage
        </label>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-heading">Images</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImages((rows) => [...rows, { url: '', alt: '' }])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add image
          </Button>
        </div>
        <p className="text-micro text-muted">
          Paste a real image URL, or leave a row blank to fall back to the seeded gradient art.
        </p>
        {images.map((image, index) => (
          <div key={index} className="flex gap-3">
            <Input
              placeholder="https://…"
              value={image.url}
              onChange={(e) =>
                setImages((rows) => rows.map((row, i) => (i === index ? { ...row, url: e.target.value } : row)))
              }
              className="flex-[2]"
            />
            <Input
              placeholder="Alt text"
              value={image.alt}
              onChange={(e) =>
                setImages((rows) => rows.map((row, i) => (i === index ? { ...row, alt: e.target.value } : row)))
              }
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setImages((rows) => rows.filter((_, i) => i !== index))}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-raised hover:text-danger"
              aria-label="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-heading">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants((rows) => [
                ...rows,
                { name: '', sku: '', optionName: 'Colour', optionValue: '', priceMillimes: 0, stock: 0 },
              ])
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add variant
          </Button>
        </div>
        {variants.map((variant, index) => (
          <div key={index} className="grid gap-2 rounded-tile border border-hairline p-3 sm:grid-cols-6">
            <Input
              placeholder="Variant name"
              value={variant.name}
              onChange={(e) =>
                setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)))
              }
              className="sm:col-span-2"
            />
            <Input
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) =>
                setVariants((rows) => rows.map((row, i) => (i === index ? { ...row, sku: e.target.value } : row)))
              }
            />
            <Input
              placeholder="Option (e.g. Colour)"
              value={variant.optionName}
              onChange={(e) =>
                setVariants((rows) =>
                  rows.map((row, i) => (i === index ? { ...row, optionName: e.target.value } : row)),
                )
              }
            />
            <Input
              placeholder="Value (e.g. Black)"
              value={variant.optionValue}
              onChange={(e) =>
                setVariants((rows) =>
                  rows.map((row, i) => (i === index ? { ...row, optionValue: e.target.value } : row)),
                )
              }
            />
            <div className="flex gap-2">
              <Input
                placeholder="Stock"
                inputMode="numeric"
                value={String(variant.stock)}
                onChange={(e) =>
                  setVariants((rows) =>
                    rows.map((row, i) => (i === index ? { ...row, stock: Number(e.target.value) || 0 } : row)),
                  )
                }
              />
              <button
                type="button"
                onClick={() => setVariants((rows) => rows.filter((_, i) => i !== index))}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-raised hover:text-danger"
                aria-label="Remove variant"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-heading">Specifications</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSpecs((rows) => [...rows, { group: '', label: '', value: '' }])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add spec
          </Button>
        </div>
        {specs.map((spec, index) => (
          <div key={index} className="flex gap-3">
            <Input
              placeholder="Group (e.g. Sensor)"
              value={spec.group}
              onChange={(e) =>
                setSpecs((rows) => rows.map((row, i) => (i === index ? { ...row, group: e.target.value } : row)))
              }
            />
            <Input
              placeholder="Label (e.g. DPI)"
              value={spec.label}
              onChange={(e) =>
                setSpecs((rows) => rows.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)))
              }
            />
            <Input
              placeholder="Value (e.g. 30,000)"
              value={spec.value}
              onChange={(e) =>
                setSpecs((rows) => rows.map((row, i) => (i === index ? { ...row, value: e.target.value } : row)))
              }
            />
            <button
              type="button"
              onClick={() => setSpecs((rows) => rows.filter((_, i) => i !== index))}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-raised hover:text-danger"
              aria-label="Remove specification"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      {error && (
        <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
