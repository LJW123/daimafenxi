// 类型选择组件
import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import axiosFn from '@/server/axios';
import { datamg } from '@/common';

const { Option } = Select;

const Type = (props: any) => {
  const [attribute, setAttribute] = useState<any>(null);
  useEffect(() => {
    if (props.schema.metainfoId) {
      // 获取类型的元信息id
      let metainfoId = props.schema.metainfoId;
      queryMetaAttribute(metainfoId);
    }
  }, [props.schema?.metainfoId]);

  // 根据元信息id查询属性
  const queryMetaAttribute = (metainfoId: any) => {
    let params = {
      metaId: metainfoId
    };

    let url = `${datamg}/attribute/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      let resData = res.data.data;
      setAttribute(resData.items);
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
      {attribute &&
        <>
          {attribute.map((item: any) => {
            let key = item.data.key;
            let value = item.data.value;
            return (
              <Option value={value} key={key}>{value}</Option>
            )
          })}
        </>
      }
    </Select>
  )
};

export default Type;