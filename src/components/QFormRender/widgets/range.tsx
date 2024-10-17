// 自定义input组件

import { Input } from "antd";

const Range = (props: any) => {

  const onChange1 = (e: any) => {
    let value = e.target.value;
    props.onChange([value, props.value?.[1] || 0]);
  };

  const onChange2 = (e: any) => {
    let value = e.target.value;
    props.onChange([props.value?.[0] || 0, value]);
  };

  return (
    <>
      <Input onChange={onChange1} />
      <span style={{ display: "flex", alignItems: "center" }}>
        -
      </span>
      <Input onChange={onChange2} />
    </>
  )
}

export default Range