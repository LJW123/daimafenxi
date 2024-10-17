import * as turf from '@turf/turf';

class EmergencyLayer {
  map: any;

  constructor(map: any) {
    this.map = map;
    this.init();
  }
  init() {
    let _map = this.map;
    let size = 200;

    let pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),
      context: <any>null,
      onAdd: function () {
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },

      render: function () {
        let duration = 1000;
        let t = (performance.now() % duration) / duration;

        let radius = (size / 2) * 0.3;
        let outerRadius = (size / 2) * 0.7 * t + radius;
        let context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2,
        );
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(0, 0, this.width, this.height).data;
        // keep the map repainting
        _map.triggerRepaint();
        // return `true` to let the map know that the image was updated
        return true;
      },
    };
    this.map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
  }
  addLayer(point: any) {
    this.removeLayer();
    let buffered = turf.buffer(point, 0.5);

    this.map.addLayer({
      id: 'emergency_fill',
      type: 'fill',
      source: {
        type: 'geojson',
        data: buffered,
      },
      paint: {
        'fill-color': '#FF0000',
        'fill-opacity': 0.2,
      },
    });
    this.map.addLayer({
      id: 'emergency_point',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: point,
      },
      layout: {
        'icon-image': 'pulsing-dot',
        'icon-allow-overlap': true,
        'icon-rotation-alignment': 'map',
      },
    });
  }

  removeLayer() {
    let fill = this.map.getLayer('emergency_fill');
    if (fill) {
      this.map.removeLayer('emergency_fill');
    }
    let point = this.map.getLayer('emergency_point');
    if (point) {
      this.map.removeLayer('emergency_point');
    }

    let source1 = this.map.getSource('emergency_fill');
    if (source1) {
      this.map.removeSource('emergency_fill');
    }
    let source2 = this.map.getSource('emergency_point');
    if (source2) {
      this.map.removeSource('emergency_point');
    }
  }
}

export default EmergencyLayer;
