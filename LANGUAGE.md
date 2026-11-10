# The language

An interface in linen is paper, hairlines and one ink. The content is the loudest thing on a page; the chrome around it steps back. `src/styles/linen.css` holds every token below, and `src/motion.tsx` every duration. A component that states a colour, type size, radius or duration instead of naming a token is wrong; spacing comes from the 4px scale. The specimen (`pnpm specimen`) draws all of it with the components themselves.

## Colour

Every neutral takes the app's `--hue` at a chroma of 0.02 or less, so the page is one temperature. Tints are mixes of an ink into the surface, never colours picked by eye. Each colour is one `light-dark()` pair; the page follows the system scheme, and `data-theme` on the root pins either.

| Token                                  | Marks                                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `ink`, `accent`                        | What a hand can act on or has set: the primary action, links, focus, the current place, a chosen option |
| `accent-weak`                          | The ink mixed into the surface: hover, the current place's fill, a notice                               |
| `warn`                                 | A state that wants attention, and nothing else                                                          |
| `danger`                               | Removal and failure                                                                                     |
| `positive`                             | Something gained or arrived                                                                             |
| `bg`, `surface`, `sunken`              | The page, a card on it, a band below the page (the rail, a well, a form opened inside a card)           |
| `border`, `border-strong`              | Hairlines between surfaces; the frame of a control                                                      |
| `text`, `text-secondary`, `text-muted` | The thing; what it means; text about it (labels, units, times)                                          |

Depth is tone. Nothing at rest casts a shadow; `shadow-overlay` belongs to what floats over the page: popups, dialogs, toasts and the rail's tips.

## Type

| Voice   | Face             | Speaks for                                                 |
| ------- | ---------------- | ---------------------------------------------------------- |
| Display | `--font-display` | The wordmark and a screen's title                          |
| Working | `--font-sans`    | Everything else                                            |
| Mono    | `--font-mono`    | What is typed or copied exactly: addresses, commands, keys |

Hierarchy comes from weight and colour before size: a step down in importance moves from `text` to `text-secondary` to `text-muted` first. Everything is in sentence case. Figures read in columns are tabular.

## Layout

| Part     | Component                                    | Holds                                                                                                                                                                                                                                                                                                                                                       |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell    | `Shell`                                      | The rail on a desk (foldable to its icons) and the screen beside it. Below `md`, `phoneNav` puts the places in a tab bar along the bottom (the default) or in a bar along the top that scrolls away. The wordmark, and the mark of a folded rail, lead `home`                                                                                               |
| Top bar  | `TopBar`, `TitleField`                       | The screen's title at the left, its actions at the right; sticky. A screen under another names the screens above it in a small `trail` over the title, each a link; past two steps the outer ones fold behind one button, so the trail stays one short line. An editable name is a `TitleField`, as wide as its words. `wide` spans an editor's whole width |
| Sections | `SectionNav`                                 | A screen's concerns as routes, under the top bar; one row that scrolls on a phone                                                                                                                                                                                                                                                                           |
| Column   | `Content`, `COLUMN_CLASS`                    | Every band centres its contents in `--width-content`, so a title and the card below share edges                                                                                                                                                                                                                                                             |
| Card     | `Card`, `CardHead`, `CardBody`, `FormBand`   | One concern each. The head holds a title, a count beside it, a description and actions                                                                                                                                                                                                                                                                      |
| Setting  | `SettingRow`, `SettingToggle`, `SettingNote` | One setting per row: name, what it does, its control at the end of the row while there is room                                                                                                                                                                                                                                                              |
| Empty    | `EmptyState`                                 | What would be here, and the way to start                                                                                                                                                                                                                                                                                                                    |

Anything that floats at the foot of a phone's screen, as a toast does, stands `--inset-tabbar` above the edge: the tab bar's height while one is on the page, nothing otherwise. The frame starts below `--inset-top`, the band a translucent status bar covers in an app saved to a phone's home screen: the rail and the phone's top bar reach up under it in their own colour, and everything sticky sticks below it. A screen outside the shell keeps clear of it itself.

Every card's contents start on `--spacing-gutter` (12px, 16px from `md`). Two settings never share a line. Actions sit beside a card's title while there is room and under its description once there is not.

## Controls

| Height token               | Height | Used by                                      |
| -------------------------- | ------ | -------------------------------------------- |
| `--height-control`         | 32px   | Buttons, fields, pickers, segmented controls |
| `--height-control-compact` | 28px   | Filters and bar chips                        |
| `--height-control-inline`  | 24px   | Inline edits and row chips                   |

- A button wears a frame and a fill, never words alone. One primary per card, form or dialog. A destructive button sets its words in `danger` inside the same frame and opens a confirmation. A link that starts an action wears `buttonClass()`; a link in running text wears `LINK_CLASS`.
- A field wears the same frame everywhere, its name above it and its hint below. A unit sits inside the frame, after the value.
- A picker ends in one chevron, which turns while its list is open. Its list is never wider than the screen beside it, and a long choice wraps. A list of more than one kind of thing holds each kind under its heading. A field's stated width gives way to a narrower row.
- A setting that takes effect as it turns is a `Switch`; a choice a form submits later is a `Checkbox`. A choice whose answers each need a line is `OptionCards`.
- Making something asks in a `FormDialog`; every dialog lays out its title, description, body and actions with `DialogLayout`.
- A destructive act confirms in a `ConfirmDialog` that says what it does. An act that can be put back exactly takes a toast's undo instead.
- Work a person keeps with a save button is a draft: `useUnsavedChanges` reports it to the one `UnsavedChangesGuard` around the pages (inside a data router, whose navigation it holds), which asks before leaving a page that holds unsaved drafts, names them, and lets the browser ask before the tab closes. A setting that takes effect as it turns is no draft.
- A toast is Base UI's: it stands over every dialog and answers a press without closing it. F6 takes the keyboard to it and Shift+Tab back, its time rests while a pointer or the keyboard is on it, and a swipe or Escape sends it away.
- A value to take whole is a `CopyValue`; a secret shown once is a `ShownOnce`.

## Motion

Motion says what changed and where it went, and never holds input.

- A change applies at once and the animation follows it. Anything leaving is inert from its first frame.
- Every frame is true: an interrupted animation turns from where it stands.
- Only opacity and transforms move, except a height that is itself the change (a panel unfolding, a view swapping).
- `prefers-reduced-motion` makes every duration zero and leaves loops at rest, read live.

Durations are springs with no bounce; a component names a purpose, never a length. `motion.tsx` publishes the first three to CSS as `--motion-leave`, `--motion-state` and `--motion-enter`.

| Token      | Length | For                                                     |
| ---------- | ------ | ------------------------------------------------------- |
| `leave`    | 120ms  | Something on its way out                                |
| `state`    | 180ms  | A mark sliding, a control changing, a panel folding     |
| `enter`    | 280ms  | An arrival, or travel to a new place                    |
| `stagger`  | 80ms   | The step between related arrivals                       |
| `mark`     | 1200ms | A new row's tint fading                                 |
| `land`     | 1000ms | A refresh indicator's turn                              |
| `thinking` | 1500ms | One pass of light across a control waiting on an answer |

| Pattern                | Component                                             | Motion                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A screen changes       | `Shell`                                               | The next screen fades in over `enter` once it has drawn                                                                                                        |
| A popup opens          | `POPUP_CLASS`                                         | Grows from its control's edge over `enter`, leaves toward it over `leave`                                                                                      |
| A dialog opens         | `DialogRoot`, `DialogShell`                           | Rises in the middle with its scrim over `enter`, keeps its words while it leaves                                                                               |
| A panel unfolds        | `DisclosurePanel`                                     | Travels to its height over `enter`, folds over `state`                                                                                                         |
| A view swaps           | `Swap`                                                | Travels between heights over `enter` while the views cross-fade                                                                                                |
| A choice moves         | `SegmentedControl`, `SectionNav`, the phone's top bar | The chosen mark slides over `state`; in the top bar the places make room over `state` and the chosen one's words fade in over `enter`                          |
| A toast comes and goes | `useToast`                                            | Arrives over `enter`, fades over `leave`; follows a swipe and leaves the way it was swiped                                                                     |
| A list changes         | `SettlingRows`                                        | Rows close up over `enter`; an arrival wears `accent-weak` for `mark`. A list takes its `scope` once its rows have loaded, so none of them reads as an arrival |
| Something arrives      | `arrive()`                                            | Settles once with a 4px rise over `enter`, `stagger` apart                                                                                                     |
| The theme changes      | `createThemeStore`                                    | One cross-fade of the whole page                                                                                                                               |

Typing, hovering, focusing, sorting and filtering stay instant: they are the reader's own acts, repeated many times a minute.

### The frame budget

At 120 Hz a frame has 8.3ms. An animation the compositor runs is smooth whatever the main thread does; one that needs the main thread is smooth only while nothing else runs there.

- An animation never re-renders React on each frame. A component that observes its own size observes only what it lays out.
- What costs a render happens before the motion starts: a screen change draws the next screen while the old one is still shown, and only then fades it in.
- Layout projection (Motion's `layout` and `layoutId`) moves small things: a chosen mark, the places of the phone's top bar and the rows of a list. Scroll containers declare `layoutScroll`, so scrolling is not mistaken for a row edit, and a new list scope remounts its rows without travel or arrival marks.
- Reduced motion also turns off row and shared-element projection, and the theme changes without its cross-fade.

## Every action shows its end state

A control answers rest, hover, focus, active and disabled in its own body, and busy wherever it starts something asynchronous. A write lands somewhere visible, a failure names what failed and offers the retry where the fault is, and a state a person can enter but cannot see or leave is a defect.
