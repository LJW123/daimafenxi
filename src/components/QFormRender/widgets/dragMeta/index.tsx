import { datamg } from '@/common';
import axiosFn from '@/server/axios';
import { useEffect, useState } from 'react';
import { Select } from 'antd';
import groupSpace from '@/mobx/groupSpace';
import { TreeSelect } from 'antd';
const { Option } = Select;

// 单个元信息
const DragMeta = (props: any) => {
  const value = props.value;
  const onChange = props.onChange;
  const schema = props.schema;
  const classId = schema.classId;

  const [options, setOptions] = useState<any>([])
  const [treeData, setTreeData] = useState<any>([])

  useEffect(() => {
    if (classId) {
      queryMetaInfoByClassId(classId)
    } else {
      loadTreeRoot({
        pos: {
          id: groupSpace.getGroup(),
          type: {
            otid: 2,
          },
        },
      })
    }
  }, [classId])


  // 根据类型id查询元信息
  const queryMetaInfoByClassId = (classId: string) => {
    let url = `${datamg}/metainfo/query`;
    let parmas = {
      classIds: [classId]
    }
    axiosFn.commonPost(url, parmas).then((res: any) => {
      if (res.data.status == 200) {

        let items = res.data.data.items;
        setOptions(items)
      }
    })
  };

  // 查询根节点
  const loadTreeRoot = (params: any) => {
    let url = `${datamg}/catalog/root/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      let data = res.data.data;
      let item = data.items[0];
      if (item) {
        let treeId = item.id;
        queryCatalogPull(treeId);
      }
    })

  };

  // 查询数据集
  const queryCatalogPull = (id: any) => {
    let url = `${datamg}/catalog/pull/${id}`
    axiosFn.commonGet(url).then((res: any) => {
      let data = [res.data.data];
      let rs = listToTree(data);
      setTreeData(rs)
    })
  };

  // 根据请求到的目录树结构，把relatedObjs放入children
  const listToTree = (treeData: any) => {
    const data = treeData.map((item: any) => {

      // 判断该节点是否有relatedObjs
      if (item.relatedObjs && item.relatedObjs.length) {
        let relatedObjsRes = item.relatedObjs.map((it: any) => {
          let itRes = {
            ...it,
          };
          return itRes;
        });
        item.children = [...item.children, ...relatedObjsRes];
      }
      let res = {
        ...item,
        key: item.obj ? item.obj.id : item.id,
        children:
          item.children && item.children.length
            ? listToTree(item.children)
            : null,
      };
      return res;
    });
    return data;
  };


  const onSelect = (value: any, node: any) => {
    let obj = node.obj;
    if (obj) {
      onChange(obj.id)
    }
  };


  return classId ? <Select
    value={value}
    onChange={onChange}
  >
    {options.map((item: any) => {
      return <Option key={item.id} value={item.id}>{item.name}</Option>
    })
    }
  </Select>
    :
    <TreeSelect
      showSearch
      style={{ width: '100%' }}
      value={value}
      allowClear
      treeDefaultExpandAll
      onSelect={onSelect}
      // onChange={onChange}
      treeData={treeData}
      fieldNames={{
        label: "name",
        value: "key"
      }}
    />
};

export default DragMeta