import { observer } from "mobx-react-lite";
import styles from "./styles.less";
import MapState from "@/configs/filter/mapLayerState";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import MapLayerFilter from "@/configs/filter/maplayerfilter";
import uiState from "@/mobx/ui";
import { IMAGE_PATH } from "@/config";
import { useState } from "react";

const DataFilter = observer((props: any) => {
  const mapLayerData = MapState.getInstance().getMapLayerData();
  const filter = props.filter;
  const opMapLayers = props.opMapLayers;
  const [checkedList, setCheckedList] = useState<any[]>([]);

  const checkAll = filter.length === checkedList.length;
  const indeterminate =
    checkedList.length > 0 && checkedList.length < filter.length;

  // 点击全部
  const onClickAll = (event: any) => {
    const checked = event.target.checked;

    // MapLayerFilter.getInstance().clearAll(metaId);
    MapLayerFilter.getInstance().updateFilter();
    changeIsClickAll(checked);
  };

  const changeIsClickAll = (checked: boolean) => {
    MapLayerFilter.getInstance().isClickAll = checked;
  };
  const onCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    if (checked) {
      filter.forEach((item: any) => {
        const _title = `${item.metaId}_${item.title}`;
        if (item.metaId) {
          opMapLayers(item, _title, "add");
        }
      });
      setCheckedList(filter);
    } else {
      filter.forEach((item: any) => {
        const _title = `${item.metaId}_${item.title}`;
        if (item.metaId) {
          opMapLayers(item, _title, "delete");
        }
      });
      setCheckedList([]);
    }
  };
  const onChange = (e: any, item: any) => {
    const checked = e.target.checked;
    const _title = `${item.metaId}_${item.title}`;
    const newList = checkedList.filter((it) => it.metaId !== item.metaId);

    if (checked) {
      opMapLayers(item, _title, "add");
      // uiState.setLeftClickEnterItem(item)
      newList.push(item);
    } else {
      opMapLayers(item, _title, "delete");
      // uiState.setLeftClickEnterItem(null)
    }
    setCheckedList(newList);
  };
  const isActive = (item: any) => {
    let title = item.title;
    let leftClickEnterItem = uiState.leftClickEnterItem;

    return title == leftClickEnterItem?.title;
  };
  return (
    <div className={styles.collapse_children}>
      <div className={`${styles.metas_li}`}>
        <Checkbox
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={checkAll}
        >
          全部
        </Checkbox>
      </div>
      <div className={`${styles.metas_li}`}>
        {filter.map((item: any, ind: number) => {
          let show2 = mapLayerData.find(
            (ml) => ml == `${item.metaId}_${item.title}`
          );
          if (item.title == "") {
            // 如果title为空，则是占位符，换行
            return (
              <div style={{ width: "100%" }} key={`null_view`}></div>
            )
          } else {

            return (
              <div key={`${item.title}_${ind}`} className={styles.title_view}>
                <Checkbox
                  onChange={(e: any) => onChange(e, item)}
                  checked={show2}
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
            );
          }

        })}
      </div>
    </div>
  );
});

export default DataFilter;
