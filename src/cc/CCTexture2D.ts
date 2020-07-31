import { gfx } from "./lib/gfx";
import { join, extname } from "path";
import { cc } from ".";

const GL_NEAREST = 9728; // gl.NEAREST
const GL_LINEAR = 9729; // gl.LINEAR
const GL_REPEAT = 10497; // gl.REPEAT
const GL_CLAMP_TO_EDGE = 33071; // gl.CLAMP_TO_EDGE
const GL_MIRRORED_REPEAT = 33648; // gl.MIRRORED_REPEAT

const CHAR_CODE_0 = 48; // '0'
const CHAR_CODE_1 = 49; // '1'
// 结合 C:\CocosCreator\resources\app.asar\editor\share\assets\meta\texture.js
// file:///C:/CocosCreator/resources/app.asar/editor/CCTexture2D.js
// 构造函数传入的是meta obj
export class CCTexture2D {
  static type = "Texture Packer";
  extnames = [".png", ".jpg", ".jpeg", ".bmp", ".webp"];
  extid = 0;
  path = "";
  private meta: CCTexture2DMeta;
  constructor(meta: any, path: string) {
    this.path = path;
    this.extid = this.extnames.indexOf(extname(path).toLowerCase());
    this.extid = this.extid < 0 ? 0 : this.extid;
    this.meta = meta;
    this.createAsset();
    this.serialize();
  }

  private createAsset() {
    switch (this.meta.wrapMode) {
      case "clamp":
        this.setWrapMode(WrapMode.CLAMP_TO_EDGE, WrapMode.CLAMP_TO_EDGE);
        break;
      case "repeat":
        this.setWrapMode(WrapMode.REPEAT, WrapMode.REPEAT);
        break;
    }
    switch (this.meta.filterMode) {
      case "point":
        this.setFilters(Filter.NEAREST, Filter.NEAREST);
        break;
      case "bilinear":
      case "trilinear":
        this.setFilters(Filter.LINEAR, Filter.LINEAR);
        break;
    }
    this.setPremultiplyAlpha(this.meta.premultiplyAlpha);
  }

  private wrapS: WrapMode = WrapMode.CLAMP_TO_EDGE;
  private wrapT: WrapMode = WrapMode.CLAMP_TO_EDGE;
  private setWrapMode(wrapS: WrapMode, wrapT: WrapMode) {
    this.wrapS = wrapS;
    this.wrapT = wrapT;
  }
  private minFilter: Filter = Filter.LINEAR;
  private magFilter: Filter = Filter.LINEAR;
  private setFilters(minFilter: Filter, magFilter: Filter) {
    this.minFilter = minFilter;
    this.magFilter = magFilter;
  }
  private premultiplyAlpha: boolean = false;
  private setPremultiplyAlpha(premultiply: boolean) {
    this.premultiplyAlpha = premultiply;
  }
  //序列化
  serializeInfo: serialize = {
    __type__: "cc.Texture2D",
    content: ""
  };
  serialize() {
    cc.testResources(this.meta, ["cc.Texture2D"]);
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
    const premultiplyAlpha = this.premultiplyAlpha ? 1 : 0;
    this.serializeInfo.content = `${this.extid},${this.minFilter},${
      this.magFilter
    },${this.wrapS},${this.wrapT},${premultiplyAlpha}`;
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(this.serializeInfo, null, 2)
    );
    cc.copyFileSync(
      this.path,
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + this.extnames[this.extid]
      )
    );
    for (let key in this.meta.subMetas) {
      new cc.SpriteFrame(this.meta.subMetas[key], key);
    }
  }
}

interface serialize {
  __type__: string;
  content: string;
}

//CCTexture2D meta 信息
interface CCTexture2DMeta {
  ver: string;
  uuid: string;
  type: string;
  wrapMode: string;
  filterMode: string;
  premultiplyAlpha: boolean;
  subMetas: { [key: string]: any };
}

export enum PixelFormat {
  RGB565 = gfx.TEXTURE_FMT_R5_G6_B5,
  RGB5A1 = gfx.TEXTURE_FMT_R5_G5_B5_A1,
  RGBA4444 = gfx.TEXTURE_FMT_R4_G4_B4_A4,
  RGB888 = gfx.TEXTURE_FMT_RGB8,
  RGBA8888 = gfx.TEXTURE_FMT_RGBA8,
  A8 = gfx.TEXTURE_FMT_A8,
  I8 = gfx.TEXTURE_FMT_L8,
  AI8 = gfx.TEXTURE_FMT_L8_A8
}

export enum WrapMode {
  REPEAT = GL_REPEAT,
  CLAMP_TO_EDGE = GL_CLAMP_TO_EDGE,
  MIRRORED_REPEAT = GL_MIRRORED_REPEAT
}

export enum Filter {
  LINEAR = GL_LINEAR,
  NEAREST = GL_NEAREST
}

export var FilterIndex = {
  9728: 0, // GL_NEAREST
  9729: 1 // GL_LINEAR
};
