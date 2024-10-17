import { observer } from "mobx-react-lite";
import styles from "./styles.less";
import { IMAGE_PATH } from "@/config";
import uiState from "@/mobx/ui";
import Data from "@/configs/pageConfig/data";
import MapState from "@/configs/filter/mapLayerState";

import DataFilter from "./DataFilter";
import { Collapse } from "antd";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { CaretRightOutlined } from "@ant-design/icons";

import MetaInfoFilter from "./MetaInfoFilter";
import LeftMenu from "@/mobx/leftmenu";

const DataView = observer((props: any) => {
  const opMapLayers = props.opMapLayers;
  const isActive = (item: any) => {
    let title = item.title;
    let leftClickEnterItem = uiState.leftClickEnterItem;

    return title == leftClickEnterItem?.title;
  };

  const mapLayerData = MapState.getInstance().getMapLayerData();
  const leftMouseEnterItem = LeftMenu.getInstance().leftClickItem;

  const childs = leftMouseEnterItem?.childs || [];

  const top = (leftMouseEnterItem?.index || 0) * 80 + 50;

  if (childs.length == 0) return null;

  return (
    <div
      className={styles.item_up}
      style={{ top: top }}
      onMouseEnter={() => LeftMenu.getInstance().setPanelView(true)}
      onMouseLeave={() => LeftMenu.getInstance().setPanelView(false)}
    >
      {/* <img className={styles.arrow_left} src={`${IMAGE_PATH}/left/arrow_left.png`} alt="" /> */}

      <div className={styles.arrow_left}></div>
      <div className={styles.meta_list}>
        {childs.map((item: Data, index: number) => {
          const filter = item.filter;
          const children = item.childs;
          const show = mapLayerData.find(
            (it) => it == `${item.metaId}_${item.title}`
          );
          return (
            <div key={`${index}_${item.title}`}>
              {filter.length > 0 && (
                <div className={styles.collapse_view}>
                  <Collapse
                    bordered={false}
                    collapsible="icon"
                    expandIcon={({ isActive }: any) => (
                      <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                    defaultActiveKey={["collapse"]}
                    items={[
                      {
                        key: `collapse`,
                        label: (
                          <div
                            className={`${styles.collapse_title_view}`}
                            onClick={() => {
                              let leftClickEnterItem =
                                uiState.leftClickEnterItem;
                              if (item.title == leftClickEnterItem?.title) {
                                uiState.setLeftClickEnterItem(null);
                                uiState.setRightPageShow(false);
                              } else {
                                uiState.setLeftClickEnterItem(item);
                                uiState.setRightPageShow(true);
                              }
                            }}
                          >
                            {item.icon && (
                              <img
                                src={`${IMAGE_PATH}/leftData/${item.icon}`}
                                alt=""
                                className={styles.icon}
                              />
                            )}
                            <span
                              className={styles.checkbox_label}
                              style={{
                                padding: "0 4px",
                                color: `${isActive(item) ? "#03FFFF" : ""}`,
                                fontSize: 16,
                              }}
                            >
                              {item.title}
                            </span>
                          </div>
                        ),
                        children: (
                          <DataFilter
                            filter={filter}
                            item={item}
                            opMapLayers={opMapLayers}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              )}

              {children.length > 0 && (
                <div className={styles.collapse_view}>
                  <Collapse
                    bordered={false}
                    collapsible="icon"
                    expandIcon={({ isActive }: any) => (
                      <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                    defaultActiveKey={["collapse"]}
                    items={[
                      {
                        key: `collapse`,
                        label: (
                          <div
                            className={`${styles.collapse_title_view}`}
                            onClick={() => {
                              let leftClickEnterItem =
                                uiState.leftClickEnterItem;
                              if (item.title == leftClickEnterItem?.title) {
                                uiState.setLeftClickEnterItem(null);
                                uiState.setRightPageShow(false);
                              } else {
                                uiState.setLeftClickEnterItem(item);
                                uiState.setRightPageShow(true);
                              }
                            }}
                          >
                            {item.icon && (
                              <img
                                src={`${IMAGE_PATH}/leftData/${item.icon}`}
                                alt=""
                                className={styles.icon}
                              />
                            )}
                            <span
                              className={styles.checkbox_label}
                              style={{
                                padding: "0 4px",
                                color: `${isActive(item) ? "#03FFFF" : ""}`,
                                fontSize: 16,
                              }}
                            >
                              {item.title}
                            </span>
                          </div>
                        ),
                        children: (
                          <MetaInfoFilter
                            parent={item}
                            filter={children}
                            opMapLayers={opMapLayers}
                          />
                        ),
                      },
                    ]}
                  />
                </div>
              )}

              {filter.length == 0 && children.length === 0 && (
                <div
                  className={`${styles.metas_li} ${show ? styles.metas_li_sel : ""
                    }`}
                >
                  <Checkbox
                    onChange={(e: CheckboxChangeEvent) => {
                      const checked = e.target.checked;
                      const _title = `${item.metaId}_${item.title}`;
                      if (checked) {
                        opMapLayers(item, _title, "add");
                        // uiState.setLeftClickEnterItem(item)
                      } else {
                        opMapLayers(item, _title, "delete");
                        // uiState.setLeftClickEnterItem(null)
                      }
                    }}
                    checked={show}
                  ></Checkbox>

                  <div
                    className={styles.title_view}
                    onClick={() => {
                      let leftClickEnterItem = uiState.leftClickEnterItem;
                      if (leftClickEnterItem?.title == item.title) {
                        uiState.setLeftClickEnterItem(null);
                      } else {
                        uiState.setLeftClickEnterItem(item);
                      }
                    }}
                  >
                    {item.icon && (
                      <img
                        src={`${IMAGE_PATH}/leftData/${item.icon}`}
                        alt=""
                        className={styles.icon}
                      />
                    )}
                    <span
                      className={styles.checkbox_label}
                      style={{
                        padding: "0 4px",
                        color: `${isActive(item) ? "#03FFFF" : ""}`,
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DataView;
