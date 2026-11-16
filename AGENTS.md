# AGENTS.md

linen is a design language for React apps and the components that wear it, built on Tailwind CSS 4, Base UI and Motion. Apps install it from a GitHub release and run it on React, or on Preact through `preact/compat` with Motion resolved to `linen/still`.

## Maintenance rules

- **linen is generic.** It holds only what an app that shares nothing with another app but the language could use. No product's nouns, sample data, fixtures, defaults or documentation enter it. A component earns its place as a building block; anything that names one app's domain is composed in that app from linen's parts. The specimen draws its samples from one invented, neutral domain.
- **Treat linen as greenfield.** No compatibility shims, aliases, deprecated paths or second implementations. Break an API when the better design needs it, and mark the commit as breaking (`feat!:` and a `BREAKING CHANGE:` footer saying what an app changes) so the release notes carry it.
- Complete a replacement in one change: remove the superseded code, exports, tokens, tests, specimen samples and documentation with it. Keep one implementation of each contract.
- What an app does not use stays out of its bundle. Apps ship linen inside size budgets, some in a device's flash. A module does nothing when it is imported, a provider composes only what every app needs, and a feature an app may skip is opt-in. A new dependency or peer must earn its bytes against the platform, Base UI and a small implementation in linen.
- Required peers are what every consumer's code imports; a Preact app answers React's through `preact/compat`. An optional peer is imported only behind its own subpath (`linen/react-router`) or a documented alias (`motion` to `linen/still`).
- Preserve unrelated edits. Do not run separate processes that write `dist/`, `specimen/dist/` or `node_modules/` at the same time.
- **This repository is public.** Write for a stranger. Nothing in the tree, commit messages, pull requests or issues may describe the maintainer's environment, other projects or people: hostnames, addresses, paths, deployments, names, credentials. Use reserved example domains (`example.com`, `example.test`) and invented names. Before committing, read the diff with that reader in mind.

## Ownership and boundaries

| Path                                                  | Responsibility                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LANGUAGE.md`                                         | The design rules: tokens, type, layout, controls, motion, and the one mechanism for each job                                                                                                                                                                                   |
| `README.md`                                           | How an app installs, styles, wraps and configures linen                                                                                                                                                                                                                        |
| `src/index.ts`                                        | The public entry: every export, listed by module                                                                                                                                                                                                                               |
| `src/LinenProvider.tsx`                               | What the components share above them: words, navigation and Motion's configuration                                                                                                                                                                                             |
| `src/theme.ts`                                        | The theme preference store                                                                                                                                                                                                                                                     |
| `src/foundation/`                                     | Class joining and the class groups it merges (`merge-config.ts`, generated), the words components say on their own, the tones, the content column, a control's answers (`Choice`), whether an act's answer is still to come, viewport hooks, and the surface every popup wears |
| `src/motion/`                                         | Motion tokens and policy, and the components whose job is movement                                                                                                                                                                                                             |
| `src/still/`                                          | `linen/still`, which stands in for Motion                                                                                                                                                                                                                                      |
| `src/feedback/`                                       | What reports a state: status labels, messages, the app's standing conditions, gauges, progress, a task's steps, and text a machine writes                                                                                                                                      |
| `src/controls/`                                       | Buttons, chips, toggles, choices and copyable values                                                                                                                                                                                                                           |
| `src/fields/`                                         | Fields, pickers and the frame they share                                                                                                                                                                                                                                       |
| `src/overlays/`                                       | Dialogs and toasts                                                                                                                                                                                                                                                             |
| `src/navigation/`                                     | The `Navigation` contract, which place is current, the unsaved-work guard, and `linen/react-router`                                                                                                                                                                            |
| `src/layout/`                                         | The shell, the top bar, section navigation, the content column, cards, settings, facts and panels                                                                                                                                                                              |
| `src/styles/`                                         | `linen.css`, the tokens and base styles an app imports; `motion.css`, every state and motion the stylesheet runs                                                                                                                                                               |
| `src/test/`                                           | Test setup for each Vitest project                                                                                                                                                                                                                                             |
| `specimen/`                                           | The app that draws every component in every state                                                                                                                                                                                                                              |
| `consumer/`                                           | An app built from `dist` the way a lean app builds linen, on Preact without Motion: it type-checks with strict library checks, and each page stays inside its budget (`budget.json`, held by `budget.ts`)                                                                      |
| `tools/`                                              | What linen generates from its own sources: the class groups `classes()` merges with (`pnpm run generate`)                                                                                                                                                                      |
| `tsdown.config.ts`                                    | The package build, which writes `package.json`'s `exports`                                                                                                                                                                                                                     |
| `flake.nix`, `.github/`, `release-please-config.json` | The toolchain, the release build that runs every check, CI, and how Release Please versions a release                                                                                                                                                                          |
| `CHANGELOG.md`, `.release-please-manifest.json`       | Written by Release Please; never edit them by hand                                                                                                                                                                                                                             |

A module imports only from the modules after it in this order: `layout`, `navigation`, `overlays`, `fields`, `feedback`, `controls`, `motion`, `foundation`. `foundation` and `still` import nothing else from linen, and the files at the root of `src/` compose the modules. A component never imports a router; links and the current place come from the app's `navigation`. Tests sit beside the code they test.

`LANGUAGE.md` owns the design rules. Read it before changing a component, and change it in the same commit as the rule. This file does not restate them.

## Commands

The flake provides Node and pnpm; do not install tools on the host. Run scripts as `nix develop -c pnpm <script>`.

| Command                | Scope                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `pnpm specimen`        | The specimen, served by Vite                                                                                          |
| `pnpm specimen:still`  | The specimen with Motion resolved to `linen/still`                                                                    |
| `pnpm specimen:preact` | The specimen on Preact through `preact/compat`, with Motion resolved to `linen/still`                                 |
| `pnpm test`            | Every test with Motion, again with `linen/still`, and again on Preact                                                 |
| `pnpm run build`       | The package in `dist/`, checked by publint and attw, and the `exports` it writes into `package.json`                  |
| `pnpm run check`       | The full gate: build, Prettier, ESLint, types, tests, the specimen's three builds, and `consumer/`'s budgets          |
| `pnpm format`          | Format every file Prettier owns                                                                                       |
| `pnpm run generate`    | Rewrite what `tools/` generates, after a component writes a class of a new kind                                       |
| `nix flake check`      | The release build: `pnpm run check` from the locked dependencies, `exports` parity, the packed tarball, a Node import |

After changing `pnpm-lock.yaml`, update the `pnpmDeps` hash in `flake.nix` as its comment says.

## Verification and completion

- `pnpm run check` must pass before work is complete. A change to the release assembly (`flake.nix`, `tsdown.config.ts`, `package.json`, the lockfile) also needs `nix flake check`. Report the commands and their results, including checks that failed or could not run.
- Look at every component you change in the specimen, with Motion, with `linen/still` and on Preact, in both themes and at desk and phone widths. Tailwind drops a class it does not know without an error, so only the drawn page shows a misspelt utility. A new component or state gets its sample in the specimen.
- Every component test runs with Motion, with `linen/still` and on Preact; a Motion prop that reaches the page fails the run. A component test moves through `src/test/memoryNavigation.tsx`, and only `linen/react-router`'s own tests use React Router.
- A change that adds weight to `consumer/`'s pages raises `budget.json` in the same commit and says why.
- Add tests where they protect behaviour an app relies on. Assert through roles, names and what a person sees, with expectations derived from the contract; a class name is an assertion only where the stylesheet keys on it. Tests own their clocks and fixtures.
- Documentation-only edits need a read against the prose rules below and a check that every link and path they name exists.

## Collaboration

Commit messages are Conventional Commits, `type: subject` in the present tense. Reviews use Conventional Comments: `label (decoration): subject`, such as `issue: ...` or `suggestion (non-blocking): ...`.

Prose in documentation and comments states what is true now, for a stranger. No em dashes, attribution trailers, filler or change-history narration; history belongs in commit messages. Keep comments short and delete any the code already says.

Record durable lessons in their owning code, test, automation or documentation. Add a rule here only when it applies across the repository and fills a gap; revise an existing rule when it already covers the lesson.
