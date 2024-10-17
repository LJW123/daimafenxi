import { observer } from "mobx-react-lite";
import { IMAGE_PATH } from "@/config";
import styles from './styles.less';
import LeftMenu from "@/mobx/leftmenu";
 

const BottomView = observer(() => {

  const leftClickItem = LeftMenu.getInstance().leftClickItem;
 // const mapLayerData = uiState.mapLayerData;
  let legendImg = `${IMAGE_PATH}/${leftClickItem?.legend || 'legend1.png'}`
  let monthLine = `${IMAGE_PATH}/month_line.png`
  let monthList = [7, 8, 9, 10, 11];


  if(!leftClickItem) return null

  return (
    <div className={styles.bottem_view}>
      {leftClickItem&&<div className={styles.legedImg_view}>
        <img src={legendImg} alt="" />
      </div>}
      <div className={styles.month_list_view}>
        <div className={styles.month_list}>
          {monthList.map((item: any, index: any) => {
            let bgImage = `${IMAGE_PATH}/month.png`
            return (
              <div
                key={index}
                className={styles.month_view}
                style={{
                  backgroundImage: `url(${bgImage})`,
                }}
              >
                {item}
              </div>
            )
          })
          }
        </div>
        <img src={monthLine} alt="" />
      </div>
    </div>
  )
})
export default BottomView