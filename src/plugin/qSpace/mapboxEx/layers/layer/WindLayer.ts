// import { PUBLIC_PATH } from '@/config';
import { getQMap, WindGL, getPUBLIC_PATH } from '../../../core';

// const windjs: any = require('../../../wind/index.js');
// const WindGL = windjs.default;

const windFiles: any = {
  0: '2016112000',
  6: '2016112006',
  12: '2016112012',
  18: '2016112018',
  24: '2016112100',
  30: '2016112106',
  36: '2016112112',
  42: '2016112118',
  48: '2016112200',
};

const qWindLayer = (layerId: any) => {
  const map = getQMap()?.getMap();

  const updateWind = (name: any) => {
    let url = `${getPUBLIC_PATH()}wind/${windFiles[name]}`;

    getJSON(url + '.json', function (windData: any) {
      const windImage = new Image();
      windData.image = windImage;
      windImage.src = url + '.png';
      windImage.onload = function () {
        wind.setWind(windData);
      };
    });
  };

  const getJSON = (url: any, callback: any) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('get', url, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(xhr.response);
      } else {
        throw new Error(xhr.statusText);
      }
    };
    xhr.send();
  };
  let wind: any = null;
  let tmpmatrix: any = null;
  let windLayer = {
    id: layerId,
    type: 'custom',
    onAdd: function (map: any, gl: any) {
      wind = new WindGL(gl);
      wind.numParticles = 65536;
      updateWind(0);
    },
    render: function (gl: any, matrix: any) {
      tmpmatrix = matrix;
      if (wind.windData) {
        // wind.resize();
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        wind.draw(matrix);
        map.triggerRepaint();
        return true;
        // return true;
      }
    },
  };

  // map.on('wheel', () => {
  //   if (wind) wind.resize();
  // });
  map.on('dragstart', () => {
    if (wind) wind.resize();
  });
  map.on('move', () => {
    if (wind) wind.resize();
  });

  return windLayer;

  // map.on('load', function () {
  //     map.addLayer(windLayer);
  // });
  //   if (map.getLayer(layerId)) {
  //     map.removeLayer(layerId);
  //   }
  //   map.addLayer(windLayer);

  //   let popup: Popup | null = null;
  //   map.on('mousemove', (e: any) => {
  //     let coordinate = {
  //       x: e.lngLat.lng,
  //       y: e.lngLat.lat,
  //     };
  //     let windSpeed = null;
  //     if (wind) {
  //       windSpeed = wind.getSpeed(coordinate);
  //       // if (windSpeed) {
  //       //   '风速风向', windSpeed
  //       // }
  //       if (popup) {
  //         popup.remove();
  //         popup = null;
  //       }
  //       // popup = new Popup({ closeOnClick: false })
  //       //     .setLngLat([coordinate.x, coordinate.y])
  //       //     .setHTML(`<div>水平风速：${windSpeed[0]}m/s</div><div>垂直风速：${windSpeed[1]}m/s</div>`)
  //       //     .addTo(map);
  //     }
  //   });
};

export default qWindLayer;
