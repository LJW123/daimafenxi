class MapLayer {
  map: any;
  id: string = '';
  name: string = '';

  //相同source-layer
  layers: any[] = [];

  show: boolean = false;

  constructor(map: any, id: string, obj: any) {
    this.map = map;
    this.id = id;
    this.name = obj['source-layer'];
    // this.name = obj['source-layer'] || obj['source'];
  }
  addLayers(layer: any, order: string | null = null) {
    let ll = this.map.getLayer(layer.id);
    if (ll) {
      this.map.removeLayer(layer.id);
      this.layers = this.layers.filter((it: any) => it.id !== layer.id);
    }
    this.layers.push(layer);
    if (order) {
      this.map.addLayer(layer, order);
    } else {
      this.map.addLayer(layer);
    }
  }
  changeLayerOrder(order: string | null = null) {
    const allLayers = this.map.getStyle().layers || [];
    for (let i = 0; i < this.layers.length; i++) {
      const lay = this.layers[i];
      const ll = allLayers.find((t: any) => t.id == lay.id);
      if (ll) {
        if (order) {
          this.map.moveLayer(ll.id, order);
        } else {
          this.map.moveLayer(ll.id);
        }
      }
    }
  }
  removeLayer() {
    this.layers.forEach((lay: any) => {
      let ll = this.map.getLayer(lay.id);
      if (ll) this.map.removeLayer(lay.id);
    });
  }
  setShow(show: boolean) {
    this.layers.forEach((lay: any) => {
      this.map.setLayoutProperty(
        lay.id,
        'visibility',
        show ? 'visible' : 'none',
      );
    });
    this.show = show;
  }
  setFilter(val: any[] | null = null) {
    this.layers.forEach((lay: any) => {
      this.map.setFilter(lay.id, val);
    });
  }
  getExtraAttr(): object {
    return {};
  }
}

export default MapLayer;
