# Patch 16 — Search v2

Что изменено:

- Добавлен `src/lib/search-v2.ts` с нормализацией поиска.
- Поиск понимает русские/английские синонимы: `айфон`, `iphone`, `про`, `макс`, `гб`, цвета.
- Поиск понимает ошибочную раскладку клавиатуры: `fqajy` → `iphone`, `шзрщту` → `iphone`, `зкщ` → `pro`, `ьфч` → `max`.
- В каталоге поиск теперь сортирует выдачу по смыслу:
  - `iphone 17` → обычный iPhone 17, потом Pro, потом Pro Max, аксессуары ниже.
  - `iphone 17 pro` → Pro/Pro Max, обычный iPhone 17 не показывается.
  - `iphone 17 pro max` → Pro Max.
  - `чехол iphone 17` → аксессуары поднимаются наверх.
- Поиск по SKU идёт не как одна фраза, а по токенам: `iphone 17 256gb blue`.
- API выпадающего поиска `/api/catalog-search` тоже использует Search v2.

Файлы:

- `src/lib/search-v2.ts`
- `src/components/catalog-view.tsx`
- `src/app/api/catalog-search/route.ts`
