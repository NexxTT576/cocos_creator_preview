import { readFileSync } from "fs";
import { basename, extname, join } from "path";
import { cc } from ".";
import { CCSettings } from "./CCSettings";

export class CCScene {
  private meta: CCSceneMeta;
  private data: any[];
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = JSON.parse(readFileSync(scpath, "utf-8")) as any[];
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.SceneAsset"]);
    CCSettings.scenes.push({
      url: "db://assets/" + cc.uuidInfos[this.meta.uuid].relativePath,
      uuid: this.meta.uuid
    });
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

    this.data[0]._name = basename(this.path, extname(this.path));
    this.data[0].asyncLoadAssets = this.meta.asyncLoadAssets;
    this.data[1].autoReleaseAssets = this.meta.autoReleaseAssets;
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

interface CCSceneMeta {
  ver: string;
  uuid: string;
  asyncLoadAssets: boolean;
  autoReleaseAssets: boolean;
  subMetas: any;
}
