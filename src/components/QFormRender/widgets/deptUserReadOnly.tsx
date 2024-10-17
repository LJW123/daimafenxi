import { useEffect, useState } from 'react';
const DeptUserReadOnly = (props: any) => {
  const [userList, setUserList] = useState<any>([]);

  useEffect(() => {
    if (props?.value?.length > 0) {
      setUserList(props.value)
    }
  }, [props]);

  return (
    <div>
      {userList.map((item: any) => {
        return <span key={item.key} style={{ marginRight: 10 }}>{item?.label}</span>
      })}
    </div>
  );
};

export default DeptUserReadOnly;

