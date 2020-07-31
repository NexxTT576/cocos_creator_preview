import { basename, extname, join } from "path";
import { cc } from ".";

export class CCTTFFont {
  private meta: CCTTFFontMeta;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    //this.data = JSON.parse(readFileSync(scpath, "utf-8")) as any[];
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.TTFFont"]);
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
          __type__: "cc.TTFFont",
          _name: name,
          _objFlags: 0,
          _native: name + ext.toLowerCase(),
          _fontFamily: null
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
        this.meta.uuid,
        name + ext.toLowerCase()
      )
    );
  }
}

interface CCTTFFontMeta {
  ver: string;
  uuid: string;
  subMetas: any;
}
