import { readFileSync } from "fs";
import { basename, extname, join } from "path";
import { cc } from ".";

export class CCJsonAsset {
  private meta: CCJsonAssetMeta;
  private data: string;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = JSON.parse(readFileSync(scpath, "utf-8"));
    this.serialize();
  }
  serialize() {
    if ("atlasJson" in this.meta && "texture" in this.meta) {
      cc.testResources(this.meta, ["dragonBones.DragonBonesAtlasAsset"]);
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
            __type__: "dragonBones.DragonBonesAtlasAsset",
            _name: basename(this.path, extname(this.path)),
            _objFlags: 0,
            _native: "",
            _atlasJson: this.meta.atlasJson,
            _texture: {
              __uuid__: this.meta.texture
            },
            texture: {
              __uuid__: this.meta.texture
            }
          },
          null,
          2
        )
      );
    } else if ("dragonBonesJson" in this.meta) {
      cc.testResources(this.meta, ["dragonBones.DragonBonesAsset"]);
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
            __type__: "dragonBones.DragonBonesAsset",
            _name: basename(this.path, extname(this.path)),
            _objFlags: 0,
            _native: "",
            _dragonBonesJson: this.meta.dragonBonesJson
          },
          null,
          2
        )
      );
    } else if (
      "atlas" in this.meta &&
      "textures" in this.meta &&
      "scale" in this.meta
    ) {
      cc.testResources(this.meta, ["sp.SkeletonData"]);
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
      let textures = [];
      let textureNames = [];
      for (let k in this.meta.textures) {
        textures.push({
          __uuid__: this.meta.textures[k]
        });
        textureNames.push(
          basename(cc.uuidInfos[this.meta.textures[k]].relativePath)
        );
      }
      var atlasid = this.meta.atlas ? this.meta.atlas : "";
      var atlas = readFileSync(
        join(cc.project, cc.uuidInfos[atlasid].relativePath),
        "utf-8"
      );
      cc.writeFileSync(
        join(
          cc.importsPath,
          this.meta.uuid.substr(0, 2),
          this.meta.uuid + ".json"
        ),
        JSON.stringify(
          {
            __type__: "sp.SkeletonData",
            _name: basename(this.path, extname(this.path)),
            _objFlags: 0,
            _native: "raw-skeleton.json",
            _skeletonJson: this.data,
            _atlasText: atlas,
            textures: textures,
            textureNames: textureNames,
            scale: this.meta.scale
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
          "raw-skeleton.json"
        )
      );
    } else {
      cc.testResources(this.meta, ["cc.JsonAsset"]);
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
            __type__: "cc.JsonAsset",
            _name: basename(this.path, extname(this.path)),
            _objFlags: 0,
            _native: "",
            json: this.data
          },
          null,
          2
        )
      );
    }
  }
}

interface CCJsonAssetMeta {
  ver: string;
  uuid: string;
  subMetas: any;
  atlasJson?: string;
  texture?: any;
  atlas?: string;
  scale?: number;
  textures?: any;
  dragonBonesJson?: any;
}
