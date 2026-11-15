import { Button, LinenProvider } from "linen";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (root === null) throw new Error("no #root element");
createRoot(root).render(
    <LinenProvider>
        <Button variant="primary">Save</Button>
    </LinenProvider>,
);
