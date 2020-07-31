import { readFileSync } from "fs";
import { basename, join, relative, dirname, extname } from "path";
import { cc } from ".";
import { fromSource } from "convert-source-map";
import { transform } from "babel-core";
import { encodeuuid2 } from "./lib/decode-uuid";
import { CCSettings } from "./CCSettings";

const RTEMP = /(?<=(=require|^require|\srequire)\(["|'])([\w|.|\/]+)(?=["|']\))/g;

export class CCJavascript {
  private meta: CCJavascriptMeta;
  private data: string;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = readFileSync(this.path, { encoding: "utf-8" });
    this.serialize();
  }
  serialize() {
    if (this.meta.isPlugin == true) {
      cc.copyFileSync(
        this.path,
        join(cc.webpath, "assets", cc.uuidInfos[this.meta.uuid].relativePath)
      );
      CCSettings.jsList.push(
        join("assets", cc.uuidInfos[this.meta.uuid].relativePath).replace(
          /\\/g,
          "/"
        )
      );
      return;
    }

    {
      let bname = basename(this.path, extname(this.path));
      let deps = this.data.match(RTEMP) as string[];
      if (deps == null) deps = [];
      CCSettings.scripts.push({
        bname: bname,
        deps: deps,
        file:
          "preview-scripts/assets/" + cc.uuidInfos[this.meta.uuid].relativePath
      });
    }

    try {
      let inputSourceMap = !!fromSource(this.data);
      let core = transform(this.data, {
        ast: !1,
        highlightCode: !1,
        sourceMaps: !0,
        inputSourceMap: inputSourceMap as any,
        filename: cc.uuidInfos[this.meta.uuid].relativePath,
        presets: ["env"],
        plugins: [
          "transform-decorators-legacy",
          "transform-class-properties",
          "add-module-exports"
        ],
        compact: !1
      });
      let map = core.map as any;
      let sources = map.sources as any;
      //这里的逻辑写的是到 bin/library/imports的逻辑
      {
        core.code = `// ${cc.uuidInfos[this.meta.uuid].relativePath}

${core.code}

cc._RF.pop();`;
        cc.writeFileSync(
          join(
            cc.importsPath,
            this.meta.uuid.substr(0, 2),
            this.meta.uuid + ".js"
          ),
          `"use strict";
cc._RF.push(module, '${encodeuuid2(this.meta.uuid)}', '${basename(
            this.path,
            ".js"
          )}');
${core.code}`
        );

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

        map.mappings = ";;;;" + map.mappings;
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
      }
      //这里的逻辑是到  temp/quick-scripts
      {
        core.code = `(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/${
          cc.uuidInfos[this.meta.uuid].relativePath
        }';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '${encodeuuid2(this.meta.uuid)}', '${basename(
          this.path,
          ".js"
        )}', __filename);
${core.code}
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
        //# sourceMappingURL=${basename(this.path + ".map")}
        `;
        cc.writeFileSync(
          join(
            cc.webpath,
            "preview-scripts/assets",
            cc.uuidInfos[this.meta.uuid].relativePath
          ),
          core.code
        );
        for (let k in map.sources) {
          map.sources[k] = basename(map.sources[k]);
        }
        cc.writeFileSync(
          join(
            cc.webpath,
            "preview-scripts/assets",
            cc.uuidInfos[this.meta.uuid].relativePath + ".map"
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
      }
    } catch (t) {
      console.log("CCJavascript serialize", t);
    }
  }
}

interface CCJavascriptMeta {
  ver: string;
  uuid: string;
  isPlugin: boolean;
  loadPluginInWeb: boolean;
  loadPluginInNative: boolean;
  loadPluginInEditor: boolean;
  subMetas: any;
}
