import { Canvg } from 'canvg';

//小数点后保留几位
export function decimal(num: any, n = 2) {
  return Math.round(Number(num) * Math.pow(10, n)) / Math.pow(10, n);
}

//经纬度转换为时分秒
export function conversionToDufenmiao(data: any, shi?: any) {
  let value: any = '';
  try {
    if (data) {
      if (shi) {
        value = decimal(data, 2);
      } else {
        let hourArr = data.toString().split('.');
        let hour = Number(hourArr[0]);
        let minu: any = hourArr[1] || 0;
        let minuVal = Math.pow(10, minu?.length || 1);
        let minut = Number(minu) / minuVal;
        let minutVal = minut * 60;
        let minuteArr = minutVal.toString().split('.');
        let minute = Number(minuteArr[0]);
        let sec: any = minuteArr[1] || 0;
        let secVal = Math.pow(10, sec?.length || 1);
        let seco: number = Number(sec) / secVal;
        let second = seco * 60;
        second = decimal(second, 2);
        value = hour + '° ' + minute + '′ ' + second + '″';
      }
    }
  } finally {
  }

  return value;
}

//度分秒转经纬度
export function conversionTolonlat(val: any, len: any = 6) {
  let d = val.indexOf('°');
  let f = val.indexOf('′');
  let m = val.indexOf('″');

  let du: any = 0;
  let fen: any = 0;
  let miao: any = 0;
  if (d > -1) {
    du = val.substring(0, d);
  }
  if (f > -1) {
    if (d > -1) {
      fen = val.substring(d + 1, f);
    } else {
      fen = val.substring(0, f);
    }
  }
  if (m > -1) {
    if (f > -1) {
      miao = val.substring(f + 1, m);
    } else {
      if (d > -1) {
        miao = val.substring(d + 1, m);
      } else {
        miao = val.substring(0, f);
      }
    }
  }
  return conversionTolonlat2(du, fen, miao, len);
}

//度分秒转经纬度
export function conversionTolonlat2(
  strDu: any,
  strFen: any,
  strMiao: any,
  len: any = 6,
) {
  let _len = len > 6 || typeof len == 'undefined' ? 6 : len; //精确到小数点后最多六位
  let _strDu =
    typeof strDu == 'undefined' || strDu == '' ? 0 : parseFloat(strDu);
  let _strFen =
    typeof strFen == 'undefined' || strFen == '' ? 0 : parseFloat(strFen) / 60;
  let _strMiao =
    typeof strMiao == 'undefined' || strMiao == ''
      ? 0
      : parseFloat(strMiao) / 3600;
  let digital = _strDu + _strFen + _strMiao;
  if (digital == 0) {
    return '';
  } else {
    return digital.toFixed(_len);
  }
}

//获取宽高
export function getRootStyle() {
  let doc: any = document.getElementById('root');
  let sty = getComputedStyle(doc, null);
  return sty;
}

// svg转
export function crateImageData_svg(xml: any) {
  let canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  try {
    if (ctx) {
      let p = new DOMParser();
      let doc = p.parseFromString(xml, 'text/xml');
      let innerHtml = doc.getElementsByTagName('svg')[0].innerHTML;
      let arr = innerHtml.split('stroke="#');
      let s = `${arr[0]}`;
      for (let i = 1; i < arr.length; i++) {
        let a = arr[i].slice(8);
        s = `${s}stroke="#FFFFFF" ${a}`;
      }
      doc.getElementsByTagName('svg')[0].innerHTML = s;
      let text = new XMLSerializer().serializeToString(doc);
      let v = Canvg.fromString(ctx, text);
      v.render();
      return canvas;
    }
    return null;
  } catch (err) {
    return null;
  }
}
export function Uint8ArrayToString(fileData: any) {
  var dataString = '';
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  return dataString;
}

export function crateImageData(xml: any, size: number = 32) {
  var canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  try {
    if (ctx) {
      let v = Canvg.fromString(ctx, xml);
      v.render({
        scaleWidth: size,
        scaleHeight: size,
      });
      return canvas;
    }
    return null;
  } catch (err) {
    return null;
  }
}
