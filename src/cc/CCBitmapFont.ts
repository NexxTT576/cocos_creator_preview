import { readFileSync } from "fs";
import { basename, extname, join, dirname } from "path";
import { cc } from ".";
import { fntparser } from "./lib/fnt-parser";

export class CCBitmapFont {
  private meta: CCBitmapFontMeta;
  private data: any;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = new fntparser().parseFnt(readFileSync(scpath, "utf-8"));
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.BitmapFont"]);
    console.log("复制并序列化", this.path, "进行中...");
    if (
      cc.uuidInfos[this.meta.uuid] == undefined ||
      (cc.uuidInfosBuf[this.meta.uuid] &&
        cc.uuidInfos[this.meta.uuid].asset <=
          cc.uuidInfosBuf[this.meta.uuid].asset &&
        cc.uuidInfos[this.meta.uuid].meta <=
          cc.uuidInfosBuf[this.meta.uuid].meta)
    )
      return;
    let ext = extname(this.path);
    let name = basename(this.path, ext);
    let spriteFrame = null;
    if (this.data.atlasName) {
      let spriteFramepath = join(dirname(this.path), this.data.atlasName);
      let meta = JSON.parse(readFileSync(spriteFramepath + ".meta", "utf-8"));
      let uuid = "";
      for (let k in meta.subMetas) {
        uuid = meta.subMetas[k].uuid;
      }
      spriteFrame = {
        __uuid__: uuid
      };
    }

    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: "cc.BitmapFont",
          _name: name,
          _objFlags: 0,
          _native: "",
          fntDataStr: "",
          spriteFrame: spriteFrame,
          fontSize: this.meta.fontSize,
          _fntConfig: this.data
        },
        null,
        2
      )
    );
  }
}

interface CCBitmapFontMeta {
  ver: string;
  uuid: string;
  textureUuid: string;
  fontSize: number;
  subMetas: any;
}
