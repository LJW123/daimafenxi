import { toolList, QToolModel, ToolModel } from '../../core';
interface ToolMap {
  [key: string]: QToolModel;
}

/**
 * 工具箱
 */
class ToolBox {
  map: any;

  /**
   * 工具集合
   */
  tools: ToolMap = {};
  /**
   * 当前工具名称
   */
  currentToolName: string = '';

  constructor(map: any) {
    this.map = map;

    this.loadMapboxTools(toolList.allToolList);
  }

  loadMapboxTools(toolList: ToolModel[]) {
    let mapboxTool = toolList;
    for (let i = 0; i < mapboxTool.length; i++) {
      let tool: ToolModel = mapboxTool[i];
      this.tools[tool.name] = new tool.tool();
    }
  }

  activateTool(toolName: string, opts?: any): void {
    if (this.tools[toolName]) {
      if (this.currentToolName && this.tools[this.currentToolName]) {
        this.tools[this.currentToolName].disable();
      }
      this.currentToolName = toolName;
      if (this.map) {
        this.map.getCanvas().style.cursor = 'crosshair';
      }
      this.tools[toolName].activate({
        ...opts,
      });

    }
  }
  disableTool(toolName: string = ''): void {
    if (this.map) {
      this.map.getCanvas().style.cursor = '';
    }
    if (toolName === '') toolName = this.currentToolName;
    if (this.tools[toolName]) {
      this.currentToolName = '';
      this.tools[toolName].disable();
    }
  }
  getNowTool(val?: any) {
    if (val && this.tools[val]) {
      return this.tools[val];
    }
    if (this.currentToolName && this.tools[this.currentToolName]) {
      return this.tools[this.currentToolName];
    }
  }
  getNowToolName() {
    return this.currentToolName;
  }
}

export default ToolBox;
