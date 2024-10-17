
const env = process.env.NODE_ENV === 'production';

export const systemName = 'xjyztv2'
//河大
export const PUBLIC_PATH = env ? `/${systemName}/` : '/';

export const CONFIG_PATH = "hhhfgc";
// export const CONFIG_PATH = "tst";
// export const CONFIG_PATH = "xinjiang";


// =====分割线======================

export const IMAGE_PATH = `${PUBLIC_PATH}images`;
export const G2_PATH = `${PUBLIC_PATH}G2`;

// 单点还是本地
export const sso = true

//图层控制显示隐藏的图标大小
export const iconsize = 0.275