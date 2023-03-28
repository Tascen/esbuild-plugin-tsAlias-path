// import { Plugin as T_Plugin } from "esbuild";
import fs from "fs";
import path from "path";

// import type { T_REG_EXP_SEARCH_STR, T_REG_EXP_SEARCH_FLAGS } from "./types";
import { PLUGIN_NAME, DEFAULT_EXTENSION_LOADER_MAP, DEFAULT_EXTENSIONS, NAMES_SEPARATOR_LENGTH, RESOLVED_PATH_NAMESPACE } from "./const";
import { unwrappModule } from "./utils";
import { aliasGroupsFrom, matchFile } from "./tsConfigUtils";



/*
interface I_ALIAS_PLUGIN_CREATER_OPTIONS {
  tsconfig?: Parameters<typeof unwrappModule>[0];
  dirname?: string; //All resolved paths from tsconfig will be concated with this dir
  extensions?: Array<T_EXT_NAME>; //List of possible extensions for a file geted from alias, it`s used when path extension is not specified
  excludeFilter?: Parameters<typeof matchFile>[1]["excludeFilter"];
}
*/

const createAliasPlugin = (options/*: I_ALIAS_PLUGIN_CREATER_OPTIONS*/ = {})/*: T_Plugin*/ => ({
  name: PLUGIN_NAME,
  setup(build) {
    const {current: tsconfig, dirName: tsconfigDirName} = unwrappModule(options.tsconfig || build.initialOptions.tsconfig, options.dirname);
    const extensionLoaderMap = {...DEFAULT_EXTENSION_LOADER_MAP, ...build.initialOptions.loader};
    const extensions = [...Object.keys(extensionLoaderMap), ... (options.extensions || DEFAULT_EXTENSIONS)].filter((ext, i, self)=>self.indexOf(ext) === i);
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

    aliasGroups.forEach(({regExp, aliasMap, type})=>(
      build.onResolve({filter: new RegExp(...regExp)}, ({path: fileName, ...args})=>{
        if (options.excludeFilter && fileName.match(options.excludeFilter)) {return undefined}
        const aliasName = Object.keys(aliasMap).find(name=>fileName.startsWith(name));
        return ({
          path: fileName,
          pluginData: ({
            type,
            extensions,
            prefixes: aliasMap[aliasName],
            postfix: fileName.slice(aliasName.length + NAMES_SEPARATOR_LENGTH),
          }/*as Parameters<typeof matchFile>[0]*/),
          namespace: RESOLVED_PATH_NAMESPACE,
        })
      })
    ));

    build.onLoad({filter: new RegExp(...regExpByAllGroups), namespace: RESOLVED_PATH_NAMESPACE}, async ({pluginData}/*: {pluginData: Parameters<typeof matchFile>[0]}*/)=>{
      const fileName = await matchFile(pluginData, {baseDirName, excludeFilter: options.excludeFilter});
      return !fileName
        ? {contents: "", resolveDir: ""}
        : {
          contents: await fs.promises.readFile(fileName, "utf8"),
          resolveDir: path.resolve(fileName, ".."),
          loader: extensionLoaderMap[path.extname(fileName)],
        };
    });
  },
});


export { createAliasPlugin };
