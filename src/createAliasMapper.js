import path from "path";

// import type { T_FILE_NAME, T_ALIAS_NAME, T_PATH, T_REG_EXP_SEARCH_STR, T_REG_EXP_SEARCH_FLAGS } from "./types";
import {DEFAULT_EXTENSIONS, NAMES_SEPARATOR_LENGTH} from "./const";
import { unwrappModule } from "./utils";
import { aliasGroupsFrom, matchFile } from "./tsConfigUtils";


/*
interface I_ALIAS_MAPPER_CREATER_OPTIONS {
  tsconfig?: Parameters<typeof unwrappModule>[0];
  dirname?: string; //All resolved paths from tsconfig will be concated with this dir
  extensions?: Array<T_EXT_NAME>; //List of possible extensions for a file geted from alias, it`s used when path extension is not specified
  async?: Parameters<typeof matchFile>[1]["async"]; //When set "true", the file path matching will run sync blocked parent thread
  excludeFilter?: Parameters<typeof matchFile>[1]["excludeFilter"];
}
*/

const createAliasMapper = (options/*: I_ALIAS_MAPPER_CREATER_OPTIONS*/)/*: (a: T_FILE_NAME | T_ALIAS_NAME | (T_ALIAS_NAME & T_PATH_CHUNK))=>T_FILENAME*/ => {
  const {current: tsconfig, dirName: tsconfigDirName} = unwrappModule(options.tsconfig, options.dirname);
  const extensions = options.extensions?.filter((ext, i, self)=>self.indexOf(ext) === i) || DEFAULT_EXTENSIONS;
  const baseDirName = [".", "./"].includes(tsconfig.compilerOptions.baseUrl) ? tsconfigDirName : path.resolve(tsconfigDirName, tsconfig.compilerOptions.baseUrl);
  const aliasGroups = aliasGroupsFrom(tsconfig);
  const regExpByAllGroups/*: [T_REG_EXP_SEARCH_STR, T_REG_EXP_SEARCH_FLAGS]*/ = (([names, searchFlags])=>[
    `((${names.join(")|(")}))`, // [groupRegExp1, groupRegExp2, groupRegExp3, ....] => "((groupRegExp1)|(groupRegExp2)|(groupRegExp3)|....)"
    searchFlags.filter((f, i, self)=>(i === self.indexOf(f))).join("") // ["g", "m", "m", "m", "i", ....] => "gmi...."
  ])(aliasGroups.reduce(
    (res, {regExp})=>{
      res[0].push(regExp[0]);
      res[1].push(regExp[1]);
      return res
    },
    [[], []]
  ));

  return async (fileName) => {
    const matchResult/*: null | Parameters<typeof matchFile>[0]*/ = null;
    aliasGroups.find(({regExp, aliasMap, type})=>{
      if ( !(fileName.match(new RegExp(...regExp))) ) {return;}
      const aliasName = Object.keys(aliasMap).find(name=>fileName.startsWith(name));
      return (matchResult = {
        type,
        extensions,
        prefixes: aliasMap[aliasName],
        postfix: fileName.slice(aliasName.length + NAMES_SEPARATOR_LENGTH),
      })
    });

    if (matchResult) {
      const currentFileName = await matchFile(matchResult, {baseDirName, async: options.async, excludeFilter: options.excludeFilter});
      return currentFileName || fileName;
    } else {
      return fileName;
    }
  }
}


export { createAliasMapper }
