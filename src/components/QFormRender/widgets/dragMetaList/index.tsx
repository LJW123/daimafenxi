import { List, message } from "antd";
import styles from './styles.less'
import { useEffect, useState } from "react";
import { datamg } from "@/common";
import axiosFn from "@/server/axios";
import { Select } from "antd";

const { Option } = Select;
// 多个元信息
const DragMetaList = (props: any) => {
  const value = props.value;
  const onChange = props.onChange;
  const schema = props.schema;
  const classId = schema.classId;

  const [options, setOptions] = useState<any>([])

  useEffect(() => {
    if (classId) {
      queryMetaInfoByClassId(classId)
    }
  }, [classId])

  const queryMetaInfoByClassId = (classId: string) => {
    let url = `${datamg}/metainfo/query`;
    let parmas = {
      classIds: [classId]
    }
    axiosFn.commonPost(url, parmas).then((res: any) => {
      if (res.data.status == 200) {

        let items = res.data.data.items;
        setOptions(items)
      }
    })
  };


  return (
     <Select
      value={value}
      onChange={onChange}
      mode="multiple"
    >
      {options.map((item: any) => {
        return <Option key={item.id} value={item.id}>{item.name}</Option>
      })
      }
    </Select>
  );
};

export default DragMetaList