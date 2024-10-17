import { observer } from "mobx-react-lite";
import styles from "./styles.less";
import AttributeConfig from "@/configs/attributeConfig/attributeConfig";
import uiState from "@/mobx/ui";
import { Space } from "antd";
import { message } from "antd";
const FooterView = observer((props: any) => {
  const showRiverRelation = props.showRiverRelation;
  const clickQueryData = props.clickQueryData;
  const attribute = clickQueryData
    ? AttributeConfig.getInstance().getAttribute(clickQueryData)
    : null;
  const iframe = attribute?.iframe || [];

  const onRelation = () => {
    let properties = clickQueryData?.feature.properties;
    let name = properties.NAME || properties["河流名"];
    uiState.setShowRiverName(name);
  };

  const onClickIframe = (params: any) => {
    if (params.url && params.attr) {
      const { type, data, attr, url } = params;
      const { source, properties } = data;
      let _tt = properties[attr];
      let _url = `${url}${_tt}`;
      const attribute = AttributeConfig.getInstance().getAttributeById(source);
      let title = "";
      if (attribute) {
        title = attribute.title;
      }
      uiState.setRvInfo({ type, data, title, url: _url });
    } else {
      message.info("暂无数据");
    }
  };

  return (
    <div className={styles.footer_view}>

      <Space wrap>
        {iframe.map((item: any, index: any) => {
          let params: any = {
            type: "iframe",
            data: clickQueryData?.feature,
            url: item.url,
            attr: item.attr,
          };
          return (
            <div
              key={index}
              className={styles.btn_view}
              onClick={() => {
                onClickIframe(params);
              }}
            >
              {item.title}
            </div>
          );
        })}

        {/* 河流 */}
        {showRiverRelation && (
          <div className={styles.btn_view} onClick={() => onRelation()}>
            河流关系
          </div>
        )}

      </Space>



      {/* <div className={styles.btn_view}>
        收藏
      </div> */}
    </div>
  );
});
export default FooterView;
