import { saveAs } from 'file-saver';

import { QMapGl, exportMap } from '../../core';
import CrosshairManager from './crosshair_manager';
import PrintableAreaManager from './printable_area_manager';

class MapGenerator {
  map: any;

  // 默认导出类型  A4大小 单位mm毫米  300DPI png格式
  width: number = exportMap.Size.A4[0];
  height: number = exportMap.Size.A4[1];
  dpi: number = 300;
  format: string = exportMap.Format.PNG;
  unit: string = 'mm';
  pageOrientation = 'l';

  crosshair: CrosshairManager | undefined;
  printableArea: PrintableAreaManager | undefined;

  maskingShow: boolean = false;

  constructor(map: any) {
    this.map = map;
  }

  setShowMasking(state: boolean) {
    this.maskingShow = state;
    this.setShowCrosshair(state);
    this.setShowPrintableArea(state);
  }
  getShowMasking() {
    return this.maskingShow;
  }
  setShowCrosshair(state: boolean) {
    if (state === false) {
      if (this.crosshair !== undefined) {
        this.crosshair.destroy();
        this.crosshair = undefined;
      }
    } else {
      this.crosshair = new CrosshairManager(this.map);
      this.crosshair.create();
    }
  }
  setShowPrintableArea(state: boolean) {
    if (state === false) {
      if (this.printableArea !== undefined) {
        this.printableArea.destroy();
        this.printableArea = undefined;
      }
    } else {
      this.printableArea = new PrintableAreaManager(this.map);
      this.updatePrintableArea();
    }
  }

  updatePrintableArea() {
    if (this.printableArea === undefined) {
      return;
    }
    this.printableArea.updateArea(this.width, this.height);
  }
  getDefParam() {
    return {
      size: 'A4',
      dpi: 300,
      format: 'PNG',
      page: '横向打印',
    };
  }

  setParam(allValues: any) {
    for (let i in allValues) {
      let value = allValues[i];
      if (i === 'size') {
        let size = exportMap.Size[value];
        let _page = allValues.page;
        let page = exportMap.PageOrientation[_page];
        if (page === 'l') {
          this.width = size[0];
          this.height = size[1];
        } else if (page === 'p') {
          this.width = size[1];
          this.height = size[0];
        }
      } else if (i === 'dpi') {
        let dpi = exportMap.DPI[value];
        this.dpi = dpi;
      } else if (i === 'format') {
        let format = exportMap.Format[value];
        this.format = format;
      } else if (i === 'page') {
        let page = exportMap.PageOrientation[value];
        this.pageOrientation = page;
      }
    }
    this.updatePrintableArea();
  }

  export(callback?: Function) {
    const this_ = this;

    // 获取像素比
    const actualPixelRatio: number = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', {
      get() {
        return this_.dpi / 96;
      },
    });

    // 创建一个容纳下面地图的容器
    const hidden = document.createElement('div');
    hidden.className = 'hidden-map';
    document.body.appendChild(hidden);
    const container = document.createElement('div');
    container.style.width = this.toPixels(this.width);
    container.style.height = this.toPixels(this.height);
    hidden.appendChild(container);

    const style = this.map.getStyle();

    if (style && style.sources) {
      const sources = style.sources;
      Object.keys(sources).forEach((name) => {
        const src = sources[name];
        Object.keys(src).forEach((key) => {
          // delete properties if value is undefined.
          // for instance, raster-dem might has undefined value in "url" and "bounds"
          if (!src[key]) delete src[key];
        });
      });
    }

    // 创建地图
    const renderMap = new QMapGl.Map({
      container,
      style,
      center: this.map.getCenter(),
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch(),
      interactive: false,
      preserveDrawingBuffer: true,
      fadeDuration: 0,
      attributionControl: false,
      // hack to read transfrom request callback function
      transformRequest: (this.map as any)._requestManager._transformRequestFn,
    });
    // 加载图片 图标
    const images = (this.map.style.imageManager || {}).images || [];

    Object.keys(images).forEach((key) => {
      renderMap.addImage(key, images[key].data);
    });

    renderMap.once('idle', () => {
      const canvas = renderMap.getCanvas();
      const fileName = `map_export.${this_.format}`;
      switch (this_.format) {
        case exportMap.Format.PNG:
          this_.toPNG(canvas, fileName);
          break;
        case exportMap.Format.JPEG:
          this_.toJPEG(canvas, fileName);
          break;
        default:
          console.error(`无效: ${this_.format}`);
          break;
      }

      renderMap.remove();
      hidden.parentNode?.removeChild(hidden);
      Object.defineProperty(window, 'devicePixelRatio', {
        get() {
          return actualPixelRatio;
        },
      });
      if (callback) callback();
    });
  }

  toJPEG(canvas: HTMLCanvasElement, fileName: string) {
    const uri = canvas.toDataURL('image/jpeg', 0.85);
    const a = document.createElement('a');
    a.href = uri;
    a.download = fileName;
    a.click();
    a.remove();
  }
  toPNG(canvas: HTMLCanvasElement, fileName: string) {
    canvas.toBlob((blob) => {
      // @ts-ignore
      saveAs(blob, fileName);
    });
  }

  toPixels(length: number, conversionFactor = 96) {
    if (this.unit === 'mm') {
      conversionFactor /= 25.4;
    }
    return `${conversionFactor * length}px`;
  }
}

export default MapGenerator;
