import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Graph, treeToGraphData, CubicHorizontal, ExtensionCategory, register, subStyleProps, NodeEvent } from '@antv/g6';
import uiState from '@/mobx/ui';



class AntLine extends CubicHorizontal {
    onCreate() {
        const shape = this.shapeMap.key;
        shape.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
            duration: 500,
            iterations: Infinity,
        });
    }
}

register(ExtensionCategory.EDGE, 'bbbb', AntLine);

let graphObj: any = {}
const G6View = (props: any) => {
    const resData = props.resData
    const fullScreen = props.fullScreen

    const divId = props.divId

    useEffect(() => {
        initG6()
    }, []);
    useEffect(() => {
        graphObj[divId]?.setData(treeToGraphData(resData))
        graphObj[divId]?.render();
    }, [resData]);

    useEffect(() => {
        setTimeout(() => {
            let doc = document.getElementById(divId)
            if (doc) {
                let width = doc.clientWidth
                let height = doc.clientHeight
                graphObj[divId]?.setSize(width, height)
                graphObj[divId]?.render();
            }
        }, 10);
    }, [fullScreen])

    const initG6 = useCallback(() => {

        graphObj[divId] = new Graph({
            container: divId,
            // renderer: () => new Renderer(),
            autoResize: true,
            autoFit: 'view',
            data: treeToGraphData(resData),
            behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'collapse-expand'],
            node: {
                style: {
                    labelText: (data: any) => data.children?.length > 0 ? data.label + `(${data.children?.length})` : data.label,
                    labelPlacement: (data) => data.isLeaf ? 'right' : 'top',
                    labelFill: "#fff",
                    labelMaxWidth: 300,
                    size: 12,
                    lineWidth: 1,
                    fill: '#fff',
                    ports: [
                        {
                            placement: 'right',
                        },
                        {
                            placement: 'left',
                        },
                    ],
                },
                animation: {
                    enter: false,
                },
            },
            edge: {
                type: 'bbbb',
                style: {
                    lineDash: [10, 10],
                },
                //     type: 'cubic-horizontal',
                //     animation: {
                //         enter: false,
                //     },
            },
            layout: {
                type: 'compact-box',
                direction: 'LR',
                getId: function getId(d: any) {
                    return d.id;
                },
                getHeight: function getHeight() {
                    return 16;
                },
                getVGap: function getVGap() {
                    return 10;
                },
                getHGap: function getHGap() {
                    return 100;
                },
                getWidth: function getWidth(d: any) {
                    return d.id.length + 20;
                },
            },
        });
        graphObj[divId].on(NodeEvent.CLICK, (event: any) => {
            let id = event.target.id
            let node: any = graphObj[divId]?.getNodeData(id)
            uiState.setShowRiverName(node.label)
        });
        graphObj[divId].render();
    }, [])


    return <div id={divId} style={{ width: '100%', height: '100%' }}></div>
};
export default G6View;
