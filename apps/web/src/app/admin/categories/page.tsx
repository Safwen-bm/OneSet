'use client';

import type { Category } from '@oneset/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/use-catalog';
import { adminCategoriesApi, type CategoryInput } from '@/lib/api';

const BLANK: CategoryInput = { name: '', tagline: '', description: '' };

function CategoryForm({
  initial,
  categoryId,
  onCancel,
  onSaved,
}: {
  initial: CategoryInput;
  categoryId?: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => (categoryId ? adminCategoriesApi.update(categoryId, form) : adminCategoriesApi.create(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSaved();
    },
    onError: (cause) => setError((cause as Error).message),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        mutation.mutate();
      }}
      className="space-y-3 rounded-panel border border-hairline bg-surface p-5"
    >
      <Field label="Name">
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
      </Field>
      <Field label="Tagline">
        <Input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
      </Field>
      {error && (
        <p role="alert" className="rounded-tile border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function CategoryRow({ category, onEdit }: { category: Category; onEdit: () => void }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => adminCategoriesApi.remove(category.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div className="flex items-center justify-between gap-3 py-3.5">
      <div>
        <p className="text-sm font-medium">{category.name}</p>
        {category.tagline && <p className="text-micro text-muted">{category.tagline}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-micro text-muted tabular">{category.productCount ?? 0} products</span>
        <button
          type="button"
          onClick={onEdit}
          className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink"
          aria-label={`Edit ${category.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete "${category.name}"? Products in it are not deleted.`)) remove.mutate();
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-raised hover:text-danger"
          aria-label={`Delete ${category.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const [editing, setEditing] = useState<Category | 'new' | null>(null);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-heading">Categories</h2>
        {editing === null && (
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus className="h-3.5 w-3.5" />
            Add category
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {editing === 'new' && (
          <CategoryForm initial={BLANK} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />
        )}

        {isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : categories && categories.length === 0 && editing !== 'new' ? (
          <p className="rounded-panel border border-hairline bg-surface p-6 text-center text-sm text-muted">
            No categories yet. Add one to start organising the catalog.
          </p>
        ) : (
          <div className="hairline-x rounded-panel border border-hairline bg-surface px-5">
            {categories?.map((category) =>
              editing !== 'new' && editing?.id === category.id ? (
                <div key={category.id} className="py-3.5">
                  <CategoryForm
                    initial={{
                      name: category.name,
                      tagline: category.tagline ?? '',
                    }}
                    categoryId={category.id}
                    onCancel={() => setEditing(null)}
                    onSaved={() => setEditing(null)}
                  />
                </div>
              ) : (
                <CategoryRow key={category.id} category={category} onEdit={() => setEditing(category)} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
