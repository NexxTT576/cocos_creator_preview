import {
  readdirSync,
  lstatSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
  rmdirSync
} from "fs";
import { extname, join, basename } from "path";
import { cc } from "./cc";
import { CCSettings } from "./cc/CCSettings";

const projectpath = process.argv[2];
const webpath = process.argv[3];
const createorDefalutpath = "app/default-assets";
//const createorDefalutpath = "C:/CocosCreator/resources/static/default-assets";

cc.project = projectpath;
cc.webpath = webpath;
console.log("webpath", process.argv);
cc.importsPath = join(webpath, "library/imports");

class Createor {
  hasError: boolean = false;
  path: string = "";
  files: string[] = []; //项目所有文件路径
  exts: string[] = []; // 项目所有文件扩展名
  metas: IMetas = {};
  walk(path: string) {
    if (this.path == "") this.path = path;
    let files = readdirSync(path);
    files.forEach(f => {
      let ext = extname(f);
      if (ext != ".meta") {
        let f2 = join(path, f);
        let stat = lstatSync(f2);
        this.files.push(f2);
        let index = this.exts.indexOf(ext);
        if (index == -1) this.exts.push(ext);
        if (stat.isDirectory()) {
          this.walk(f2);
        }
      }
    });
  }

  libfiles: ILibUuids = {}; // 当前解析出来
  libUuids: ILibUuids = {}; //缓存文件 meta信息 时间戳
  library() {
    let library = cc.webpath + "/library";
    if (!existsSync(library)) {
      mkdirSync(library);
    } else {
      let libUuidsPath = join(library, "uuid-to-mtime.json");
      if (existsSync(libUuidsPath)) {
        this.libUuids = JSON.parse(
          readFileSync(libUuidsPath, "utf-8")
        ) as ILibUuids;
      }
    }
  }

  readMetaInfos() {
    this.files.forEach(e => {
      const metaPath = e + ".meta";
      if (!existsSync(metaPath)) {
        console.error("meta文件不存在", metaPath);
        this.hasError;
        return;
      } else {
        const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as IMeta;
        this.metas[meta.uuid] = meta;
        const stat = lstatSync(e);
        const statmeta = lstatSync(metaPath);
        let e2 = e.replace(/\\/g, "/");
        let beDefault = /app\/default-assets\//.test(e2);
        e2 = e2.replace(createorDefalutpath + "/", "");
        e2 = e2.replace(projectpath + "/", "");
        //if (process.platform) e2 = e2.replace(/\//g, "\\");
        this.libfiles[meta.uuid] = {
          asset: stat.mtime.getTime(),
          meta: statmeta.mtime.getTime(),
          relativePath: e2,
          beDefault: beDefault
        };
      }
    });
    if (!existsSync(cc.webpath + "/library"))
      mkdirSync(cc.webpath + "/library");
    // console.log(JSON.stringify(this.libfiles));
    cc.uuidInfos = this.libfiles;
    cc.uuidInfosBuf = this.libUuids;
    writeFileSync(
      cc.webpath + "/library/uuid-to-mtime2.json",
      JSON.stringify(this.libfiles, null, 2)
    );
    console.log("写入当前uuid-to-mtime", process.cwd());
    for (let k in this.files) {
      let e = this.files[k];
      const metaPath = e + ".meta";
      if (!existsSync(metaPath)) {
        console.error("meta文件不存在", metaPath);
        this.hasError;
        return;
      } else {
        const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as IMeta;
        this.assetToLibrary(meta, e);
      }
    }
  }

  assetToLibrary(meta: IMeta, e: string) {
    const ext = extname(e);
    switch (ext.toLowerCase()) {
      case ".png":
      case ".jpg":
      case ".webp":
      case "jpeg":
      case ".bmp":
        new cc.Texture2D(meta, e);
        break;
      case ".plist":
        if (meta.type == cc.TexturePacker.type) new cc.TexturePacker(meta, e);
        else if ("type" in meta == false) {
          new cc.ParticleAsset(meta, e);
        }
        break;
      case ".fire":
        new cc.Scene(meta, e);
        break;
      case ".prefab":
        new cc.Prefab(meta, e);
        break;
      case ".anim":
        new cc.Animation(meta, e);
        break;
      case ".json":
        new cc.JsonAsset(meta, e);
        break;
      case ".pac":
        new cc.Pac(meta, e);
        break;
      case ".tmx":
        new cc.TiledMapAsset(meta, e);
        break;
      case ".ttf":
        new cc.TTF(meta, e);
        break;
      case ".fnt":
        new cc.BitmapFont(meta, e);
        break;
      case ".labelatlas":
        new cc.LabelAtlas(meta, e);
        break;
      case ".js":
        new cc.js(meta, e);
        break;
      case ".ts":
        if (e.substr(e.length - 5, e.length) != ".d.ts") {
          new cc.ts(meta, e);
        }
        break;
      case ".mp3":
      case ".wav":
        new cc.AudioClip(meta, e);
        break;
      case ".tsx":
      case ".md":
      case ".txt":
        //文件默认都按 TextAsset 处理
        new cc.TextAsset(meta, e);
        break;
      case ".mp4":
      case ".atlas":
        new cc.Asset(meta, e);
        break;
    }
  }

  cleanBin() {
    console.log("clean bin * *");
    for (let k in this.libUuids) {
      if (!(k in this.libfiles)) {
        let uuidpath = join(cc.importsPath, k.substr(0, 2));
        if (!existsSync(uuidpath)) continue;
        if (existsSync(join(uuidpath, k))) {
          let files = readdirSync(join(uuidpath, k)) as Array<any>;
          files.forEach(e => {
            let f = join(uuidpath, k, e);
            console.log("unlinkSync", f);
            unlinkSync(f);
          });
          rmdirSync(join(uuidpath, k));
        }
        let files = readdirSync(join(uuidpath)) as Array<any>;
        files.forEach(e => {
          let b = basename(e, extname(e));
          b = basename(b, extname(b));
          if (b == k) {
            let f = join(uuidpath, e);
            console.log("unlinkSync", f);
            unlinkSync(f);
          }
        });
        let files2 = readdirSync(join(uuidpath)) as Array<any>;
        if (files2.length == 0) rmdirSync(join(uuidpath));
      }
    }
    // cc.SpriteFrame
    let files1 = readdirSync(cc.importsPath) as Array<string>;
    files1.forEach(e1 => {
      let p1 = join(cc.importsPath, e1);
      let files2 = readdirSync(p1) as Array<string>;
      files2.forEach(e2 => {
        if (extname(e2) == ".json") {
          let data = JSON.parse(readFileSync(join(p1, e2), "utf-8"));
          if (
            data.__type__ == "cc.SpriteFrame" &&
            !(data.content.texture in this.libfiles)
          ) {
            console.log("unlinkSync", join(p1, e2));
            unlinkSync(join(p1, e2));
          }
        }
      });
      let files3 = readdirSync(join(p1)) as Array<any>;
      if (files3.length == 0) rmdirSync(p1);
    });

    writeFileSync(
      cc.webpath + "/library/uuid-to-mtime.json",
      JSON.stringify(this.libfiles, null, 2)
    );
  }

  testLibraryType(t: string, path: string) {
    let files = readdirSync(path);
    files.forEach(f => {
      let f2 = join(path, f);
      let stat = lstatSync(f2);
      if (stat.isDirectory()) {
        this.testLibraryType(t, f2);
      } else {
        let ext = extname(f);
        let filename = basename(f, ext);
        if (ext == ".json") {
          const j = JSON.parse(readFileSync(f2, "utf-8"));
          if (j.__type__ == "cc.Texture2D") {
            console.log(
              "content",
              j.content,
              this.libfiles[filename].relativePath
            );
          }
        }
      }
    });
  }
}

var main = async () => {
  let c = new Createor();
  let time1 = new Date().getTime();
  c.path = "";
  c.walk(createorDefalutpath);
  c.path = "";
  c.walk(projectpath);
  c.library();
  c.readMetaInfos();
  if (c.hasError) return;

  new CCSettings();
  let time2 = new Date().getTime();
  console.log("花费时间:", time2 - time1);
  c.cleanBin();
  let time3 = new Date().getTime();
  console.log("清理花费时间:", time3 - time2);
};
main();

interface ILibUuids {
  [key: string]: {
    asset: number; //asset 时间戳
    meta: number; // meta时间戳
    relativePath: string; //路径
    beDefault?: boolean;
  };
}
interface IMetas {
  [key: string]: IMeta;
}

interface IMeta {
  ver: string; // 版本号 没什么用
  uuid: string; // uuid 肯定有
  type: string;
}
