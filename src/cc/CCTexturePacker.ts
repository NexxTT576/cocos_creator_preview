import { cc } from ".";
import { join, basename, extname } from "path";
export class CCTexturePacker {
  static type = "Texture Packer";
  private meta: CCTexturePackerMeta;
  private name: string;
  private path: string;
  constructor(meta: any, p: string) {
    this.path = p;
    this.name = basename(p);
    this.meta = meta;
    this.serialize();
  }
  serializeInfo: serialize = {
    __type__: "cc.SpriteAtlas",
    _name: "",
    _objFlags: 0,
    _native: "",
    _spriteFrames: {}
  };
  serialize() {
    cc.testResources(this.meta, ["cc.SpriteAtlas"]);
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
    this.serializeInfo._name = this.name;
    for (let k in this.meta.subMetas) {
      const k2 = basename(k, extname(k));
      this.serializeInfo._spriteFrames[k2] = {
        __uuid__: this.meta.subMetas[k].uuid
      };
      new cc.SpriteFrame(this.meta.subMetas[k], k2, this.meta.uuid);
    }
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(this.serializeInfo, null, 2)
    );
  }
}

export interface CCTexturePackerMeta {
  ver: string;
  uuid: string;
  type: string;
  rawTextureUuid: string;
  size: {
    width: number;
    height: number;
  };
  subMetas: {
    [key: string]: any;
  };
}

interface serialize {
  __type__: string;
  _name: string;
  _objFlags: number;
  _native: string;
  _spriteFrames: {
    [key: string]: {
      __uuid__: string;
    };
  };
}
