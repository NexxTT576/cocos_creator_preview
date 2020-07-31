import { readFileSync, existsSync } from "fs";
import { basename, extname, join, dirname } from "path";
import { cc } from ".";
import { parse } from "plist";

export class CCTiledMapAsset {
  private meta: CCTiledMapAssetMeta;
  private data: string;
  private path: string;
  private textures: any[] = [];
  private textureNames: any[] = [];
  private tsxFiles: any[] = [];
  private tsxFileNames: any[] = [];
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = readFileSync(scpath, "utf-8");
    this.serialize();
  }
  private parseTilesetImages(tilesetNode: any, dir: string) {
    let images = tilesetNode.getElementsByTagName("image");
    for (var i = 0, n = images.length; i < n; i++) {
      let imageCfg = images[i].getAttribute("source");
      this.textureNames.push(imageCfg);
      let meta = JSON.parse(
        readFileSync(join(dir, imageCfg + ".meta"), "utf-8")
      );
      this.textures.push({
        __uuid__: meta.uuid
      });
    }
  }
  serialize() {
    cc.testResources(this.meta, ["cc.TiledMapAsset"]);
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
    let dir = dirname(this.path);
    let doc = cc.DOMParser.parseFromString(this.data);
    let tilesetElements = doc.documentElement.getElementsByTagName("tileset");
    for (let i = 0; i < tilesetElements.length; i++) {
      let tileset = tilesetElements[i];
      let sourceTSX = tileset.getAttribute("source");
      if (sourceTSX) {
        let tsxPath = join(dirname(this.path), sourceTSX);
        if (existsSync(tsxPath)) {
          this.tsxFileNames.push(sourceTSX);
          let tsxmetapath = join(dir, sourceTSX + ".meta");
          let tsxmeta = JSON.parse(readFileSync(tsxmetapath, "utf-8"));
          this.tsxFiles.push({
            __uuid__: tsxmeta.uuid
          });
          let tsxContent = readFileSync(tsxPath, "utf-8");
          let tsxDoc = cc.DOMParser.parseFromString(tsxContent);
          this.parseTilesetImages(tsxDoc, dir);
        }
      }
      this.parseTilesetImages(tileset, dir);
    }

    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: "cc.TiledMapAsset",
          _name: basename(this.path, extname(this.path)),
          _objFlags: 0,
          _native: "",
          tmxXmlStr: this.data,
          textures: this.textures,
          textureNames: this.textureNames,
          tsxFiles: this.tsxFiles,
          tsxFileNames: this.tsxFileNames
        },
        null,
        2
      )
    );
  }
}

interface CCTiledMapAssetMeta {
  ver: string;
  uuid: string;
  subMetas: any;
}
