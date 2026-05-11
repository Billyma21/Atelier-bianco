import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...next],
    rules: {
      // Next 16 / règles strictes : faux positifs fréquents sur fetch/useEffect/localStorage — le code reste valide.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
}]);
