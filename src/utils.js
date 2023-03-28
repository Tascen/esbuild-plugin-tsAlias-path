import path from "path";
// import filenameReservedRegex, {windowsReservedNameRegex} from "filename-reserved-regex";

// import type { T_STRINGIFIED_OBJ, T_FOLDER_NAME } from "./types";


const FILE_EXTENSIONS = [".json", ".js"]; //These are only file extensions that can be unwrapp without external utils

function unwrappModule(arg/*: T_STRINGIFIED_OBJ | object*/, dirName/*?: T_FOLDER_NAME*/)/*: void | {current: Object, dirName: T_FOLDER_NAME}*/ {
  const res = {
    current: {},
    dirName: dirName || "",
  };

  try {
    res.current = (arg && typeof(arg) === "object")
      ? arg
      : JSON.parse(arg);
  } catch {
    if ( !checkValidFilename(arg) ) {throw new Error(`File name *(${arg}) not valid string`)}
    if ( !FILE_EXTENSIONS.includes(path.extname(arg)) ) { throw new Error(`Invalid file\`s extension, must be one of ${JSON.stringify(FILE_EXTENSIONS)}`) }

    const fileName = path.resolve(dirName, arg);
    res.dirName = path.resolve(fileName, "..");
    res.current = require(fileName);
  }

  return res;
}

function checkValidFilename(value/*: string*/)/*: boolean*/ {
  return (value &&
    typeof(value) === "string" &&
    value.length <= 255 &&
    // !filenameReservedRegex().test(value) &&
    // !windowsReservedNameRegex().test(value) &&
    ![".", ".."].includes(value)
  );
}


export { unwrappModule };
