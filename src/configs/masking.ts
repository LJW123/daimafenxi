import { getQMap } from "@/plugin/qSpace/core";
import * as turf from '@turf/turf';


// 蒙版
class Masking {

    private static instance: Masking;
    public static getInstance() {
        if (!Masking.instance) {
            Masking.instance = new Masking();
        }
        return Masking.instance;
    }

    id: string = 'masking_layer';
    id_shadow: string = 'masking_layer_shadow';
    constructor() {
        this.setSource()
        this.addLayer()
    }


    setSource(geometry: any = null) {
 
        let coods: any[] = []
        const map = getQMap()?.getMap()
        if (geometry) {
            const type = geometry.type
            let coordinates = []
            if (type == 'Polygon') {
                coordinates = geometry.coordinates
            } else if (type == 'MultiPolygon') {
                coordinates = geometry.coordinates.map((item: any) => item.length > 0 ? item[0] : [])
            }

            coods = [
                [
                    [
                        [-180, 90],
                        [180, 90],
                        [180, -90],
                        [-180, -90],
                        [-180, 90]
                    ],
                    ...coordinates
                ],
            ]
        } else {
        
        }


        const multiPoly = turf.multiPolygon(coods);

        if (map.getSource(this.id)) {
            map.getSource(this.id).setData(multiPoly);
        } else {
            map.addSource(this.id, {
                type: 'geojson',
                data: multiPoly
            });
        }

    }

    addLayer() {
        const map = getQMap()?.getMap()

        const layer = {
            "id": this.id,
            "type": "fill",
            "source": this.id,
            "minzoom": 1,
            "maxzoom": 24,
            "paint": {
                "fill-opacity": 0.8,
                "fill-color": "#223442"
            }
        }
        let ll = map.getLayer(this.id);
        if (ll) {
            map.removeLayer(this.id);
        }
        map.addLayer(layer, '蒙版');


    }


}

export default Masking