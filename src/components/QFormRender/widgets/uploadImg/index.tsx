import { useEffect, useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons';
import { Upload, } from 'antd';
import type { UploadProps } from 'antd/es/upload';
import { imgUrl } from '@/common';
import styles from './styles.less';

const UploadImg = (props: any) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (props?.value?.length > 0) {
      let newFileList = props.value?.map((item: any, index: any) => {
        return {
          uid: item.id,
          id: item.id,
          url: item.url,
        };
      });
      setFileList(newFileList); //把每一个返回回来的 图片item 处理好后 放入DileList
    }
  }, [props]);

  const uploadImages = {
    name: 'files',
    action: imgUrl + '/upload',
    accept: '.jpeg,.png,.jpg',
    listType: 'picture-card',
    // className: styles.model_upload,
  };

  // 上传中、完成、失败都会调用这个函数
  const handleChange: UploadProps['onChange'] = ({ file, fileList }) => {
    let _fileList = fileList.map((file: any) => {
      let _file: any = null;
      if (file.response) {
        const { response } = file;
        _file = {
          uid: response.data[0],
          id: response.data[0],
          url: `${imgUrl}/${response.data[0]}` //预览
        }
      } else {
        _file = { ...file }
      }
      return _file;
    });

    if (file.status !== undefined) {
      if (file.status === 'done') {

        triggerChange(_fileList);
      } else if (file.status === 'error') {
      } else if (file.status === 'removed') {
        if (typeof file.uid === 'number') {
          //请求接口，删除已经保存过的图片，并且成功之后triggerChange
          triggerChange(_fileList);
        } else {
          //只是上传到了服务器，并没有保存，直接riggerChange
          triggerChange(_fileList);
        }
      }
    }
    setFileList([..._fileList]);
  };

  // 上传成功后将值传递到父组件
  const triggerChange = (value: any) => {
    props.onChange(value)
    // props?.addons?.setValue(props.addons.dataPath, value);
  };

  return (
    <div className={styles.upload_img}>
      <Upload
        {...props}
        {...uploadImages}
        fileList={fileList}
        onChange={handleChange}
      >
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      </Upload>
    </div>
  );
};

export default UploadImg;

