import { observer } from 'mobx-react-lite';

import uiState from '@/mobx/ui';
import PageView from '@/components/pageModel';
import styles from './styles.less';
import Chart from '@/configs/pageConfig/chart';
import Schema from '@/configs/pageConfig/schema';

const RightView = observer((props: any) => {
  const rightPageShow = uiState.rightPageShow
  const pageConfig = Schema.getInstance()
  const pageStyle = pageConfig.pageStyle
  const rightPage = pageStyle.rightPage
  const bgImage = rightPage.bgImage
  const style = { ...rightPage.style }

  if (rightPageShow && uiState.leftClickEnterItem) {
    style.right = rightPage.style.right || 0
  } else {
    let w = rightPage.style.width || 0
    style.right = - w - 20
  }

  const leftClickEnterItem = uiState.leftClickEnterItem

  const _pages = leftClickEnterItem?.charts


  return (
    <div
      className={styles.right_view}
      style={{
        ...style,
      }}
    >
      <div className={styles.spin_content}>
        {
          _pages && _pages.map((item: Chart, index: number) => {
            return (
              <PageView chartView={item} key={index} />
            )
          })
        }
      </div>
    </div>
  )
})
export default RightView;
