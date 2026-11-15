# linen

A calm design language for React apps: tokens, motion, and the components that wear them, built on Tailwind CSS 4, Base UI and Motion. [LANGUAGE.md](https://github.com/lutyjj/linen/blob/main/LANGUAGE.md) states the rules the components follow, and `pnpm specimen` draws every component in every state.

## Usage

In an app that builds with Tailwind CSS 4, install a [release](https://github.com/lutyjj/linen/releases) and its peers:

<!-- x-release-please-start-version -->

```sh
version=0.3.0
pnpm add "https://github.com/lutyjj/linen/releases/download/v$version/linen-$version.tgz" \
    react react-dom motion @base-ui/react lucide-react
```

<!-- x-release-please-end -->

Import the stylesheet after Tailwind:

```css
@import "tailwindcss";
@import "linen/linen.css";
```

Wrap the app once in `LinenProvider`, which holds the toasts, the words the components say, and how the app moves between its pages.

```tsx
import { Button, LinenProvider } from "linen";

export function App() {
    return (
        <LinenProvider>
            <Button variant="primary">Save</Button>
        </LinenProvider>
    );
}
```

The links in `Shell`, `TopBar` and `SectionNav` are plain anchors that load the page they lead to. An app with a router hands its links to linen as `navigation`; for React Router, `linen/react-router` exports the adapter, and holding a move for unsaved work (`UnsavedChangesGuard`) needs a data router (`createBrowserRouter`):

```tsx
import { LinenProvider } from "linen";
import { reactRouter } from "linen/react-router";

<LinenProvider navigation={reactRouter}>{/* the app */}</LinenProvider>;
```

Another router takes a `Navigation` of its own: a `Link` that renders an anchor and moves the way the router does, a `usePathname` hook that follows the address, and, to hold moves for unsaved work, a `useBlocker` hook.

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
