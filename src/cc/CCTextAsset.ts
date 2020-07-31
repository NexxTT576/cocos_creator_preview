import { readFileSync } from "fs";
import { basename, extname, join } from "path";
import { cc } from ".";

export class CCTextAsset {
  private meta: CCTextAssetMeta;
  private data: string;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = readFileSync(scpath, "utf-8");
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.TextAsset"]);
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
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: "cc.TextAsset",
          _name: basename(this.path, extname(this.path)),
          _objFlags: 0,
          _native: "",
          text: this.data
        },
        null,
        2
      )
    );
  }
}

interface CCTextAssetMeta {
  ver: string;
  uuid: string;
  subMetas: any;
}
