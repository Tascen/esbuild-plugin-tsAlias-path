/*
  >>>> Warning <<<<

  This ".ts" file is not valid, and exists only to provide simple docs.
*/



type T_ALIAS_NAME = string;
type T_PATH = string | "\\" | "/";
type T_FOLDER_NAME = T_PATH;
type T_FILE_NAME = T_PATH & T_EXT_NAME;
type T_EXT_NAME = "." & string;

interface I_TS_CONFIG {
  compilerOptions: {
    baseUrl: T_FOLDER_NAME,
    paths = {
      [k: (T_ALIAS_NAME | (T_ALIAS_NAME & "/*"))]: Array<T_FILE_NAME | (T_FOLDER_NAME & "/*")>,
    },
  },
  includes: Array<(T_FOLDER_NAME | "/*") | (T_FOLDER_NAME | "/**/*") | T_FILE_NAME>,
}
type T_ESBUILD_LOADER_NAME = string; //For learn all allowed name see: https://esbuild.github.io/content-types/

type T_REG_EXP_SEARCH_STR = string; //It`s JS format, but it must be based on Go lang standard, for learn more see: https://esbuild.github.io/plugins/#filters
type T_REG_EXP_SEARCH_FLAGS = string; //It also js format and it should be comparable to the Go language standard, for learn more see: https://esbuild.github.io/plugins/#filters
type T_STRINGIFIED_OBJ = ReturnType<JSON.stringify(object)>;


export type {
  T_ALIAS_NAME, T_PATH, T_FOLDER_NAME, T_FILE_NAME, T_EXT_NAME,
  I_TS_CONFIG, T_ESBUILD_LOADER_NAME,
  T_REG_EXP_SEARCH_STR, T_REG_EXP_SEARCH_FLAGS, T_STRINGIFIED_OBJ,
}
