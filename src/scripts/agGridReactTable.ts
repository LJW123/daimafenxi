import moment from "moment";

const filterParamsFun = (initParams: any, obj: any) => {

  let params: any = {
    ...initParams,
    attrs: { whereConditions: [] }
  }

  // 自定义过滤
  for (const key in obj) {
    if (key.indexOf('.') !== -1) {
      let val = obj[key];
      let attsArr = key.split('.');
      if (val.type == 'customContains') {
        // 包含
        params.attrs.whereConditions.push(
          {
            whereType: 'equal',
            target: attsArr[1],
            value: val.filter,
            operation: 3,
          }
        )
      } else if (val.type == 'customEquals') {
        // 相等
        params.attrs.whereConditions.push(
          {
            whereType: 'equal',
            target: attsArr[1],
            value: val.filter,
            operation: 0,
          }
        )
      } else if (val.type == 'betweenExclusive') {
        // 时间范围查询
        params.attrs.whereConditions.push(
          {
            whereType: 'range',
            min: val.dateFrom,
            max: val.dateTo,
            target: attsArr[1],
            operation: 0,
          }
        )
      }
    } else {
      if (key == 'ctime') {
        params.bTime = moment(obj.ctime.dateFrom, 'YYYY-MM-DD HH:mm:ss').valueOf()
        params.eTime = moment(obj.ctime.dateTo, 'YYYY-MM-DD HH:mm:ss').valueOf()

        // params.bTime = obj.ctime.dateFrom;
        // params.eTime = obj.ctime.dateTo;

      } else {
        params[key] = obj[key].filter;
      }
    }
  }

  return params
}

const setFilterParamsFun = () => {
  return ({
    maxNumConditions: 1,
    filterPlaceholder: "",
    filterOptions: [
      {
        displayKey: 'customEquals',
        displayName: '相等',
        predicate: (filterValue: any, cellValue: any) => {
          return true
        }
      },
      {
        displayKey: 'customContains',
        displayName: '包含',
        predicate: (filterValue: any, cellValue: any) => {
          return true
        }
      },

    ],

  })
}


const setDateFilterParamsFun = () => {
  return ({
    maxNumConditions: 1,
    filterPlaceholder: "",
    filterOptions: [
      {
        displayKey: 'betweenExclusive',
        displayName: '日期范围',
        predicate: (filterValue: any, cellValue: any) => {
          return true
        },
        numberOfInputs: 2,
      }
    ]
  })
}

// 导出csv时，处理显示数据
const getExportToCsvFun = (params: any) => {
  let value = params.value || "";
  let dtype = params.column.colDef?.dtype || null;
  let resValue = "";
  if (dtype == 10) {
    // 图片格式
    resValue = value?.name || value?.id
  } else if (dtype == 12) {
    // 文件格式
    if (Array.isArray(value)) {
      value.forEach((it: any) => {
        resValue = resValue + (it?.name || it?.id)
      });
    } else {
      resValue = value?.name || value?.id
    }
  } else if (dtype == 7) {
    let dateTime = moment(Number(value)).format('YYYY-MM-DD HH:mm:ss')
    resValue = dateTime
  } else {
    resValue = value;
  }

  return resValue
};

// grid 导出 csv
const exportToCsv = (gridApi: any) => {
  if (gridApi) {
    let columnDefs = gridApi.columnModel.columnDefs;
    let columnKeys: any = [];
    columnDefs.forEach((item: any) => {
      if (item.headerName !== '操作') {
        columnKeys.push(item.field)
      }
    });
    const csvContent = gridApi.getDataAsCsv({
      onlySelected: true, //仅导出选中的行
      columnKeys: columnKeys,
      processCellCallback: (params: any) => {
        let val = getExportToCsvFun(params);
        return val
      },
    });

    // 下面是一个简单的示例，将CSV内容下载为文件
    const link = document.createElement("a");
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    link.download = 'export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 中文首字母排序
const chineseComparator = (a: any, b: any) => {
  try {
    let res = a.localeCompare(b, 'zh-Hans-CN', { sensitivity: 'accent' })
    return res
  } catch (error) {

  }

};

// 数字排序
const numberComparator = (a: any, b: any) => {
  let _valueA = Number(a);
  let _valueB = Number(b);
  if (_valueA == _valueB) return 0;
  return (_valueA > _valueB) ? 1 : -1;
};

export {
  filterParamsFun,
  setFilterParamsFun,
  setDateFilterParamsFun,
  getExportToCsvFun,
  exportToCsv,
  chineseComparator,
  numberComparator,
}