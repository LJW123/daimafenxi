let zLevels: any[] = [];
export function zoomToHeight(zoomLevel: any) {
  // let zLevels = getZoomLevelHeights(viewer, 1);
  let result = zLevels.find((l) => l.level == zoomLevel);
  if (result) {
    return result.height;
  }
  return 50;
}
export function heightToZoom(height: any) {
  // let zLevels = getZoomLevelHeights(viewer, 1);

  let result = zLevels
    .map((z) => {
      z.dis = Math.abs(z.height - height);
      return z;
    })
    .sort((a: any, b: any) => {
      if (a.dis > b.dis) {
        return 1;
      } else if (a.dis < b.dis) {
        return -1;
      }
      return 0;
    });
  if (result.length > 0) return result[0].level;

  return 1;
}

export function getZoomLevelHeights(viewer: any, precision: any) {
  precision = precision || 10;
  var step = 100000.0;
  var result = [];
  var currentZoomLevel = 0;
  for (var height = 100000000.0; height > step; height = height - step) {
    var level = detectZoomLevel(viewer, height);
    if (level === null) {
      break;
    }
    if (level !== currentZoomLevel) {
      var minHeight = height;
      var maxHeight = height + step;
      while (maxHeight - minHeight > precision) {
        height = minHeight + (maxHeight - minHeight) / 2;
        if (detectZoomLevel(viewer, height) === level) {
          minHeight = height;
        } else {
          maxHeight = height;
        }
      }
      result.push({
        level: level,
        height: Math.round(height),
        dis: 0,
      });
      currentZoomLevel = level;
      if (result.length >= 2) {
        step = (result[result.length - 2].height - height) / 1000.0;
      }
    }
  }
  zLevels = result;
  // return result;
}

function detectZoomLevel(viewer: any, distance: any): any {
  var scene = viewer.scene;
  var tileProvider = scene.globe._surface.tileProvider;
  var quadtree = tileProvider._quadtree;
  var drawingBufferHeight = viewer.scene.canvas.clientHeight;
  var sseDenominator = viewer.camera.frustum.sseDenominator;

  for (var level = 0; level <= 19; level++) {
    var maxGeometricError = tileProvider.getLevelMaximumGeometricError(level);
    var error =
      (maxGeometricError * drawingBufferHeight) / (distance * sseDenominator);
    if (error < quadtree.maximumScreenSpaceError) {
      return level;
    }
  }

  return null;
}
/**
 * @param {Map} map mapbox map
 * @returns {Object} 含 heading、pitch、roll=0 的对象
 */
export const toCesium = (map: any) => {
  if (map) {
    return {
      heading: 360 + map?.painter.transform.pitch,
      pitch: map?.painter.transform.bearing * -1,
      roll: 0,
    };
  }
  return;
};

/**
 * @param {Camera} cesiumCamera CesiumCamera
 * @returns {Object} 含 bearing、pitch 的对象
 */
export const toMapbox = (cesiumCamera: any) => {
  if (cesiumCamera) {
    return {
      bearing: cesiumCamera.heading - 360,
      pitch: cesiumCamera.pitch * -1,
    };
  }
  return;
};
