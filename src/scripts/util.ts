import CryptoJS from 'crypto-js';


let util = {
  //AES加密文本
  encryptAES(word: any, key: string) {
    const message = CryptoJS.enc.Utf8.parse(word);
    const secretPassphrase = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.enc.Utf8.parse(key);
    const encrypted = CryptoJS.AES.encrypt(message, secretPassphrase, {
      mode: CryptoJS.mode.ECB,
      paddding: CryptoJS.pad.Pkcs7,
      iv,
    }).toString();
    return encrypted;
  },

  //AES解密文本
  decryptAES(word: any, key: string) {
    const secretPassphrase = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.enc.Utf8.parse(key);
    const decrypted = CryptoJS.AES.decrypt(word, secretPassphrase, {
      mode: CryptoJS.mode.ECB,
      paddding: CryptoJS.pad.Pkcs7,
      iv,
    }).toString(CryptoJS.enc.Utf8);
    return decrypted;
  },
  //MD5加密
  encryptMD5(str: any) {
    const hash = CryptoJS.MD5(str);

    return hash.toString();
  },
  testAES() {
    const message = CryptoJS.enc.Utf8.parse('abc');
    const secretPassphrase = CryptoJS.enc.Utf8.parse('0123456789ABCDEF');
    const iv = CryptoJS.enc.Utf8.parse('0123456789ABCDEF');
    const encrypted = CryptoJS.AES.encrypt(message, secretPassphrase, {
      mode: CryptoJS.mode.CBC,
      paddding: CryptoJS.pad.Pkcs7,
      iv,
    }).toString();
    const decrypted = CryptoJS.AES.decrypt(encrypted, secretPassphrase, {
      mode: CryptoJS.mode.CBC,
      paddding: CryptoJS.pad.Pkcs7,
      iv,
    }).toString(CryptoJS.enc.Utf8);
  },

  // 输入防抖函数
  debounceOther(func: any, wait = 800) {
    let timeout: any; // 定时器变量
    return function (a?: any, b?: any, c?: any, d?: any) {
      clearTimeout(timeout); // 每次触发时先清除上一次的定时器,然后重新计时
      timeout = setTimeout(() => {
        func(a, b, c, d);
      }, wait); // 指定 xx ms 后触发真正想进行的操作 handler
    };
  },
};

export default util;
