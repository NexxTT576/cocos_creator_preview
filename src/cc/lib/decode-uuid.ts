var BASE64_KEYS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var BASE64_VALUES = new Array(123); // max char code in base64Keys
for (let i = 0; i < 123; ++i) BASE64_VALUES[i] = 64; // fill with placeholder('=') index
for (let i = 0; i < 64; ++i) BASE64_VALUES[BASE64_KEYS.charCodeAt(i)] = i;
var HexChars = "0123456789abcdef".split("");

var _t = ["", "", "", ""];
var UuidTemplate = _t.concat(_t, "-", _t, "-", _t, "-", _t, "-", _t, _t, _t);
var Indices = UuidTemplate.map(function(x, i) {
  return x === "-" ? NaN : i;
}).filter(isFinite);

export var decodeuuid = (base64: string) => {
  if (base64.length !== 22) {
    return base64;
  }
  UuidTemplate[0] = base64[0];
  UuidTemplate[1] = base64[1];
  for (var i = 2, j = 2; i < 22; i += 2) {
    var lhs = BASE64_VALUES[base64.charCodeAt(i)];
    var rhs = BASE64_VALUES[base64.charCodeAt(i + 1)];
    UuidTemplate[Indices[j++]] = HexChars[lhs >> 2];
    UuidTemplate[Indices[j++]] = HexChars[((lhs & 3) << 2) | (rhs >> 4)];
    UuidTemplate[Indices[j++]] = HexChars[rhs & 0xf];
  }
  return UuidTemplate.join("");
};

export var encodeuuid = (uuid: string) => {
  if (!uuid) return "";
  let uarr = uuid.split("-");
  if (
    uuid.length != 36 ||
    uarr.length != 5 ||
    uarr[0].length != 8 ||
    uarr[1].length != 4 ||
    uarr[2].length != 4 ||
    uarr[3].length != 4 ||
    uarr[4].length != 12
  )
    return uuid;
  let str = uarr.join("");
  let base64 = new Array(22);
  base64[0] = str[0];
  base64[1] = str[1];
  for (let i = 2, j = 2; i < 22; i += 2) {
    let v1 = HexChars.indexOf(str[j++]);
    let v2 = HexChars.indexOf(str[j++]);
    let v3 = HexChars.indexOf(str[j++]);
    let lhs = (v1 << 2) | (v2 >> 2);
    let rhs = ((v2 & 3) << 4) | v3;
    base64[i] = String.fromCharCode(BASE64_VALUES.indexOf(lhs));
    base64[i + 1] = String.fromCharCode(BASE64_VALUES.indexOf(rhs));
  }

  return base64.join("");
};
// js 的encode 拿到的字符串好像不一样
export var encodeuuid2 = (uuid: string) => {
  if (!uuid) return "";
  let uarr = uuid.split("-");
  if (
    uuid.length != 36 ||
    uarr.length != 5 ||
    uarr[0].length != 8 ||
    uarr[1].length != 4 ||
    uarr[2].length != 4 ||
    uarr[3].length != 4 ||
    uarr[4].length != 12
  )
    return uuid;
  let str = uarr.join("");
  let base64 = new Array(23);
  base64[0] = str[0];
  base64[1] = str[1];
  base64[2] = str[2];
  base64[3] = str[3];
  base64[4] = str[4];
  for (let i = 5, j = 5; i < 23; i += 2) {
    let v1 = HexChars.indexOf(str[j++]);
    let v2 = HexChars.indexOf(str[j++]);
    let v3 = HexChars.indexOf(str[j++]);
    let lhs = (v1 << 2) | (v2 >> 2);
    let rhs = ((v2 & 3) << 4) | v3;
    base64[i] = String.fromCharCode(BASE64_VALUES.indexOf(lhs));
    base64[i + 1] = String.fromCharCode(BASE64_VALUES.indexOf(rhs));
  }
  return base64.join("");
};
