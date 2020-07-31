export class fntparser {
  private INFO_EXP = /info [^\n]*(\n|$)/gi;
  private COMMON_EXP = /common [^\n]*(\n|$)/gi;
  private PAGE_EXP = /page [^\n]*(\n|$)/gi;
  private CHAR_EXP = /char [^\n]*(\n|$)/gi;
  private KERNING_EXP = /kerning [^\n]*(\n|$)/gi;
  private ITEM_EXP = /\w+=[^ \r\n]+/gi;
  private INT_EXP = /^[\-]?\d+$/;

  private parseStrToObj(t: string) {
    let objstr = t.match(this.ITEM_EXP);
    let obj = {} as any;
    if (objstr) {
      for (let n = 0; n < objstr.length; n++) {
        let i = objstr[n],
          s = i.indexOf("="),
          o = i.substring(0, s),
          c = i.substring(s + 1);
        let c2 = undefined;
        c.match(this.INT_EXP)
          ? (c2 = parseInt(c))
          : '"' === c[0] && (c2 = c.substring(1, c.length - 1));
        obj[o] = c2;
      }
    }
    return obj;
  }

  parseFnt(t: string) {
    let data = {} as any;
    let info = t.match(this.INFO_EXP);
    let common = t.match(this.COMMON_EXP);
    if (!info || !common) return data;
    let n = this.parseStrToObj(info[0]);
    let a = this.parseStrToObj(common[0]);
    data.commonHeight = a.lineHeight;
    data.fontSize = parseInt(n.size);
    let page = t.match(this.PAGE_EXP) as any;
    let s = this.parseStrToObj(page[0]);
    if (s.id != 0)
      console.log("bitmap fnt PAGE_EXP 获取的id 为非0 可能有问题！");
    data.atlasName = s.file;
    data.fontDefDictionary = {} as any;
    let o = t.match(this.CHAR_EXP) as any;
    for (let h = 0; h < o.length; h++) {
      const f = this.parseStrToObj(o[h]);
      data.fontDefDictionary[f.id] = {
        rect: {
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height
        },
        xOffset: f.xoffset,
        yOffset: f.yoffset,
        xAdvance: f.xadvance
      };
    }
    let E = (data.kerningDict = {} as any);
    let E2 = t.match(this.KERNING_EXP) as any;
    if (E2) {
      for (let h = 0, g = E2.length; h < g; h++) {
        var m = this.parseStrToObj(E2[h]);
        E[(m.first << 16) | (65535 & m.second)] = m.amount;
      }
    }
    return data;
  }
}
