import { useState } from "react";

import { useUnsavedChanges } from "../navigation/UnsavedChanges";

/** A card of work kept with a save button, which a test types into. */
export function Draft({
    name,
    pending = false,
}: {
    name: string;
    pending?: boolean;
}) {
    const [value, setValue] = useState("");
    const [saved, setSaved] = useState("");
    useUnsavedChanges(value !== saved, { name, pending });
    return (
        <div>
            <label>
                {name}
                <input
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />
            </label>
            <button type="button" onClick={() => setSaved(value)}>
                Save {name}
            </button>
        </div>
    );
}
