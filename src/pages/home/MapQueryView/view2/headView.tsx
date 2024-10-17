import { observer } from 'mobx-react-lite';

import styles from './styles.less';
import CustomIcon from '@/components/CustomIcon';
import { getQMap } from '@/plugin/qSpace/core';
import AttributeConfig from '@/configs/attributeConfig/attributeConfig';
import uiState from '@/mobx/ui';


const HeadView = observer((props: any) => {
  const clickQueryData = uiState.clickQueryData
  const attribute = clickQueryData ? AttributeConfig.getInstance().getAttribute(clickQueryData) : null
  const feature = clickQueryData?.feature
  const properties = feature?.properties
  const title = attribute?.attrName ? properties[attribute?.attrName] : ""

  const onClose = () => {
    getQMap()?.Evented.fire('mapQueryData', { data: null });
  }

  return (
    <div className={styles.head_view}>
      <div className={styles.title} title={title}>{title}</div>
      <CustomIcon type='icon-guanbi2' className={styles.close_btn} onClick={onClose} />
    </div>
  );
})

export default HeadView;
