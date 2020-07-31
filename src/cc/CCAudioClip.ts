import { basename, extname, join } from "path";
import { cc } from ".";
import { CCSettings } from "./CCSettings";

export class CCAudioClip {
  private meta: CCAudioClipMeta;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    //this.data = JSON.parse(readFileSync(scpath, "utf-8")) as any[];
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.AudioClip"]);
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
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: "cc.AudioClip",
          _name: name,
          _objFlags: 0,
          _native: ext.toLowerCase(),
          loadMode: 0
        },
        null,
        2
      )
    );
    cc.copyFileSync(
      this.path,
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ext.toLowerCase()
      )
    );
  }
}

interface CCAudioClipMeta {
  ver: string;
  uuid: string;
  downloadMode: number;
  subMetas: any;
}
