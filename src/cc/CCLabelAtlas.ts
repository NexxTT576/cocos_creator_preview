import { extname, basename, join, dirname } from "path";
import { cc } from ".";
import { readFileSync } from "fs";

export class CCLabelAtlas {
  private meta: CCLabelAtlasMeta;
  private data: any;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = null;
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.LabelAtlas"]);
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
    let atlasName = basename(
      cc.uuidInfos[this.meta.rawTextureUuid].relativePath
    );
    let atlasMeta = JSON.parse(
      readFileSync(join(dirname(this.path), atlasName + ".meta"), "utf-8")
    );
    atlasName = basename(atlasName, extname(atlasName));
    let uuid = "";
    let subMeta = {} as any;
    for (let k in atlasMeta.subMetas) {
      uuid = atlasMeta.subMetas[k].uuid;
      subMeta = atlasMeta.subMetas[k];
    }
    let fontDefDictionary = {} as any;
    let cha = this.meta.startChar;
    let startCharid = cha.charCodeAt(0);
    let chaid = cha.charCodeAt(0);
    while (true) {
      let len = (chaid - startCharid) * this.meta.itemWidth;
      let y = Math.floor(len / subMeta.rawWidth) * this.meta.itemHeight;
      if (y > subMeta.rawHeight - this.meta.itemHeight) break;
      fontDefDictionary[chaid] = {
        rect: {
          x: len % subMeta.rawWidth,
          y: y,
          width: this.meta.itemWidth,
          height: this.meta.itemHeight
        },
        xOffset: 0,
        yOffset: 0,
        xAdvance: this.meta.itemWidth
      };
      chaid++;
    }

    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: "cc.LabelAtlas",
          _name: name,
          _objFlags: 0,
          _native: "",
          fntDataStr: "",
          spriteFrame: {
            __uuid__: uuid
          },
          fontSize: this.meta.fontSize,
          _fntConfig: {
            commonHeight: this.meta.itemHeight,
            fontSize: Math.round(this.meta.fontSize as number),
            atlasName: atlasName,
            fontDefDictionary: fontDefDictionary,
            kerningDict: {}
          }
        },
        null,
        2
      )
    );
  }
}

interface CCLabelAtlasMeta {
  ver: string;
  uuid: string;
  itemWidth: number;
  itemHeight: number;
  startChar: string;
  rawTextureUuid: string;
  fontSize: number;
  subMetas: any;
}
