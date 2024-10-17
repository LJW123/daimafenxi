import { observer } from 'mobx-react-lite';
import PageView from '@/components/pageModel';
import uiState from '@/mobx/ui';
import { toJS } from 'mobx';
import styles from './styles.less';
import { Descriptions } from 'antd';
import AttributeConfig from '@/configs/attributeConfig/attributeConfig';
const ContentView = observer(() => {
  const clickQueryData = uiState.clickQueryData
  const _clickQueryData = clickQueryData ? toJS(clickQueryData) : null

  if (!_clickQueryData) {
    return null
  }
  const attribute = AttributeConfig.getInstance().getAttribute(_clickQueryData)
  const feature = _clickQueryData.feature

  if (attribute) {
    if (attribute.chartViewId) {
      return (
        <div className={styles.data_view}>
          <PageView pageConfig={attribute} />
        </div>
      )
    } else {
      const properties = feature.properties
      const arr = attribute.getAttribute(properties)
      const items = arr.map((item: any, index: any) => {
        return {
          key: index,
          label: item.label,
          children: item.value,
          span: 3
        }
      })
      return (
        <div className={styles.data_view}>
          <Descriptions
            title={false}
            bordered
            items={items}
            size='small'
          />
        </div>
      )
    }
  } else {

    const properties = feature.properties
    const objKeys = Object.keys(properties)
    const items = objKeys.map((item: any, index: any) => {
      return {
        key: index,
        label: item,
        children: properties[item],
        span: 3
      }
    })

    return (
      <div className={styles.data_view}>
        <Descriptions
          title={false}
          bordered
          items={items}
          size='small'
        />
      </div>
    )
  }
})

export default ContentView;
