const langToExt : Record<string,string> = {
  "python" : "py",
  "python3" : "py",
  "csharp" : "cs",
  "javascript" : "js",
  "typescript" : "ts",
  "kotlin" : "kt",
  "ruby" : "rb",
  "rust" : "rs",
  "racket" : "rkt",
  "erlang" : "erl",
  "elixir" : "ex"
}

const sameExts = ["cpp" , "java" , "c" , "php" , "swift" , "dart" , "go" , "scala"]
sameExts.forEach((ext) => langToExt[ext] = ext)

export const getExtension = (language : string) => {
    const ext = langToExt[language.toLowerCase()]
    if(ext){
      return {
        "message" : "get-extension-success",
        "data" : ext,
        "success" : true
      }
    }
    console.error(`Error in getExtension : extension for specified language is undefined`)
    return {
      "message" : "get-extension-error",
      "data" : null,
      "success" : false
    }
}