

const dataMe = (url: string) => {
    fetch(url)
        .then((r) => r.json())
        .then((res: any) => { 

        });
}

const dataToGeojson = (datas: Array<any>) => {
    let feautres = []
    for (let i = 0; i < datas.length; i++) {

        let data = datas[i];

        let feature = {
            type: 'Feature',
            properties: data,
            geometry: {
                type: 'Point',
                coordinates: [Number(data.longitude), Number(data.latitude)]
            }
        }
        feautres.push(feature);
    }

    let featureCollection = {
        type: 'FeatureCollection',
        features: feautres
    }

    return featureCollection;
}

export {
    dataToGeojson
}