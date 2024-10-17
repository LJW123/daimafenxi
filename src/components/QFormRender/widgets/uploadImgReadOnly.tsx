import { useEffect, useState } from 'react';
const UploadImgReadOnly = (props: any) => {
  const [imgList, setImgList] = useState<any>([]);
  useEffect(() => {
    if (props?.value?.length > 0) {
      let imgList = props.value?.map((item: any, index: any) => {
        return {
          url: item.url,
        };
      });
      setImgList(imgList);
    }
  }, [props]);

  return (
    <div>
      {imgList.map((item: any) => {
        return (
          <img key={item.id} src={item.url} alt="" />
        )
      })}
    </div>
  );
};

export default UploadImgReadOnly;

