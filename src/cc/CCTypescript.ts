import { readFileSync } from "fs";
import { join, basename, extname, dirname, relative } from "path";
import { cc } from ".";
import { encodeuuid2 } from "./lib/decode-uuid";
import { removeMapFileComments } from "convert-source-map";
import { CCSettings } from "./CCSettings";
const RTEMP = /(?<=(=require|^require|\srequire)\(["|'])([\w|.|\/]+)(?=["|']\))/g;

export class CCTypescript {
  private meta: CCTypescriptMeta;
  private data: string;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = readFileSync(this.path, { encoding: "utf-8" });
    this.serialize();
  }
  serialize() {
    {
      let bname = basename(this.path, extname(this.path));
      let deps = this.data.match(RTEMP) as string[];
      let jsp = join(
        dirname(cc.uuidInfos[this.meta.uuid].relativePath),
        bname + ".js"
      );
      jsp = jsp.replace(/\\/g, "/");
      if (deps == null) deps = [];
      CCSettings.scripts.push({
        bname: bname,
        deps: deps,
        file: "preview-scripts/assets/" + jsp
      });
    }

    let ts = require("typescript");
    let temp = null;
    try {
      temp = ts.transpileModule(this.data, {
        compilerOptions: {
          target: "ES5",
          sourceMap: !0,
          allowJS: !0,
          experimentalDecorators: !0,
          allowSyntheticDefaultImports: !0,
          pretty: !0,
          noEmitHelpers: !0,
          noImplicitUseStrict: !0,
          module: ts.ModuleKind.CommonJS
        }
      });
    } catch (error) {
      console.log(error);
    }

    let map = JSON.parse(temp.sourceMapText);
    map.sourcesContent = [this.data];
    map.file = "";
    temp.sourceMapObject = map;
    temp.outputText = removeMapFileComments(temp.outputText);
    cc.writeFileSync(
      join(cc.importsPath, this.meta.uuid.substr(0, 2), this.meta.uuid + ".js"),
      `"use strict";
cc._RF.push(module, '${encodeuuid2(this.meta.uuid)}', '${basename(
        this.path,
        ".ts"
      )}');
// ${cc.uuidInfos[this.meta.uuid].relativePath}

${temp.outputText}
cc._RF.pop();`
    );
    // cc.writeFileSync(
    //   join(
    //     cc.importsPath,
    //     this.meta.uuid.substr(0, 2),
    //     this.meta.uuid + ".js"
    //   ),
    //   temp.outputText
    // );
    map.mappings = ";;;;" + map.mappings;
    let sources = map.sources as any;
    for (let k in sources) {
      let d1 = join(
        relative(this.path, join(cc.project, "../..")),
        "assets",
        dirname(cc.uuidInfos[this.meta.uuid].relativePath)
      );
      let d2 = join("assets", cc.uuidInfos[this.meta.uuid].relativePath);
      sources[k] = d1 + "/" + d2;
      map.sourceRoot = d1;
    }
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".js.map"
      ),
      JSON.stringify({
        version: map.version,
        sources: map.sources,
        names: map.names,
        mappings: map.mappings,
        file: map.file,
        sourceRoot: map.sourceRoot,
        sourcesContent: map.sourcesContent
      })
    );
    let p = cc.uuidInfos[this.meta.uuid].relativePath;
    p = p.replace(/\.ts/, ".js");
    let core = `(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/${p}';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '${encodeuuid2(this.meta.uuid)}', '${basename(
      this.path,
      ".ts"
    )}', __filename);
// ${cc.uuidInfos[this.meta.uuid].relativePath}

${temp.outputText}
cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=${basename(this.path + ".map").replace(
          ".ts",
          ".js"
        )}
        `;

    cc.writeFileSync(join(cc.webpath, "preview-scripts/assets", p), core);
    for (let k in map.sources) {
      map.sources[k] = basename(map.sources[k]);
    }
    cc.writeFileSync(
      join(cc.webpath, "preview-scripts/assets", p + ".map"),
      JSON.stringify({
        version: map.version,
        sources: map.sources,
        names: map.names,
        mappings: map.mappings,
        file: map.file,
        sourceRoot: map.sourceRoot,
        sourcesContent: map.sourcesContent
      })
    );
  }
}
interface CCTypescriptMeta {
  ver: string;
  uuid: string;
  isPlugin: boolean;
  loadPluginInWeb: boolean;
  loadPluginInNative: boolean;
  loadPluginInEditor: boolean;
  subMetas: any;
}
