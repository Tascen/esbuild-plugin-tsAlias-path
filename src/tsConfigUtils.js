import fs from "fs";
import path from "path";

// import type { I_TS_CONFIG, T_REG_EXP_SEARCH_STR, T_REG_EXP_SEARCH_FLAGS, T_ALIAS_NAME, T_PATH, T_FOLDER_NAME, T_FILE_NAME, T_EXT_NAME } from "./types";
import { NAMES_SEPARATOR_LENGTH } from "./const";



/*
type T_ALIAS_GROUPS_FROM_FUNC_ARGS = [I_TS_CONFIG];
type T_ALIAS_GROUPS_FROM_FUNC_CALL_RESULT = Array<{
  type: T_MATCH_FILE_FUNC_ARGS[0]["type"],
  aliasMap: {[k: T_ALIAS_NAME]: Array<T_PATH>},
  regExp: [T_REG_EXP_SEARCH_STR, T_REG_EXP_SEARCH_FLAGS],
}>;
*/
function aliasGroupsFrom({compilerOptions: {paths = {}}}/*: T_ALIAS_GROUPS_FROM_FUNC_ARGS[0]*/)/*: T_ALIAS_GROUPS_FROM_FUNC_CALL_RESULT*/ {
  const res = [
    {
      type: "chunkAlias",
      aliasMap: {},
      regExp: [(pathVariants)=>`^((${pathVariants.join("|")})|(${pathVariants.join("|")})[\\\/][\.a-zA-Z0-9]*)$`, "m", []]
    },
    {
      type: "fullAlias",
      aliasMap: {},
      regExp: [(pathVariants)=>`^(${pathVariants.join("|")})$`, "m", []]
    }
  ];

  Object.entries(paths).forEach(([alias, pathVariants]) => {
    if ( alias === "*" ) {
      throw new Error("Path like: {\"*\": [...]} not supported");
    } else if ( alias.endsWith("*") ) {
      const aliasName = alias.slice(0, (-1 * (NAMES_SEPARATOR_LENGTH + "*".length)));
      res[0].regExp[2].push(aliasName);
      Object.assign(res[0].aliasMap, {[aliasName]: pathVariants.map(variant=>variant.slice(0, (-1 * (NAMES_SEPARATOR_LENGTH + "*".length))))})

    } else {
      res[1].regExp[2].push(alias);
      Object.assign(res[1].aliasMap, {[alias]: pathVariants});

    }
  });

  return res
    .filter(({aliasMap})=>Object.keys(aliasMap).length)
    .map(({type, aliasMap, regExp})=>({
      type,
      aliasMap,
      regExp: [regExp[0](regExp[2]), regExp[1]],
    }));
}

/*
type T_MATCH_FILE_FUNC_ARGS = [
  {
    type: "fullAlias" | "chunkAlias",
    extensions: Array<T_EXT_NAME>,
    prefixes: Array<T_PATH>,
    postfix: Array<T_PATH>,
  },
  {
    baseDirName: T_FOLDER_NAME,
    excludeFilter: RegExp,
    async?: boolean,
  }
];
type T_MATCH_FILE_FUNC_CALL_RESULT = "" | T_FILE_NAME;
*/
async function matchFile({type, extensions, prefixes, postfix}/*: T_MATCH_FILE_FUNC_ARGS[0]*/, {baseDirName, ...flags}/*: T_MATCH_FILE_FUNC_ARGS[1]*/ = {})/*: T_MATCH_FILE_FUNC_CALL_RESULT*/ {
  const accessFunc = guardFanc(flags.async ? fs.promises.access : fs.accessSync, flags);
  let fileName = ""

  if (type === "fullAlias") {
    searchLoop: for (const prefix of prefixes) {
      fileName = path.resolve(baseDirName, prefix);
      try {
        !(await accessFunc(fileName, fs.constants.F_OK));
        if ( !!path.extname(fileName) ) {break searchLoop;}
      } catch {
        fileName = "";
      }
    }

  } else if (type === "chunkAlias") {
    const postfixes = [postfix, path.join(postfix, "index")].filter(str=>str);
    extensions = ["", ...extensions];

    searchLoop: for (const postfix of postfixes) {
      for (const prefix of prefixes) {
        for (const ext of extensions) {
          fileName = path.resolve(baseDirName, prefix, postfix + ext);
          try {
            !(await accessFunc(fileName, fs.constants.F_OK));
            if ( !!path.extname(fileName) ) {break searchLoop;}
          } catch {
            fileName = "";
          }
        }
      }
    }
  }

  return fileName;
}
function guardFanc(fsFunc/*: (f: T_FILE_NAME, f: string)=>any*/, {excludeFilter}/*: {excludeFilter: RegExp}*/)/*: void | ReturnType<typeof fsFunc>*/ {
  return async (fileName, format) => {
    if (excludeFilter && fileName.match(excludeFilter)) {throw new Error("")}
    return await fsFunc(fileName, format);
  }
}


export { aliasGroupsFrom, matchFile };
