import { Pagination, Popconfirm, Space, Tooltip, } from 'antd';
import { AgGridReact, } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { queryStatusByKey, } from '@/scripts/systemDict';
import moment from 'moment';

import styles from './styles.less';
import { chineseComparator, filterParamsFun, numberComparator, setFilterParamsFun } from '@/scripts/agGridReactTable';
const AgGridReactTable = (props: any) => {
  const domId = props.domId;
  const dataList = props.dataList;
  const queryList = props.queryList;
  const initParams = props.initParams;
  const filterParams = props.filterParams;
  const setFilterParams = props.setFilterParams;
  const getActionCellRenderer = props.getActionCellRenderer;

  // let _dataList: any = useRef();
  // _dataList.current = dataList;



  const columns: any = [
    {
      headerName: '名称',
      field: 'name',
      filterParams: setFilterParamsFun,
      flex: 1,
      sortable: true,
      comparator: chineseComparator,
      cellRenderer: (api: any) => {
        let data = api.data.name;
        return (
          <Tooltip title={data} placement="topLeft" >
            {data}
          </Tooltip>
        );
      }
    },

    {
      headerName: '类型',
      field: 'tags',
      filterParams: setFilterParamsFun,
      flex: 1,
      sortable: true,
      comparator: chineseComparator,
      cellRenderer: (api: any) => {
        let data = api.data.tags;
        return (
          <Tooltip title={data} placement="topLeft" >
            {data}
          </Tooltip>
        );
      }
    },
    {
      headerName: '状态',
      field: 'processStatus',
      filterParams: setFilterParamsFun,
      flex: 1,
      sortable: true,
      comparator: chineseComparator,
      cellRenderer: (api: any) => {
        let data = api.data.processStatus;
        let res: any = queryStatusByKey(data);
        return (
          <span style={{ color: `${res.color}` }} >{res.cname}</span>
        )
      }
    },
    {
      headerName: '开始时间',
      field: 'sTime',
      filterParams: setFilterParamsFun,
      flex: 1,
      sortable: true,
    },
    {
      headerName: '结束时间',
      field: 'eTime',
      filterParams: setFilterParamsFun,
      flex: 1,
      sortable: true,
      cellRenderer: (api: any) => {
        let data = api.data.eTime;
        if (data) {
          return data;
        } else {
          return '-';
        }
      }
    },
    {
      headerName: '耗时(秒)',
      field: 'operation',
      filterParams: setFilterParamsFun,
      flex: 1,
      sortable: true,
      comparator: (a: any, b: any, node: any, node2: any) => {
        let aTime = getTime(node.data);
        let bTime = getTime(node2.data);
        return numberComparator(aTime, bTime)
      },
      cellRenderer: (api: any) => {
        let record = api.data;
        return getTime(record)
      }
    },
    {
      headerName: '操作',
      field: 'action',
      width: 'auto',
      pinned: 'right',
      filter: false,
      cellClass: "suppress-movable-col",
      cellRenderer: getActionCellRenderer
    }
  ];



  // 根据sTime,eTime获取耗时
  const getTime = (record: any) => {
    let sTime = moment(record.sTime);
    let eTime = moment(record.eTime);
    
    if (record.eTime) {
      let res = eTime - sTime;
      let seconds = Math.floor(res / 1000);
      return seconds
    } else {
      return '-'
    }
  };

  // 分页改变
  const onChangePagination = (page: any, pageSize: any) => {
    let params = {
      ...filterParams,
      pageNum: page,
      pageSize: pageSize,
    };
    queryList(params)
  };

  // 获取表格高度
  const getTableScrollY1 = () => {
    let doc: any = document.getElementById(domId);
    if (doc) {
      let sty = getComputedStyle(doc, null);
      let res = parseFloat(sty.height) - 64;
      return res;
    }
    return 340;
  };
  let scrollY1: any = getTableScrollY1();

  return (
    <>
      <div
        className="ag-theme-alpine"
        style={{
          height: scrollY1,
        }}
      >
        <AgGridReact
          columnDefs={columns}
          rowData={dataList?.items || []}
          defaultColDef={{
            resizable: true,
            filter: 'agTextColumnFilter',
            suppressMovable: true,
          }}

          onFilterChanged={(filterParams) => {
            // 处理过滤器变化
            const filterInstance = filterParams.api.getFilterModel();
            let params = filterParamsFun(initParams, filterInstance);
            setFilterParams(params);
            queryList(params)
          }}
        />
      </div>

      <div className={styles.table_pagination}>
        {dataList &&
          <Pagination
            showSizeChanger={true}
            current={Number(dataList.pageNo || "0")}
            total={Number(dataList.totalItems || "0")}
            pageSize={Number(dataList.pageSize || "0")}
            onChange={onChangePagination}
            pageSizeOptions={[10, 20, 50, 100, 500, 1000]}
            showTotal={(total) => `共 ${total} 条`}
          />
        }
      </div>
    </>
  );
};
export default AgGridReactTable;
