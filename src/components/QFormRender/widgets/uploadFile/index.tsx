import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Upload } from 'antd';
import { datamg } from '@/common';
import { useEffect, useState } from 'react';

import styles from './styles.less';
import groupSpace from '@/mobx/groupSpace';
const { Dragger } = Upload;
const UploadFile = (props: any) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const gpid = groupSpace.getGroup();

  useEffect(() => {
    if (props?.value?.length > 0) {
      let newFileList = props.value?.map((item: any, index: any) => {
        return {
          url: item.url,
          name: item?.name,
        };
      });
      setFileList(newFileList); //把每一个返回回来的 图片item 处理好后 放入DileList
    }
  }, [props]);


  const uploadProps: any = {
    name: 'file',
    multiple: true,
    action: `${datamg}/qfile/upload`,
    data: {
      gpid: gpid
    },
  };


  const handleChange = ({ file, fileList }: any) => {
    let _fileList = fileList.map((_file: any) => {
      let resItem: any = {};
      if (_file.response) {
        resItem.name = file.name;
        resItem.url = `/qfile/preview/${file.name}?gpid=${gpid}`; //文件地址
      } else {
        resItem = _file
      }
      return resItem;
    })

    if (file.status !== undefined) {
      if (file.status === 'done') {
        triggerChange(_fileList);
      } else if (file.status === 'error') {
      } else if (file.status === 'removed') {
        triggerChange(_fileList);
      }
    }
    setFileList([..._fileList]);
  };

  // 上传成功后将值传递到父组件
  const triggerChange = (value: any) => {
    props.onChange(value)

    // props.addons.setValue(props.addons.dataPath, value);
  };

  return (
    <div className={styles.upload_file}>
      <Dragger
        {...uploadProps}
        fileList={fileList}
        onChange={handleChange}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">单击或拖动文件到此区域以上传</p>
        <p className="ant-upload-hint">支持单个或批量上传</p>
      </Dragger>
    </div >
  )
}

export default UploadFile;