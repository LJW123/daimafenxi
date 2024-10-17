import { DatePicker, Form, Input, Modal, Tabs } from "antd";
import { useEffect, useState } from "react";

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
const RowEditView: React.FC<{
  visible: boolean,
  fields: any,
  title: string,
  yMetainfo: object,
  onSubmit: Function,
  onCancle: Function,
  defaultValue?: any,
}> = ({ visible, fields, title, yMetainfo, onSubmit, onCancle, defaultValue }) => {
  let metainfo: any = yMetainfo;
  const [form] = Form.useForm();

  const [formItems, setFormItems] = useState<any>([]);

  useEffect(() => {
    let list = [];
    for (let li of fields) {
      list.push(li)
    }
    setFormItems(list);
  }, [fields]);


  const handleOk = () => {
    form.submit();
  }

  const onFinish = (values: any) => {
    if (onSubmit) {
      onSubmit(values)
    }
  }

  const tabsItems = [
    {
      key: '1',
      label: `信息`,
      children: <>
        {formItems.map((li: any) => {
          return <Form.Item name={li.dataIndex} label={li.title} key={`rowEdit_${li.key}`} >
            <Input />
          </Form.Item>
        })}
        {metainfo?.timescale && <Form.Item name={'rtime'} label={'时间'} key={`rowEdit_rtime`} >
          <DatePicker showTime style={{ width: '100%' }} format='YYYY/MM/DD HH:mm:ss' />
        </Form.Item>}
        {metainfo?.timescale && <Form.Item name={'extendId'} label={'设备Id'} key={`rowEdit_extendId`} >
          <Input />
        </Form.Item>}
      </>,
    },
    {
      key: '2',
      label: `分类`,
      children: <>
        <Form.Item name={'type1'} label={'type1'} key={`rowEdit_type1`} >
          <Input />
        </Form.Item>
        <Form.Item name={'type2'} label={'type2'} key={`rowEdit_type2`} >
          <Input />
        </Form.Item>
        <Form.Item name={'type3'} label={'type3'} key={`rowEdit_type3`} >
          <Input />
        </Form.Item>
      </>,
    },
  ]

  return (
    <Modal
      title={title || '编辑数据'}
      open={visible}
      onOk={handleOk}
      onCancel={() => onCancle()}
      destroyOnClose={true}
    >
      <Form
        {...layout}
        form={form}
        name="edit"
        initialValues={defaultValue}
        onFinish={onFinish}
      >

        <Tabs
          defaultActiveKey="1"
          items={tabsItems}
        />
      </Form>
    </Modal>
  )
}

export default RowEditView;