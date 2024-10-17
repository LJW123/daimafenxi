import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Checkbox, List } from 'antd';
import { BusinessScene, getQMap, } from '@/plugin/qSpace/core';
import styles from './styles.less';

const Components = (props: any) => {
  let setUpdate = props.setUpdate;
  let scene = props.scene;
  let layers = scene?.layers || [];
  let showList = scene?.getShowList() || [];

  let sourcesList = [];
  for (const key in scene.sources) {
    let item = scene.sources[key];
    sourcesList.push(item)
  }


  const onChangeCheckbox = (e: any, item: any) => {
    let checked = e.target.checked;

    let sleLayers = layers.filter((it: any) => it.source === item.sid)

    for (let index = 0; index < sleLayers.length; index++) {
      let _layer = sleLayers[index];
      scene?.changeLayerShow(_layer.id, checked);
    }
    setUpdate()
  };


  return (
    <List
      className={styles.data_list}
      dataSource={sourcesList}
      renderItem={(item: any, index: number) => {
        let checked = showList.find((it: any) => it.source === item.sid);

        return (
          <List.Item className={styles.list_li}>
            <div className={styles.check}>
              <Checkbox
                checked={checked}
                onChange={(e: any) => {
                  onChangeCheckbox(e, item);
                }}
              />
            </div>
            <div className={`${styles.name} dot`} title={item.sid}>
              {item.sName}
            </div>
          </List.Item>
        );
      }}
    />
  );
};


const LayersView = observer((props: any) => {

  const [updateNum, setUpdateNum] = useState<number>(0);

  const baseScene = getQMap()?.getBaseScene();
  const businessScenes = getQMap()?.getBusinessScene() || [];



  return (
    <div className={styles.layers_view}>
      <Components scene={baseScene} setUpdate={() => setUpdateNum(new Date().getTime())} />
      {businessScenes.map((item: BusinessScene, index: number) => {
        return (
          <div key={index}>
            <Components scene={item} setUpdate={() => setUpdateNum(new Date().getTime())} />
          </div>
        );
      })}
    </div>
  );
})

export default LayersView;
