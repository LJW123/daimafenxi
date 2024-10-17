import FormRender from '@/thirdparty/form-render';
import { useEffect, useState } from 'react';

import Dept from './widgets/dept';
import DeptUser from './widgets/deptUser';
import DeptUserReadOnly from './widgets/deptUserReadOnly';
import Type from './widgets/type';
import UploadImg from './widgets/uploadImg';
import UploadImgReadOnly from './widgets/uploadImgReadOnly';
import Meta from "./widgets/meta";
import OutputParams from './widgets/outputParams';
import DragMeta from './widgets/dragMeta';
import DragMetaList from './widgets/dragMetaList';
import OutputParamsReadOnly from './widgets/outputParamsReadOnly';
import MetaInput from './widgets/metaInput';
import UploadFile from './widgets/uploadFile';
import Range from './widgets/range';

const QFormRender = (props: any) => {
  const { onSave, formSchema, form } = props;
  const [schema, setSchema] = useState<any>({})

  useEffect(() => {
    let _formSchema = JSON.parse(JSON.stringify(formSchema));
    if (_formSchema.properties) {
      let properties = JSON.parse(JSON.stringify(_formSchema.properties));
      for (const key in properties) {
        // 兼容旧 单个元信息组件：1.type="array"，2.删除 properties 
        if (properties[key].widget == 'DragMeta' && properties[key].type == 'object') {
          properties[key].type = "array";
          delete properties[key].properties;
        }
      }
      _formSchema.properties = properties;
    }
    setSchema(_formSchema)
  }, [formSchema])

  return (
    <>
      {form &&
        <FormRender
          form={form}
          schema={schema}
          onFinish={onSave}
          widgets={{
            UploadImg,
            Type,
            Dept,
            DeptUser,
            Meta,
            DragMeta,
            DragMetaList,
            UploadImgReadOnly,
            DeptUserReadOnly,
            OutputParams,
            OutputParamsReadOnly,
            MetaInput,
            UploadFile,
            Range,
          }}
        />
      }
    </>

  )
}
export default QFormRender