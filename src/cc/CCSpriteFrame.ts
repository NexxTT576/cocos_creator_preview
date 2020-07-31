import { cc } from ".";
import { join } from "path";
export class CCSpriteFrame {
  private meta: CCSpriteFrameMeta;
  private name: string;
  private atlas: string;
  constructor(meta: any, name: string, atlas: string = "") {
    this.atlas = atlas;
    this.name = name;
    this.meta = meta;
    this.serialize();
  }
  //序列化
  serializeInfo: serialize = {
    __type__: "cc.SpriteFrame",
    content: {
      name: "",
      texture: "",
      atlas: "",
      rect: [0, 0, 0, 0],
      offset: [0, 0],
      originalSize: [0, 0],
      capInsets: [0, 0, 0, 0]
    }
  };
  serialize() {
    //cc.testResources(this.meta.uuid, ["cc.SpriteFrame", 1]);
    let content = this.serializeInfo.content;
    content.name = this.name;
    content.texture = this.meta.rawTextureUuid;
    content.atlas = this.atlas;
    content.rect = [
      this.meta.trimX,
      this.meta.trimY,
      this.meta.width,
      this.meta.height
    ];
    if (this.meta.rotated) content.rotated = 1;
    content.offset = [this.meta.offsetX, this.meta.offsetY];
    content.originalSize = [this.meta.rawWidth, this.meta.rawHeight];
    content.capInsets = [
      this.meta.borderLeft,
      this.meta.borderTop,
      this.meta.borderRight,
      this.meta.borderBottom
    ];
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: this.serializeInfo.__type__,
          content: {
            name: this.serializeInfo.content.name,
            texture: this.serializeInfo.content.texture,
            atlas: this.serializeInfo.content.atlas,
            rect: this.serializeInfo.content.rect,
            offset: this.serializeInfo.content.offset,
            originalSize: this.serializeInfo.content.originalSize,
            rotated: this.meta.rotated ? 1 : undefined,
            capInsets: this.serializeInfo.content.capInsets
          }
        },
        null,
        2
      )
    );
  }
}

interface CCSpriteFrameMeta {
  ver: string;
  uuid: string;
  rawTextureUuid: string;
  trimType: string;
  trimThreshold: number;
  rotated: boolean;
  offsetX: number;
  offsetY: number;
  trimX: number;
  trimY: number;
  width: number;
  height: number;
  rawWidth: number;
  rawHeight: number;
  borderTop: number;
  borderBottom: number;
  borderLeft: number;
  borderRight: number;
  subMetas: { [key: string]: any };
}

interface serialize {
  __type__: string;
  content: {
    name: string;
    texture: string;
    atlas: string;
    rect: number[];
    offset: number[];
    originalSize: number[];
    rotated?: number;
    capInsets: number[];
  };
}
