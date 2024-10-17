import { makeAutoObservable } from "mobx";
import Data from "@/configs/pageConfig/data";


type showCountModalType = {
  title: string,
  workFlowId: string,

};

class UiState {

  // leftClickItem: Data | null = null;
  leftClickEnterItem: Data | null = null;

  // headerClickItem: any = null;

  rightPageShow: boolean = true;
  // rightCharts: Array<Chart> = [];

  showCountModal: showCountModalType | null = null;


  // 点击查询的数据
  clickQueryData: any = null;

  // 河流图谱的名称
  showRiverName: string = ''

  //行政区划数据
  regionTreeData: any = null
  selectedRegion: any[] = ['新疆维吾尔自治区']
  //河流数据
  riversTreeData: any = null
  selectedRiver: any[] = []

  // 河流图表的最大化
  fullScreen: boolean = false;

  // 河流信息汇总
  rvInfo: any = null;

  // 疆域
  jyData: any = null;

  constructor() {
    makeAutoObservable(this)
  }
  setJyData(data: any) {
    this.jyData = data
  }
  setRvInfo(data: any) {
    this.rvInfo = data
  }
  setFullScreen(data: boolean) {
    this.fullScreen = data
  }
  setSelectedRegion(data: any) {
    this.selectedRegion = data

  }
  setSelectedRiver(data: any) {
    this.selectedRiver = data
  }
  setRegionTreeData(data: any) {
    this.regionTreeData = data
  }
  setRiversTreeData(data: any) {
    this.riversTreeData = data
  }
  setShowRiverName(name: string) {
    this.showRiverName = name
  }
  setClickQueryData(data: any) {
    this.clickQueryData = data
  }
  setClickQueryDataEve(point: any) {

    const obj = { ...this.clickQueryData }
    obj.eve.point = point
    this.setClickQueryData(obj)
  }

  // setHeaderClickItem(data: any) {
  //   this.headerClickItem = data
  // }

  // setLeftClickItem(data: Data | null) {
  //   this.leftClickItem = data
  // }
  
  setRightPageShow(data: boolean) {
    this.rightPageShow = data
  }

  setLeftClickEnterItem(data: Data | null) {
    if (data?.charts && data?.charts.length > 0) {
      this.leftClickEnterItem = data
    } else {
      this.leftClickEnterItem = null
    }
  }

  // setSelLeftClickItem(data: Data | null) {
  //   if (data) {
  //     this.setLeftClickItem(data)
  //   } else {
  //     this.setLeftClickItem(null)
  //   }
  // }


  setShowCountModal(obj: showCountModalType | null) {
    this.showCountModal = obj
  };

}

const uiState = new UiState();

export default uiState

