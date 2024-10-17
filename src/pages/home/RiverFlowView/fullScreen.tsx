import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'antd';

import RiverContent from './content';
import uiState from '@/mobx/ui';
import { ExpandOutlined, FullscreenExitOutlined } from '@ant-design/icons';


const FullScreenView = observer((props: any) => {

  const fullScreen = uiState.fullScreen
  const divId = `river_g6_view_2`

  if (!fullScreen) {
    return
  }


  return (

    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999999999,
      backgroundColor: 'rgba(19, 89, 151, 0.7)'

    }}>
      <RiverContent divId={divId} />
      <div style={{
        position: 'absolute',
        right: 10,
        top: 10,
        color: '#fff',
        cursor: 'pointer'
      }}
        onClick={() => {
          uiState.setFullScreen(false)
        }}>
        {fullScreen ? <FullscreenExitOutlined /> : <ExpandOutlined />}
      </div>

    </div>


  );
})
export default FullScreenView;
