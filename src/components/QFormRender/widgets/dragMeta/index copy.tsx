import { List, message } from "antd";

import styles from './styles.less'
import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import DataTree from "@/pages/components/treeView/dataTree";
import DragModal from "@/pages/components/dragModal";
import uGroup from "@/server/userGroup";

// 单个元信息
const DragMeta = (props: any) => {
  const groupId = uGroup.getGroup();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [num, setNum] = useState<any>(0);
  const value = props.value;
  const _onChange = props.onChange;

  const onChange = (_value: any) => {
    if(_onChange)_onChange(_value);
    let _num = num + 1;
    setNum(_num)
  };

  const onDelete = (item: any) => {
    let _value = value.filter((it: any) => it.id !== item.id);
    onChange(_value);
  };

  const onSelectData = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const _queryRootParams = {
    pos: {
      id: groupId,
      type: {
        otid: 2,
      },
    },
  };

  // 选择树节点
  const onSelectNode = (node: any) => {
    let meta = node?.obj?.obj || null
    if (meta) {
      onChange(meta);
    } else {
      message.info('该节点暂无元信息')
    }
  };

  return (
    <div className={styles.meta_index}>
      <div>
        {props?.title || ""}
      </div>
      <div className={styles.meta_box}>
        <div
          className={styles.meta_drag}
          onClick={onSelectData}
        >
          选择数据
        </div>
      </div>

      {value &&
        <div className={styles.meta_list}>
          <div className={styles.name}>{value.name}</div>
          <div className={styles.del} onClick={onDelete}>
            <CloseOutlined />
          </div>
        </div>
      }

      <DragModal
        title="选择数据"
        width={700}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        mask={false}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          <DataTree
            queryRootParams={_queryRootParams}
            onDragStart={null}
            onSelect={onSelectNode}
          />
        </div>
      </DragModal>
    </div>
  );
};

export default DragMeta