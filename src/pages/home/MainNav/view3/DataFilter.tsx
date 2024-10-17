import { observer } from "mobx-react-lite";
import styles from "./styles.less";
import MapState from "@/configs/filter/mapLayerState";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import FilterContainer from "@/configs/filter/filterContainer";
import MapLayerFilter from "@/configs/filter/maplayerfilter";

const DataFilter = observer((props: any) => {
  const mapLayerData = MapState.getInstance().getMapLayerData();
  const filter = props.filter;
  const opMapLayers = props.opMapLayers;
  const item = props.item;
  let metaId = item.metaId;
  if (!metaId) {
    let dataParams = item.dataParams;
    metaId = dataParams?.layerName;
  }

  // 点击全部
  const onClickAll = (event: any) => {
    const checked = event.target.checked;

    if (checked) {
      /*   for (const element of filter) {
                  let childs = element.childs;
                  for (const t of childs) {
                      const _title = `${metaId}_${t.label}`
                      opMapLayers(item, _title, 'delete')
                  }
              }
   */

      let metaId = item.metaId;
      if (!metaId) {
        let dataParams = item.dataParams;
        metaId = dataParams.layerName;
      }

      MapLayerFilter.getInstance().clearAll(metaId);
      MapState.getInstance().deleteMapLayer({
        title: ``,
        metaInfo: { id: metaId },
        item: item,
      });

      const _title = `${metaId}_${item.title}`;
      opMapLayers(item, _title, "add");
    } else {
      const _title = `${metaId}_${item.title}`;
      opMapLayers(item, _title, "delete");

      for (const element of filter) {
        let childs = element.childs;
        for (const t of childs) {
          const _title = `${metaId}_${t.label}`;
          opMapLayers(item, _title, "delete");
        }
      }
    }
    MapLayerFilter.getInstance().updateFilter();
    changeIsClickAll(checked);
  };

  const changeIsClickAll = (checked: boolean) => {
    MapLayerFilter.getInstance().isClickAll = checked;
  };

  return (
    <div className={styles.collapse_children}>
      <div className={`${styles.metas_li}`}>
        <Checkbox
          onChange={(e: CheckboxChangeEvent) => {
            onClickAll(e);
          }}
          checked={MapState.getInstance().getShowState(metaId, item.title)}
        >
          全部{item.total ? `(${item.total})` : ""}
        </Checkbox>
      </div>
      {filter.map((it: any, ind: number) => {
        const attr = it.attr || "";
        const childs = it.childs || [];

        return (
          <div key={`${attr}_${ind}`} className={`${styles.metas_li}`}>
            {childs.map((t: any, i: number) => {
              let show2 = mapLayerData.find(
                (it) => it == `${metaId}_${t.label}`
              );
              return (
                <div key={`${t.label}_${ind}`} className={styles.title_view}>
                  <Checkbox
                    onChange={(e: CheckboxChangeEvent) => {
                      const checked = e.target.checked;
                      const _title = `${metaId}_${t.label}`;
                      changeIsClickAll(false);
                      if (checked) {
                        opMapLayers(item, _title, "add", {
                          attr: attr,
                          child: t,
                        });
                      } else {
                        opMapLayers(item, _title, "delete", {
                          attr: attr,
                          child: t,
                        });
                      }
                    }}
                    checked={show2}
                  >
                    <div
                      className={styles.checkbox_label}
                      style={{ minWidth: 40 }}
                    >
                      {t.label}
                    </div>
                  </Checkbox>
                </div>
              );
            })}
          </div>
        );


      })}
    </div>
  );
});

export default DataFilter;
