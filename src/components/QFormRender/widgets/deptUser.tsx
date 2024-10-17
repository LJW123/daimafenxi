// 部门用户
import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import axiosFn from '@/server/axios';
import { coreUrl } from '@/common';

const { Option } = Select;

const DeptUser = (props: any) => {
  const [multiple, setMultiple] = useState<any>([]);
  useEffect(() => {
    if (props.schema?.deptId) {
      queryUser(props.schema?.deptId);
    }
  }, [props.schema?.deptId]);


  // 根据部门id查询用户
  const queryUser = (deptId: any) => {
    let params = {
      dept: {
        id: deptId
      },
    };
    let url = `${coreUrl}/permission/departmentUser/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      let resData = res.data.data;
      setMultiple(resData.items);
    })
  };

  const onChange = (value: any) => {
    props.onChange(value)
  };

  return (
    <Select
      mode="multiple"
      allowClear
      style={{ width: '100%' }}
      defaultValue={props.value}
      onChange={onChange}
      labelInValue={true}
    >
      {multiple.map((item: any) => {
        return (
          <Option key={item.id} value={item.id}>{item.name}</Option>
        )
      })}
    </Select>
  )
};

export default DeptUser;