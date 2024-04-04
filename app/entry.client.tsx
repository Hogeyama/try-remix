import { RemixBrowser } from "@remix-run/react";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { MuiProvider } from "~/lib/mui/MuiProvider";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <MuiProvider>
        <RemixBrowser />
      </MuiProvider>
    </StrictMode>,
  );
});
