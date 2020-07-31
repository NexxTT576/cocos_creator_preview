import { readFileSync } from "fs";
import { basename, extname, join } from "path";
import { cc } from ".";

export class CCPac {
  private meta: CCPacMeta;
  private data: string;
  private path: string;
  constructor(meta: any, scpath: string) {
    this.path = scpath;
    this.meta = meta;
    this.data = readFileSync(scpath, "utf-8");
    this.serialize();
  }
  serialize() {
    //cc.testResources(this.meta.uuid, ["cc.LabelAtlas"]);
    cc.writeFileSync(
      join(
        cc.importsPath,
        this.meta.uuid.substr(0, 2),
        this.meta.uuid + ".json"
      ),
      JSON.stringify(
        {
          __type__: "cc.SpriteAtlas",
          _name: basename(this.path, extname(this.path))
        },
        null,
        2
      )
    );
  }
}

interface CCPacMeta {
  ver: string;
  uuid: string;
  maxWidth: number;
  maxHeight: number;
  padding: number;
  allowRotation: boolean;
  forceSquared: boolean;
  powerOfTwo: boolean;
  heuristices: string;
  format: string;
  quality: number;
  contourBleed: boolean;
  paddingBleed: boolean;
  filterUnused: boolean;
  subMetas: any;
}
