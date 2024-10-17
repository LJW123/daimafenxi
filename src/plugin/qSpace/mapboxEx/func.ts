import axios from 'axios';
import { getQMap, ProjectFn, getDataUrl, getGroupId } from '../core';
import sel1 from '../images/s1.png';
import { Uint8ArrayToString, crateImageData } from '../util/helper';
import base64js from 'base64-js';

// 获取单个场景
export const querySceneId = (sid: string, resolve?: any, reject?: any) => {
  const datamg = `${getDataUrl()}/datamg`;
  const token = window.qSpaceToken;
  axios
    .create({
      headers: {
        token: token,
      },
    })
    .post(`${datamg}/mapservice/scene/query`, {
      id: sid,
      loadObjectClass: true,
    })
    .then((res) => {
      let items = res.data.items;
      if (items.length > 0) {
        let scene = items[0];
        if (resolve) resolve(scene);
      }
    })
    .catch(() => {
      if (reject) reject();
    });
};

//获取全部 底图场景
export const queryBasicmapList = (gid: string, resolve?: any, reject?: any) => {
  const datamg = `${getDataUrl()}/datamg`;
  const token = window.qSpaceToken;
  axios
    .create({
      headers: {
        token: token,
      },
    })
    .post(`${datamg}/mapservice/scene/query`, {
      groupId: gid,
      sceneType: 'basicmap',
      sort: { asc: false, sortBy: 'cTime' },
    })
    .then((res) => {
      let items = res.data.data.items;
      if (resolve) resolve(items);
    })
    .catch(() => {
      if (reject) reject();
    });
};

// 载入工作平台  工程Project
export const importProject = (pid: any, callback: any) => {
  const qMap = getQMap();
  if (qMap) {
    qMap.resetProject();
    ProjectFn.openProject(pid).then((obj: any) => {
      if (qMap && obj) {
        let openProjectObj = obj.openProjectObj;
        // 定位工程
        qMap.locationProject(openProjectObj);
        setTimeout(() => {
          qMap.Evented.fire('updateNum', {});
        }, 300);
        if (callback) callback();
      }
    });
  }
};

export let imageList: any[] | null = null;

export const addImage = (map: any, callback: any) => {
  let _imageList: any[] = [];
  if (imageList) {
    _imageList = [...imageList];
    addImageToMap(_imageList);
  } else {
    const datamg = `${getDataUrl()}/datamg`;
    let url = `${datamg}/sign/query`;
    let gid = getGroupId();

    axios
      .post(url, {
        gpid: gid,
      })
      .then((res: any) => {
        let data = res.data.data;
        let items = data.items;
        imageList = [...items];

        addImageToMap(items);
      })
      .catch(() => {});
  }

  function addImageToMap(list: any[]) {
    for (let i = 0; i < list.length; i++) {
      let symbol = list[i];
      let image = new Image();
      // image.width = symbol.size;
      // image.height = symbol.size;
      if (symbol.fileType && symbol.fileType.toLowerCase() === 'svg') {
        let result = base64js.toByteArray(symbol.file);
        let svgHtml = Uint8ArrayToString(result);
        let canvas = crateImageData(svgHtml, symbol.size);
        if (canvas) {
          image.src = canvas.toDataURL('image/png');
        }
      } else if (symbol.fileType && symbol.fileType.toLowerCase() === 'png') {
        image.src = `data:image/png;base64,${symbol.file}`;
      }
      image.onload = function () {
        if (!map) return;
        if (map.hasImage(symbol.name)) {
          map.removeImage(symbol.name);
        }
        map.addImage(symbol.name, image);
      };
    }

    setTimeout(() => {
      if (callback) callback();
    }, 300);
  }
};

export const createSelectSvg = async (map: any) => {
  let image = new Image();
  image.width = 100;
  image.height = 100;
  let imgUrl = sel1;
  if (imgUrl) {
    image.src = imgUrl;
    let name = 'sel_point';
    image.onload = function () {
      if (!map) return;
      if (map.hasImage(name)) {
        map.removeImage(name);
      }
      map.addImage(name, image, { sdf: true });
    };
  }
};
