'use client';

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ALL_CATEGORIES, CATEGORY_LABELS, serializeCategories } from '@/lib/categories';

type Props = {
  selected: string[];
};

export function CategoryFilter({ selected }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const updateUrl = (nextSelected: string[]) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (nextSelected.length > 0) {
      params.set('categories', serializeCategories(nextSelected));
    } else {
      params.delete('categories');
    }
    const url = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    startTransition(() => router.push(url, { scroll: false }));
  };

  const toggle = (value: string) => {
    const next = new Set(selectedSet);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    updateUrl(Array.from(next));
  };

  const clearAll = () => updateUrl([]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={clearAll}
        className={`rounded-full border px-3 py-1 text-sm ${
          selected.length === 0
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border hover:bg-muted'
        }`}
        aria-pressed={selected.length === 0}
      >
        전체
      </button>

      {ALL_CATEGORIES.map((value) => {
        const isActive = selectedSet.has(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              isActive ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
            }`}
            aria-pressed={isActive}
            disabled={isPending}
          >
            {CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS]}
          </button>
        );
      })}
    </div>
  );
}


