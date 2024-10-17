// 类型选择组件
import React, { useState, useEffect } from 'react';
import { Input } from 'antd';


const MetaInput = (props: any) => {
  const onChange = (value: any) => {
    props.onChange(value);
    // props?.addons?.setValue(props.addons.dataPath, value);
  };
  return (
    <Input style={{ width: '100%' }} onChange={onChange} />
  )
};

export default MetaInput;