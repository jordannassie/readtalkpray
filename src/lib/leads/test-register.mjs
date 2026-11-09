import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./test-hooks.mjs", pathToFileURL(import.meta.dirname + "/"));
