import React, { useState, useEffect, useRef, useCallback } from 'react';
import JsxParser from 'react-jsx-parser';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';

// import { Chart } from '@antv/g2';

// import styles from './styles.less';

const JsxParserView = (props: any) => {

    const jsxParserParams: any = props.jsxParserParams
    const codeString = jsxParserParams.codeString
    const data = jsxParserParams.dataResult
    const funs = jsxParserParams.funs
    const deferred_jsx = jsxParserParams.deferred_jsx
    const chartViewId = jsxParserParams.chartViewId


    // const [loading, setLoading] = useState<boolean>(true);


    // 延迟执行的
    const deferredExecution = () => {
        try {
            for (let index = 0; index < deferred_jsx.length; index++) {
                const jsx = deferred_jsx[index];
                // const js = `${jsx}`;
                const js = `function init(){${jsx}} init() `;
                eval(js);
            }
        } catch (error) {

        }

    }

    useEffect(() => {
        setTimeout(() => {
            deferredExecution()
        }, 100);

    }, [jsxParserParams])


    try {
        return (
            <JsxParser
                jsx={codeString}
                bindings={{
                    data: data,
                    ...funs
                }}
                components={{
                    antd,
                }}
                blacklistedAttrs={[]}
                renderInWrapper={false}
                onError={(error) => {
                    console.error('JsxParserError', error)
                }}
            />
        );
    } catch (error) {
        console.error('error', error);
        return null
    }
}
export default JsxParserView;
