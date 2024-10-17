import { observer } from 'mobx-react-lite';
import uiState from '@/mobx/ui';
import { toJS } from 'mobx';
import styles from './styles.less';

import ContentView from './content';
import AttributeConfig from '@/configs/attributeConfig/attributeConfig';
import HeadView from './headView';

let _x = 0
let _y = 0
const QueryDataViewChild = observer((props: any) => {
    const clickQueryData = uiState.clickQueryData
    const _clickQueryData = clickQueryData ? toJS(clickQueryData) : null

    let width = 300
    let height = 200

    let arrow_position;
    let showRiverRelation = false

    if (_clickQueryData) {

        const attribute = AttributeConfig.getInstance().getAttribute(_clickQueryData)

        if (!attribute) {
            // 没在属性中配置，不显示
            return null
        }

        let title = ''
        if (attribute) {
            title = attribute.title
            // 判断title是否包含 河流
            showRiverRelation = title.includes("河流")
        }


        const a_style = attribute ? { ...attribute.style } : {}
        width = a_style.width || 300
        height = a_style.height || 600

        const eve = _clickQueryData.eve
        const point = eve.point
        const x = point.x
        const y = point.y
        _x = x
        _y = y
        if (y < height + 64 + 50) {
            // 框在左右
            _y = y - height / 2
            if (x < width + 300) {
                // 框在右
                arrow_position = "right"
                _x = x
            } else {
                // 框在左
                _x = x - width
                arrow_position = "left"
            }
        } else {
            // 框在上方
            _y = y - height
            _x = x - width / 2
            arrow_position = "bottom"
        }
    }


    const style: any = {
        zIndex: 200,
        width: width,
        height: height,
        left: _x || 0,
        top: _y || 0,
    }

    if (_x === 0 && _y === 0) {
        // 默认不显示弹框
        style.display = "none"
        // style.width = 0;
        // style.height = 0;
    } else if (!_clickQueryData) {
        // 关闭弹框
        style.animation = "zoom_out 0.3s forwards"
    } else {
        // 打开弹框
        style.animation = "zoom_in 0.3s forwards"
        style.display = "inline-block"
    }

    let arrow_border_style: any = {
        left: 0,
        top: 0,
    }

    let arrow_style: any = {
        left: 0,
        top: 0,
    }

    // 箭头位置
    if (arrow_position == 'bottom') {
        arrow_border_style = {
            ...arrow_border_style,
            left: (width / 2) - 8,
            top: height - 8,
            borderTopColor: "#4AF4F4"
        }

        arrow_style = {
            ...arrow_style,
            left: -9,
            top: -11,
            borderTopColor: "rgba(5, 59, 188, 0.8)"
        }

    } else if (arrow_position == 'left') {
        arrow_border_style = {
            ...arrow_border_style,
            left: width - 11,
            top: (height / 2) - 8,
            borderLeftColor: "#4AF4F4"
        }

        arrow_style = {
            ...arrow_style,
            left: -11,
            top: -9,
            borderLeftColor: "rgba(5, 59, 188, 0.8)"
        }

    } else if (arrow_position == 'right') {
        arrow_border_style = {
            ...arrow_border_style,
            left: -8,
            top: (height / 2) - 8,
            borderRightColor: "#4AF4F4"
        }

        arrow_style = {
            ...arrow_style,
            left: -7,
            top: -9,
            borderRightColor: "rgba(5, 59, 188, 0.8)"
        }

    }


    return (
        <div
            className={styles.query_data_view}
            style={{
                ...style
            }}
        >

            <div className={styles.arrow_border} style={{ ...arrow_border_style }}>
                <div className={styles.arrow} style={{ ...arrow_style }}></div>
            </div>
            <div className={styles.content_view}>
                <HeadView clickQueryData={_clickQueryData} showRiverRelation={showRiverRelation} />
                <ContentView />
            </div>

        </div>
    )

})

export default QueryDataViewChild;
