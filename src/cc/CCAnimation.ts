import { readFileSync } from "fs";
import { basename, extname, join } from "path";
import { cc } from ".";

export class CCAnimation {
  private meta: CCAnimationMeta;
  private data: any;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = JSON.parse(readFileSync(scpath, "utf-8")) as any[];
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.AnimationClip"]);
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
    this.data._name = basename(this.path, extname(this.path));
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(this.data, null, 2)
    );
  }
}

interface CCAnimationMeta {
  ver: string;
  uuid: string;
  subMetas: any;
}
