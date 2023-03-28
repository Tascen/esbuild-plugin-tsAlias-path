// import type { T_EXT_NAME, T_ESBUILD_LOADER_NAME } from "./types";



const PLUGIN_NAME = "AliasPlugin"; //Must was string, because by docs plugin name can be only string. For more see: https://esbuild.github.io/plugins/
const RESOLVED_PATH_NAMESPACE = "tsAlias"; //Also must be string For more see: https://esbuild.github.io/plugins/#namespaces

const NAMES_SEPARATOR_LENGTH = 1; //It`s length of one of these chars: "\" or "/"
const DEFAULT_EXTENSION_LOADER_MAP/*: {[k: T_EXT_NAME]: T_ESBUILD_LOADER_NAME}*/ = {
  ".js": "js",
  ".jsx": "jsx",
  ".cjs": "js",
  ".mjs": "js",

  ".ts": "ts",
  ".tsx": "tsx",
  ".mts": "ts",
  ".cts": "ts",

  ".json": "json",
  ".css": "css",
  ".txt": "text",

  //...Other pairs need set on upper levels
}
const DEFAULT_EXTENSIONS = Object.keys(DEFAULT_EXTENSION_LOADER_MAP);


export {
  PLUGIN_NAME, RESOLVED_PATH_NAMESPACE,
  NAMES_SEPARATOR_LENGTH, DEFAULT_EXTENSION_LOADER_MAP, DEFAULT_EXTENSIONS
}
