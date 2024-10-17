// 类型选择组件
import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { datamg } from '@/common';
import axiosFn from '@/server/axios';

const { Option } = Select;

const Meta = (props: any) => {
  const [metaList, setMetaList] = useState<any>(null);
  const [groupId, setGroupId] = useState<any>(null);


  useEffect(() => {
    if (props.schema.gpid) {
      queryList({ gpid: props.schema.gpid });
      setGroupId(props.schema.gpid);
    }
  }, [props.schema?.gpid]);


  // 根据组id查询元信息列表
  const queryList = (obj: any) => {
    let params = { ...obj }
    let url = `${datamg}/metainfo/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      let resData = res.data.data;
      setMetaList(resData.items);
    })
  };

  const onChange = (value: any) => {
    props.onChange(value);
  };

  return (
    <Select
      style={{ width: '100%' }}
      onChange={onChange}
      defaultValue={props.value}
    >
      {metaList &&
        <>
          {
            metaList.map((item: any) => {
              let key = item.id;
              let value = item.id;
              let name = item.name;
              return (
                <Option value={value} key={key}>{name}</Option>
              )
            })
          }
        </>
      }
    </Select>
  )
};

export default Meta;