# Page Builder — Phase D: Drag-to-Reorder

## Your Role
Sole agent. Replace the up/down reorder buttons in the page builder with drag handles using `@dnd-kit`. Blocks should be smoothly draggable and persist order to DB on drop.

---

## MANDATORY FIRST STEP
Read `plans/AGENT_CONTEXT.md` for critical rules (no middleware.ts, use bun, etc.).

---

## Reference Files to Read First

1. `src/components/dashboard/page-builder-client.tsx` — the interactive client component where reorder logic lives
2. `src/components/dashboard/block-editor/block-editor-shell.tsx` — the block card UI (has onMoveUp/onMoveDown props to replace)
3. `src/app/actions/blocks.ts` — `reorderBlocks(blocks: { id: string; sortOrder: number }[])` signature
4. `package.json` — confirm @dnd-kit is NOT yet installed

---

## Task 1: Install @dnd-kit

```bash
cd /home/kelib/Desktop/moreprojects/gaphto
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Task 2: Update `src/components/dashboard/block-editor/block-editor-shell.tsx`

Read the current file first.

**Changes:**
1. Remove `onMoveUp`, `onMoveDown`, `isFirst`, `isLast` props — these are no longer needed
2. Add a drag handle to the block header using `useSortable` from `@dnd-kit/sortable`:
   - Import `useSortable` from `@dnd-kit/sortable`
   - Call `const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })`
   - Apply `setNodeRef` to the outer wrapper div
   - Apply style: `transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 50 : undefined`
   - Import `CSS` from `@dnd-kit/utilities`
3. Replace the ↑↓ buttons in the header with a drag handle icon:
   - Use `GripVertical` from lucide-react (already imported or add it)
   - Apply `{...attributes} {...listeners}` to the grip icon button
   - Style: `cursor: grab`, `touch-action: none`
   - When `isDragging`, show `cursor: grabbing`

**New Props type** (remove the move/order props):
```typescript
type Props = {
  block: BlockRow
  // Remove: onMoveUp, onMoveDown, isFirst, isLast
}
```

---

## Task 3: Update `src/components/dashboard/page-builder-client.tsx`

Read the current file first.

**Changes:**

1. Import dnd-kit:
```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
```

2. Remove `handleMoveUp` and `handleMoveDown` functions

3. Add sensors:
```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
)
```

4. Add `handleDragEnd`:
```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over || active.id === over.id) return

  const oldIndex = blockList.findIndex(b => b.id === active.id)
  const newIndex = blockList.findIndex(b => b.id === over.id)
  const reordered = arrayMove(blockList, oldIndex, newIndex).map((b, i) => ({
    ...b,
    sortOrder: i,
  }))

  setBlockList(reordered)

  startTransition(async () => {
    await reorderBlocks(reordered.map(b => ({ id: b.id, sortOrder: b.sortOrder })))
    router.refresh()
  })
}
```

5. Wrap the block list in `DndContext` + `SortableContext`:
```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={blockList.map(b => b.id)}
    strategy={verticalListSortingStrategy}
  >
    {blockList.map((block) => (
      <BlockEditorShell
        key={block.id}
        block={block}
        // Remove: onMoveUp, onMoveDown, isFirst, isLast props
      />
    ))}
  </SortableContext>
</DndContext>
```

6. Remove `startReorder` transition (was used for up/down) — replace with the `startTransition` in `handleDragEnd` above. Keep `startAdd` for the add-block flow.

---

## Task 4: Verify

```bash
bun run build
```

Then run `bun dev` and manually test:
- Open `/dashboard/content/homepage`
- Drag a block up or down — should reorder smoothly
- Refresh page — new order should persist
- Expand a block, edit, save — should still work after dnd refactor

---

## Completion Report

Report:
1. Exact packages installed and versions (`bun add` output)
2. Files modified
3. That onMoveUp/onMoveDown props are fully removed from both files
4. Build passes (0 errors)
5. Any issues encountered
