//#rgba
const rgbaMatcher = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i;
//#rrggbbaa
const rrggbbaaMatcher =
  /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
//rgb(), rgba(), or rgb%()
const rgbParenthesesMatcher =
  /^rgba?\(\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)(?:\s*,\s*([0-9.]+))?\s*\)$/i;
//hsl() or hsla()
const hslParenthesesMatcher =
  /^hsla?\(\s*([0-9.]+)\s*,\s*([0-9.]+%)\s*,\s*([0-9.]+%)(?:\s*,\s*([0-9.]+))?\s*\)$/i;

export default class Color {
  red: number = 1.0;
  green: number = 1.0;
  blue: number = 1.0;
  alpha: number = 1.0;

  constructor(red?: number, green?: number, blue?: number, alpha?: number) {
    this.red = Color.defaultValue(red, this.red);
    this.green = Color.defaultValue(green, this.green);
    this.blue = Color.defaultValue(blue, this.blue);
    this.alpha = Color.defaultValue(alpha, this.alpha);
  }
  static defaultValue(a: any, b: any): any {
    if (a !== undefined && a !== null) {
      return a;
    }
    return b;
  }
  static defined(value: any) {
    return value !== undefined && value !== null;
  }
  static clone(color: Color): Color {
    return new Color(color.red, color.green, color.blue, color.alpha);
  }
  toCssColorString(): string {
    var red = Color.floatToByte(this.red);
    var green = Color.floatToByte(this.green);
    var blue = Color.floatToByte(this.blue);
    if (this.alpha === 1) {
      return 'rgb(' + red + ',' + green + ',' + blue + ')';
    }
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + this.alpha + ')';
  }
  toBytes(): [number, number, number, number] {
    var red = Color.floatToByte(this.red);
    var green = Color.floatToByte(this.green);
    var blue = Color.floatToByte(this.blue);
    var alpha = Color.floatToByte(this.alpha);
    return [red, green, blue, alpha];
  }
  static fromBytes(
    red?: number,
    green?: number,
    blue?: number,
    alpha?: number,
  ): Color {
    red = Color.byteToFloat(Color.defaultValue(red, 255.0));
    green = Color.byteToFloat(Color.defaultValue(green, 255.0));
    blue = Color.byteToFloat(Color.defaultValue(blue, 255.0));
    alpha = Color.byteToFloat(Color.defaultValue(alpha, 255.0));

    return new Color(red, green, blue, alpha);
  }
  static byteToFloat(num: number): number {
    return num / 255.0;
  }
  static floatToByte(num: number): number {
    return num === 1.0 ? 255.0 : (num * 256.0) | 0;
  }
  static hue2rgb(m1: number, m2: number, h: any): number {
    if (h < 0) {
      h += 1;
    }
    if (h > 1) {
      h -= 1;
    }
    if (h * 6 < 1) {
      return m1 + (m2 - m1) * 6 * h;
    }
    if (h * 2 < 1) {
      return m2;
    }
    if (h * 3 < 2) {
      return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    }
    return m1;
  }
  static fromAlpha(color: Color, alpha: number): Color {
    return new Color(color.red, color.green, color.blue, alpha);
  }
  withAlpha(alpha: number): Color {
    return Color.fromAlpha(this, alpha);
  }

  static fromHsl(
    hue: number,
    saturation: number,
    lightness: number,
    alpha: number,
    result: Color,
  ): Color {
    hue = Color.defaultValue(hue, 0.0) % 1.0;
    saturation = Color.defaultValue(saturation, 0.0);
    lightness = Color.defaultValue(lightness, 0.0);
    alpha = Color.defaultValue(alpha, 1.0);

    var red = lightness;
    var green = lightness;
    var blue = lightness;

    if (saturation !== 0) {
      var m2;
      if (lightness < 0.5) {
        m2 = lightness * (1 + saturation);
      } else {
        m2 = lightness + saturation - lightness * saturation;
      }

      var m1 = 2.0 * lightness - m2;
      red = Color.hue2rgb(m1, m2, hue + 1 / 3);
      green = Color.hue2rgb(m1, m2, hue);
      blue = Color.hue2rgb(m1, m2, hue - 1 / 3);
    }

    if (!Color.defined(result)) {
      return new Color(red, green, blue, alpha);
    }

    result.red = red;
    result.green = green;
    result.blue = blue;
    result.alpha = alpha;
    return result;
  }
  static fromCssColorString(color: string): Color | undefined {
    let result = new Color();
    //删除颜色字符串中的所有空白
    color = color.replace(/\s/g, '');

    var matches = rgbaMatcher.exec(color);
    if (matches !== null) {
      result.red = parseInt(matches[1], 16) / 15;
      result.green = parseInt(matches[2], 16) / 15.0;
      result.blue = parseInt(matches[3], 16) / 15.0;
      result.alpha = parseInt(Color.defaultValue(matches[4], 'f'), 16) / 15.0;
      return result;
    }

    matches = rrggbbaaMatcher.exec(color);
    if (matches !== null) {
      result.red = parseInt(matches[1], 16) / 255.0;
      result.green = parseInt(matches[2], 16) / 255.0;
      result.blue = parseInt(matches[3], 16) / 255.0;
      result.alpha = parseInt(Color.defaultValue(matches[4], 'ff'), 16) / 255.0;
      return result;
    }

    matches = rgbParenthesesMatcher.exec(color);
    if (matches !== null) {
      result.red =
        parseFloat(matches[1]) /
        ('%' === matches[1].substr(-1) ? 100.0 : 255.0);
      result.green =
        parseFloat(matches[2]) /
        ('%' === matches[2].substr(-1) ? 100.0 : 255.0);
      result.blue =
        parseFloat(matches[3]) /
        ('%' === matches[3].substr(-1) ? 100.0 : 255.0);
      result.alpha = parseFloat(Color.defaultValue(matches[4], '1.0'));
      return result;
    }

    matches = hslParenthesesMatcher.exec(color);
    if (matches !== null) {
      return Color.fromHsl(
        parseFloat(matches[1]) / 360.0,
        parseFloat(matches[2]) / 100.0,
        parseFloat(matches[3]) / 100.0,
        parseFloat(Color.defaultValue(matches[4], '1.0')),
        result,
      );
    }

    return undefined;
  }

  // rgb转16进制
  static rgbToColor(rgb: string): string {
    var aColor = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
    var strHex = '#';
    for (var i = 0; i < aColor.length; i++) {
      var hex = Math.round(Number(aColor[i])).toString(16);
      if (hex.length < 2) {
        hex = '0' + hex;
      }
      strHex += hex;
    }
    return strHex;
  }

  // 颜色 16进制转rgb
  static colorRGBA(data: string): Array<number> {
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    let sColor = data.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = '#';
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      // 处理六位的颜色值
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
      }
      return sColorChange;
    }
    return [];
  }
}
