# linen

A calm design language for React apps: tokens, motion, and the components that wear them, built on Tailwind CSS 4, Base UI and Motion. [LANGUAGE.md](https://github.com/lutyjj/linen/blob/main/LANGUAGE.md) states the rules the components follow, and `pnpm specimen` draws every component in every state.

## Usage

In an app that builds with Tailwind CSS 4, install a [release](https://github.com/lutyjj/linen/releases) and its peers:

<!-- x-release-please-start-version -->

```sh
version=0.1.1
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
