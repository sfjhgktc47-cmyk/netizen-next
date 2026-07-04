# Patch 21 — кнопка сохранения цвета SKU

Что изменено:

- В блок цвета добавлена отдельная кнопка `Сохр.`.
- Кнопка сохраняет пару: название цвета + HEX кружка.
- Пипетка и кружок меняют только HEX, название цвета не ломается.
- Сохранённые цвета появляются в подсказках следующих SKU.
- API `/api/admin/color-presets` оставлен для подтягивания цветов из уже сохранённых SKU.

Файлы:

- `src/components/admin/color-picker-field.tsx`
- `src/components/admin/position-create-form.tsx`
- `src/components/admin/product-variant-create-form.tsx`
- `src/components/admin/product-variant-edit-form.tsx`
- `src/app/api/admin/color-presets/route.ts`
