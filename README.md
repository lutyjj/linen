# linen

A calm design language for React apps: tokens, motion, and the components that wear them, built on Tailwind CSS 4, Base UI and Motion. [LANGUAGE.md](https://github.com/lutyjj/linen/blob/main/LANGUAGE.md) states the rules the components follow, and `pnpm specimen` draws every component in every state.

## Usage

In an app that builds with Tailwind CSS 4, install a [release](https://github.com/lutyjj/linen/releases) and its peers:

<!-- x-release-please-start-version -->

```sh
version=0.5.0
pnpm add "https://github.com/lutyjj/linen/releases/download/v$version/linen-$version.tgz" \
    react react-dom motion @base-ui/react lucide-react
```

<!-- x-release-please-end -->

Import the stylesheet after Tailwind:

```css
@import "tailwindcss";
@import "linen/linen.css";
```

Wrap the app once in `LinenProvider`, which holds the words the components say and how the app moves between its pages. An app that says things in toasts (`useToast`) also stands a `ToastProvider` inside it, once, around everything that calls it.

```tsx
import { Button, LinenProvider, ToastProvider } from "linen";

export function App() {
    return (
        <LinenProvider>
            <ToastProvider>
                <Button variant="primary">Save</Button>
            </ToastProvider>
        </LinenProvider>
    );
}
```

linen asks Base UI to draw no `<style>` of its own, and `linen.css` holds the rule it would have drawn, so a page served under a Content Security Policy that forbids inline styles needs no nonce for linen. An app whose policy names a nonce hands it to `LinenProvider` (`nonce`), which passes it to Base UI.

The links in `Shell`, `TopBar` and `SectionNav` are plain anchors that load the page they lead to. An app with a router hands its links to linen as `navigation`; for React Router, `linen/react-router` exports the adapter, and holding a move for unsaved work (`UnsavedChangesGuard`) needs a data router (`createBrowserRouter`):

```tsx
import { LinenProvider } from "linen";
import { reactRouter } from "linen/react-router";

<LinenProvider navigation={reactRouter}>{/* the app */}</LinenProvider>;
```

Another router takes a `Navigation` of its own: a `Link` that renders an anchor and moves the way the router does, a `usePathname` hook that follows the address, and, to hold moves for unsaved work, a `useBlocker` hook.

### Browsers

linen targets [Baseline Widely Available](https://web.dev/baseline): what every major browser has shipped for at least 30 months. A newer feature serves only as progressive enhancement, so a browser without it keeps every state and loses only polish: `@starting-style` (the entrance of a popup or dialog that opens as it mounts), `@property` (the fade of a new row's mark, which otherwise holds and then ends), scroll-driven animations (the hairlines at a dialog's scrolling edges), view transitions (the theme's cross-fade), and `scrollbar-width` and `scrollbar-color`.

### Without Motion

Motion is an optional peer. It carries what moves between states: an arrival rising in, a chosen mark sliding, rows settling. An app that has no room for it resolves `motion` to linen's stand-in, `linen/still`, and does not install Motion. In Vite:

```ts
export default defineConfig({
    resolve: {
        alias: [{ find: /^motion(\/react)?$/, replacement: "linen/still" }],
    },
});
```

Every state stays, and so does every motion the stylesheet runs: popups, dialogs, panels, toasts, a press, the rail's tips and fold, arrival marks, a refresh's turn and the theme's cross-fade. What Motion would carry lands where it would have ended, as it does for a reader who asks for less motion. linen's types do not name Motion, so the app type-checks without it. linen's code imports `motion/react`, so an app does one or the other: installs `motion`, or resolves it to `linen/still`.

### On Preact

linen runs on Preact 11 through `preact/compat`, without Motion. Its own tests run every component that way on Preact 11.2, whose `preact/compat` tells libraries it is React 19, and `pnpm specimen:preact` draws them. With Vite, `@preact/preset-vite` resolves React to `preact/compat`, and the app resolves Motion to `linen/still`:

```ts
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [preact(), tailwindcss()],
    resolve: {
        alias: [{ find: /^motion(\/react)?$/, replacement: "linen/still" }],
    },
});
```

pnpm and npm install `react` and `react-dom` for linen's peers, and the aliases keep them out of the bundle; aliasing them to `@preact/compat` in `package.json` instead leaves them unmet, as that package names React 18. React Router needs hooks Preact does not have, so a Preact app hands `LinenProvider` a `Navigation` of its own. `specimen/navigation.tsx` is one, over the browser's history.

To test screens built with linen in Vitest on Preact, compile every dependency from its module build, so each one that imports React meets `preact/compat`. Vitest loads CommonJS in Node, past every alias, so two packages need a hand: Testing Library, whose package points Node at its CommonJS build, takes its module build by name, and `use-sync-external-store`, which Base UI imports and which ships only as CommonJS, resolves to a module of the app's own on Preact's hook. The first goes once Testing Library's package hands Vitest its module build, the second once Base UI imports React's own `useSyncExternalStore`:

```ts
export default defineConfig({
    plugins: [preact()],
    resolve: {
        alias: [
            { find: /^motion(\/react)?$/, replacement: "linen/still" },
            {
                find: /^@testing-library\/react$/,
                replacement:
                    "@testing-library/react/dist/@testing-library/react.esm.js",
            },
            {
                find: /^use-sync-external-store\/shim(\/with-selector)?(\/index)?(\.js)?$/,
                replacement: "/src/test/use-sync-external-store.ts",
            },
        ],
        conditions: ["module", "browser", "development", "import"],
        noExternal: true,
    },
    test: { environment: "jsdom" },
});
```

```ts
// src/test/use-sync-external-store.ts
import { useCallback, useRef, useSyncExternalStore } from "preact/compat";

export { useSyncExternalStore };

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
    subscribe: (onChange: () => void) => () => void,
    getSnapshot: () => Snapshot,
    _getServerSnapshot: unknown,
    selector: (snapshot: Snapshot) => Selection,
    isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
    const last = useRef<{
        snapshot: Snapshot;
        selector: (snapshot: Snapshot) => Selection;
        selection: Selection;
    } | null>(null);
    const select = useCallback(() => {
        const snapshot = getSnapshot();
        const held = last.current;
        if (
            held !== null &&
            held.selector === selector &&
            Object.is(held.snapshot, snapshot)
        ) {
            return held.selection;
        }
        const selection = selector(snapshot);
        const kept =
            held !== null && isEqual?.(held.selection, selection) === true
                ? held.selection
                : selection;
        last.current = { snapshot, selector, selection: kept };
        return kept;
    }, [getSnapshot, selector, isEqual]);
    return useSyncExternalStore(subscribe, select);
}
```

jsdom has no `Element.prototype.getAnimations`, and Base UI then calls a close complete before Preact has drawn the closing state; giving it one that returns `[]` in the test setup makes jsdom behave as a browser does once its transitions end, until jsdom has its own. `vite.config.ts` and `src/test/setup.ts` in this repository hold the configuration linen's own tests use.
