// 输出参数

import { Radio } from "antd"

const OutputParams = (props: any) => {

  const onChange = (e: any) => {
    let value = e.target.value;
    props.onChange(value);
    // props?.addons?.setValue(props.addons.dataPath, e.target.value);
  };

  let _value;
  if (props?.value) {
    _value = parseInt(props?.value)
  }

  return (
    <Radio.Group
      onChange={onChange}
      value={_value}
    >
      <Radio value={11}>目录</Radio>
      <Radio value={12}>文件</Radio>
    </Radio.Group>
  )
}
export default OutputParams