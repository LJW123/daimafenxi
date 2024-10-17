// 输出参数

import { Radio } from "antd"

const OutputParamsReadOnly = (props: any) => {

  const onChange = (e: any) => {
    let value = e.target.value;
    props.onChange(value);
    // props?.addons?.setValue(props.addons.dataPath, e.target.value);
  };

  return (
    <Radio.Group
      onChange={onChange}
      value={props?.value || 11}
    >
      <Radio value={11}>目录</Radio>
      <Radio value={12}>文件</Radio>
    </Radio.Group>
  )
}
export default OutputParamsReadOnly