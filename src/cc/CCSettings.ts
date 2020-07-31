import { build } from "plist";
import { readFileSync } from "fs";
import { cc } from ".";
import { join, basename } from "path";
// 导出 setting info
export class CCSettings {
  projectInfo: any;
  buildInfo: any;
  info: any = {};
  static jsList: string[] = [];
  static scenes: { url: string; uuid: string }[] = [];
  static assets: { [key: string]: any[] } = {};
  static scripts: { bname: string; deps: string[]; file: string }[] = [];
  constructor() {
    this.projectInfo = JSON.parse(
      readFileSync(join(cc.project, "../settings", "project.json"), "utf-8")
    );
    this.buildInfo = JSON.parse(
      readFileSync(join(cc.project, "../settings", "builder.json"), "utf-8")
    );
    this.serialize();
  }
  serialize() {
    let scripts: any[] = [];
    let keys: any = {};
    for (let k in CCSettings.scripts) {
      keys[CCSettings.scripts[k].bname] = k;
    }
    for (let k in CCSettings.scripts) {
      let deps: any = {};
      scripts[k] = {};
      for (let k2 in CCSettings.scripts[k].deps) {
        let s = CCSettings.scripts[k].deps[k2];
        let s2 = basename(s, ".js");
        if (keys[s2] != undefined) {
          deps[s] = parseInt(keys[s2]);
        }
      }
      scripts[k].deps = deps;
      scripts[k].file = CCSettings.scripts[k].file;
    }
    this.info = {
      designWidth: this.projectInfo["simulator-resolution"].width,
      designHeight: this.projectInfo["simulator-resolution"].height,
      groupList: this.projectInfo["group-list"],
      collisionMatrix: this.projectInfo["collision-matrix"],
      platform: "web-desktop",
      scripts: scripts,
      rawAssets: {
        assets: CCSettings.assets
      },
      jsList: CCSettings.jsList,
      launchScene:
        "db://assets/" +
        cc.uuidInfos[this.buildInfo["startScene"]].relativePath,
      scenes: CCSettings.scenes,
      packedAssets: {},
      md5AssetsMap: {},
      debug: true
    };
    cc.writeFileSync(
      cc.webpath + "/settings.js",
      "window._CCSettings = " + JSON.stringify(this.info, null, 2)
    );
  }
}

interface projectInfo {
  "cocos-analytics": {
    appID: "13798";
    appSecret: "959b3ac0037d0f3c2fdce94f8421a9b2";
    channel: "000000";
    enable: false;
    version: "1.7.0";
  };
  "collision-matrix": [
    [false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false],
    [false, false, false, true, true, false, false],
    [false, false, true, false, false, false, true],
    [false, false, true, false, false, false, false],
    [false, false, false, false, false, true, false],
    [false, false, false, true, false, false, false],
    [false, false, false, false, false, false, false, false]
  ];
  "design-resolution-height": 640;
  "design-resolution-width": 960;
  "excluded-modules": [];
  "fit-height": true;
  "fit-width": false;
  "group-list": [
    "Default",
    "Background",
    "Actor",
    "Platform",
    "Wall",
    "Collider",
    "Bullet",
    "Ui"
  ];
  "simulator-orientation": false;
  "simulator-resolution": {
    height: 640;
    width: 960;
  };
  "start-scene": "d13475c7-b37e-45d6-b6c5-25929e8a0925";
  "use-customize-simulator": false;
  "use-project-simulator-setting": false;
}

interface buildInfo {
  "android-instant": {
    REMOTE_SERVER_ROOT: "";
    host: "";
    pathPattern: "";
    recordPath: "";
    scheme: "https";
    skipRecord: false;
  };
  appKey: "";
  appSecret: "";
  encryptJs: false;
  excludeScenes: [];
  "fb-instant-games": {
    hide: false;
  };
  includeAnySDK: false;
  includeSDKBox: false;
  inlineSpriteFrames: true;
  inlineSpriteFrames_native: false;
  jailbreakPlatform: false;
  md5Cache: false;
  mergeStartScene: false;
  oauthLoginServer: "";
  optimizeHotUpdate: true;
  orientation: {
    landscapeLeft: true;
    landscapeRight: true;
    portrait: false;
    upsideDown: false;
  };
  packageName: "org.cocos2d.examplecases";
  privateKey: "";
  qqplay: {
    orientation: "portrait";
  };
  startScene: "d13475c7-b37e-45d6-b6c5-25929e8a0925";
  title: "examplecases";
  webOrientation: "landscape";
  wechatgame: {
    REMOTE_SERVER_ROOT: "";
    appid: "wx6ac3f5090a6b99c5";
    isSubdomain: false;
    orientation: "landscape";
    subContext: "";
  };
  xxteaKey: "de565b49-7232-43";
  zipCompressJs: true;
}
