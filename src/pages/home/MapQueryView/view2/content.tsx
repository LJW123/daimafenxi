import { observer } from 'mobx-react-lite';
import PageView from '@/components/pageModel';
import uiState from '@/mobx/ui';
 
import styles from './styles.less';
import AttributeConfig from '@/configs/attributeConfig/attributeConfig';
import { Flex } from 'antd';
const ContentView = observer(() => {
  const clickQueryData = uiState.clickQueryData
  const _clickQueryData = clickQueryData;// ? toJS(clickQueryData) : null;


  function handleValueDisplay(value: any): string {
    return value == undefined || value == null || value === "" ? '暂无数据' : value;
  }
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

      return (
        <div className={styles.data_view}>
          <Flex wrap>
            {arr.map((item: any, index: any) => {
              return (
                <div key={index} className={styles.data_item}>
                  <div className={styles.item_label}>{`${item.label}:`}</div>
                  <div className={styles.item_value}>{handleValueDisplay(item.value)}</div>
                </div>
              )
            })}
          </Flex>
        </div>
      )

      // return (
      //   <div className={styles.data_view}>
      //     {arr.map((item: any, index: any) => {            
      //       return (
      //         <div key={index} className={styles.data_item}>
      //           <div className={styles.item_label}>{`${item.label}:`}</div>
      //           <div className={styles.item_value}>{handleValueDisplay(item.value)}</div>
      //         </div>
      //       )
      //     })}
      //   </div>
      // )
    }
  } else {
    const properties = feature.properties
    const objKeys = Object.keys(properties)
    return (
      <div className={styles.data_view}>
        <Flex wrap>
          {objKeys.map((item: any, index: any) => {
            return (
              <div key={index} className={styles.data_item}>
                <div className={styles.item_label}>{`${item}:`}</div>
                <div className={styles.item_value}>{properties[item]}</div>
              </div>
            )
          })}
        </Flex>
      </div>
    )
  }
})

export default ContentView;
