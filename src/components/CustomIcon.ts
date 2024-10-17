import { createFromIconfontCN } from '@ant-design/icons';
import { PUBLIC_PATH } from '@/config';
const CustomIcon = createFromIconfontCN({
  scriptUrl: `${PUBLIC_PATH}iconfont.js`, // 在 iconfont.cn 上生成
});

export default CustomIcon;
