import { CCTexture2D } from "./CCTexture2D";
import { join, sep, extname } from "path";
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from "fs";
import { CCSpriteFrame } from "./CCSpriteFrame";
import { CCTexturePacker } from "./CCTexturePacker";
import { CCScene } from "./CCScene";
import { CCPrefab } from "./CCPrefab";
import { CCTextAsset } from "./CCTextAsset";
import { CCAnimation } from "./CCAnimation";
import { CCJsonAsset } from "./CCJsonAsset";
import { CCPac } from "./CCPac";
import { CCTiledMapAsset } from "./CCTiledMapAsset";
import { CCAudioClip } from "./CCAudioClip";
import { CCAsset } from "./CCAsset";
import { CCParticleAsset } from "./CCParticleAsset";
import { DOMParser } from "xmldom";
import { CCTTFFont } from "./CCTTFFont";
import { CCBitmapFont } from "./CCBitmapFont";
import { CCLabelAtlas } from "./CCLabelAtlas";
import { CCJavascript } from "./CCJavascript";
import { CCSettings } from "./CCSettings";
import { CCTypescript } from "./CCTypescript";

const fscopyFileSync = copyFileSync;
const fswriteFileSync = writeFileSync;

export namespace cc {
  export class Texture2D extends CCTexture2D {}
  export class SpriteFrame extends CCSpriteFrame {}
  export class TexturePacker extends CCTexturePacker {}
  export class Scene extends CCScene {}
  export class Prefab extends CCPrefab {}
  export class Animation extends CCAnimation {}
  export class Pac extends CCPac {}
  export class JsonAsset extends CCJsonAsset {}
  export class AudioClip extends CCAudioClip {}
  export class TiledMapAsset extends CCTiledMapAsset {}
  export class Asset extends CCAsset {}
  export class ParticleAsset extends CCParticleAsset {}
  export class TextAsset extends CCTextAsset {}
  export class TTF extends CCTTFFont {}
  export class BitmapFont extends CCBitmapFont {}
  export class LabelAtlas extends CCLabelAtlas {}
  export class js extends CCJavascript {}
  export class ts extends CCTypescript {}

  export function copyFileSync(src: string, dest: string) {
    let arrs = dest.split(sep);
    let p = "";
    while (arrs.length > 1) {
      p = join(p, arrs.shift() as string);
      if (!existsSync(p)) mkdirSync(p);
    }
    fscopyFileSync(src, dest);
  }
  export function writeFileSync(src: string, data: any) {
    let arrs = src.split(sep);
    let p = "";
    while (arrs.length > 1) {
      p = join(p, arrs.shift() as string);
      if (!existsSync(p)) mkdirSync(p);
    }
    fswriteFileSync(src, data);
  }

  export var uuidInfos: ILibUuids;
  export var uuidInfosBuf: ILibUuids; //上一次信息
  export var project: string;
  export var webpath: string;
  export var DOMParser: DOMParser;
  export var importsPath: string;
  export function testResources(meta: any, infos: any[]) {
    let uuid = meta.uuid;
    let url = cc.uuidInfos[uuid].relativePath.replace(/\\/g, "/");
    if (url.substr(0, 10) == "resources/") {
      CCSettings.assets[uuid] = [];
      CCSettings.assets[uuid].push(url.substr(10, url.length));
      CCSettings.assets[uuid] = CCSettings.assets[uuid].concat(infos);
      if (infos[0] == "cc.Texture2D") {
        for (let key in meta.subMetas) {
          uuid = meta.subMetas[key].uuid;
          CCSettings.assets[uuid] = [];
          var url2 = url.substr(10, url.length);
          var ext = extname(url2);
          CCSettings.assets[uuid].push(
            url2.substr(0, url2.length - ext.length)
          );
          CCSettings.assets[uuid] = CCSettings.assets[uuid].concat([
            "cc.SpriteFrame",
            1
          ]);
        }
      }
    }
  }
}
cc.DOMParser = new DOMParser();

interface ILibUuids {
  [key: string]: {
    asset: number; //asset 时间戳
    meta: number; // meta时间戳
    relativePath: string; //路径
    beDefault?: boolean;
  };
}
