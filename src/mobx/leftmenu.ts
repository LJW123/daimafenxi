import Data from "@/configs/pageConfig/data";
import { makeAutoObservable, runInAction } from "mobx";


class LeftMenu {
  private static instance: LeftMenu;
  public static getInstance() {
    if (!LeftMenu.instance) {
      LeftMenu.instance = new LeftMenu();
    }
    return LeftMenu.instance;
  }

  mainMnueView: boolean = false;

  panelView: boolean = false;


  leftClickItem: Data | null = null;

  constructor() {
    makeAutoObservable(this)
  }

  setMainMnueView(value: boolean) {
    runInAction(() => {
      this.mainMnueView = value
    })
  }

  setPanelView(value: boolean) {
    runInAction(() => {
      this.panelView = value
    })
  }

  isShow() {
    return this.mainMnueView || this.panelView
  }

  setLeftClickItem(data: Data | null) {
    this.leftClickItem = data
  }


  setSelLeftClickItem(data: Data | null) {
    if (data) {
      this.setLeftClickItem(data)
    } else {
      this.setLeftClickItem(null)
    }
  }

}

 
export default LeftMenu