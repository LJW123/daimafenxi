// 部门组件
import React, { useState, useEffect } from 'react';
import { Cascader } from 'antd';
import ToTree from './tree';
import { coreUrl, datamg } from '@/common';
import axiosFn from '@/server/axios';

const Dept = (props: any) => {
  const [treeData, setTreeData] = useState<any>([]);
  useEffect(() => {
    // 获取组织架构id
    if (props.schema?.orgId) {
      let orgId = props.schema.orgId;
      queryOrg(orgId);
    }
  }, [props.schema?.orgId]);

  //根据组织id查询组织详情
  const queryOrg = (id: any) => {
    let params = {
      id: id,
    };
    let url = `${coreUrl}/permission/organization/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      let resData = res.data.data;
      let orgData = resData.items[0];
      queryDepartment(orgData);
    })

  };

  // 根据组织id查询部门
  const queryDepartment = (orgData: any) => {
    let params = {
      orgId: orgData.id,
    };

    let url = `${coreUrl}/permission/department/query`;
    axiosFn.commonPost(url, params).then((res: any) => {
      let resData = res.data.data;
      let departmentData = resData.items;
      getTreeDataFun(orgData, departmentData);
    })
  };

  // 处理树形数据
  const getTreeDataFun = (orgData: any, depData: any) => {
    let treeArr = [
      {
        title: orgData.name,
        name: orgData.name,
        key: orgData.id,
        id: orgData.id,
        orgid: orgData.id,
        parentId: 0,
      },
    ];
    // 判断组织下是否有部门
    if (depData) {
      //给部门数据添加key和title
      depData.forEach((el: any) => {
        el.key = el.id;
        el.title = el.name;
      });
      let list = treeArr.concat(depData);
      let newTreeData = new ToTree({
        id: 'id',
        pId: 'parentId',
        children: 'children',
      }).listToTree(list);
      setTreeData(newTreeData);
    } else {
      setTreeData(treeArr);
    }
  };

  const onChange = (value: string[]) => {
    props.onChange(value)
    // props?.addons?.setValue(props.addons.dataPath, value);
  };

  return (
    <>
      {treeData &&
        <Cascader
          style={{ width: '100%' }}
          changeOnSelect
          options={treeData}
          fieldNames={{ label: 'name', value: 'name', children: 'children' }}
          // displayRender={displayRender}
          onChange={onChange}
        />
      }
    </>
  )
};

export default Dept;