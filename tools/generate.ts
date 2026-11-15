import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { holdsClasses, mergeConfigSource } from "./merge-config.ts";

/** Writes what linen generates from its own sources. */
const root = join(import.meta.dirname, "..");
const sources = readdirSync(join(root, "src"), {
    recursive: true,
    encoding: "utf8",
})
    .map((path) => join(root, "src", path))
    .filter((path) => /\.tsx?$/.test(path) && holdsClasses(path))
    .map((path) => readFileSync(path, "utf8"));
const out = join(root, "src/foundation/merge-config.ts");
writeFileSync(out, mergeConfigSource(sources));
console.log(`wrote ${relative(root, out)}`);
