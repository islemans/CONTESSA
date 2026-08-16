import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Rewritten by `npx convex dev` on every push — not ours to lint.
    "convex/_generated/**",
  ]),
  {
    rules: {
      /*
       * Advisory here rather than an error.
       *
       * The remaining uses are all the same shape: seeding local editable
       * state from an async source (a Convex query populating a form draft,
       * localStorage restoring the cart and the admin session) and closing a
       * drawer when the route changes. Each one needs to re-run when that
       * source changes, and each is deliberate — see the comment at the call
       * site. Genuine violations still surface as warnings.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
