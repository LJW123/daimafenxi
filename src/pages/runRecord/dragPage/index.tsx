import React, { useState, useEffect,  useCallback } from 'react';
import styles from './styles.less';
import structure from './structure';

const DragPage = (props: any) => {
  const LeftView = props.leftView
  const RightView = props.rightView

  useEffect(() => {
    // 浏览器窗口发生改变时，重置窗口大小
    window.addEventListener('resize', () => {
      localStorage.removeItem('dragPageStyles');
    })
  }, [])

  // 从浏览器localStorage中获取dom的宽高
  const getDomStyle = (domId: any) => {
    return structure.initPosition(domId)
  };

  return (
    <div className={styles.drag_page}>
      <div className={styles.left_view} id='of_view_1'
        style={{
          width: `${getDomStyle('of_view_1').width}`,
        }}
      >
        <div className={styles.left_content}>{LeftView}</div>
      </div>

      {RightView &&
        <>
          <div className={styles.c_line}>
            <div
              className={styles.axis}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                structure.onMouseDown(e, 'w', 'of_view_1', 'of_view_2')
              }}
            ></div>
          </div>
          <div className={styles.right_view} id='of_view_2'
            style={{
              width: `${getDomStyle('of_view_2').width}`,
            }}
          >
            <div className={styles.right_content}>{RightView}</div>
          </div>
        </>
      }

    </div>
  );
};
export default DragPage;
