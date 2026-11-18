/**
 * What an element draws, with the values of the ids a render makes up left
 * out, since they differ from one render to the next. Whether an element
 * has an id, or points at one, stays in.
 */
export function markup(element: Element): string {
    return element.outerHTML.replace(
        / (id|for|aria-labelledby|aria-describedby|aria-controls)="[^"]*"/g,
        " $1",
    );
}
