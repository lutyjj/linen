# linen

A calm design language for React apps: tokens, motion, and the components that wear them, built on Tailwind CSS 4, Base UI, Motion and React Router. [LANGUAGE.md](https://github.com/lutyjj/linen/blob/main/LANGUAGE.md) states the rules the components follow, and `pnpm specimen` draws every component in every state.

## Usage

In an app that builds with Tailwind CSS 4, install a [release](https://github.com/lutyjj/linen/releases) and its peers:

```sh
pnpm add https://github.com/lutyjj/linen/releases/download/v0.1.0/linen-0.1.0.tgz \
    react react-dom react-router motion @base-ui/react lucide-react
```

Import the stylesheet after Tailwind:

```css
@import "tailwindcss";
@import "linen/linen.css";
```

Wrap the app once in `LinenProvider`, which holds the toasts and the words the components say. `Shell`, `TopBar` and `SectionNav` render router links, so they also need a React Router router above them.

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
