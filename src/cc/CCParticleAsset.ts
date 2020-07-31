import { basename, extname, join, dirname } from "path";
import { cc } from ".";
import { readFileSync } from "fs";
import { parse, build } from "plist";

export class CCParticleAsset {
  private meta: CCParticleAssetMeta;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    //this.data = JSON.parse(readFileSync(scpath, "utf-8")) as any[];
    this.serialize();
  }
  serialize() {
    cc.testResources(this.meta, ["cc.ParticleAsset"]);
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
    let xmldata = parse(readFileSync(this.path, "utf-8")) as any;
    let ext = extname(this.path);
    let name = basename(this.path, ext);
    let textureFileName = xmldata.textureFileName;

    let texture = null;
    if (textureFileName != "") {
      let dir = dirname(this.path);
      let texturePath = join(dir, textureFileName + ".meta");
      let meta = JSON.parse(readFileSync(texturePath, "utf-8"));
      texture = {
        __uuid__: meta.uuid
      };
      delete xmldata.textureFileName;
      cc.writeFileSync(
        join(
          cc.importsPath,
          this.meta.uuid.substr(0, 2),
          this.meta.uuid + ext.toLowerCase()
        ),
        build(xmldata)
      );
    } else {
      cc.copyFileSync(
        this.path,
        join(
          cc.importsPath,
          this.meta.uuid.substr(0, 2),
          this.meta.uuid + ext.toLowerCase()
        )
      );
    }
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: "cc.ParticleAsset",
          _name: name,
          _objFlags: 0,
          _native: ext.toLowerCase(),
          texture: texture
        },
        null,
        2
      )
    );
  }
}

interface CCParticleAssetMeta {
  ver: string;
  uuid: string;
  subMetas: any;
}
