import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Modal } from 'antd';

import RiverContent from './content';
import uiState from '@/mobx/ui';
import { ExpandOutlined, FullscreenExitOutlined } from '@ant-design/icons';


const ModalViewRiver = observer((props: any) => {
  // const rName=props.rName
  // const rName = `塔里木河`
  // const rName = `哈能威代里牙河`

  const rName = uiState.showRiverName
  const fullScreen = uiState.fullScreen

  const divId = `river_g6_view`

  const handleOk = () => {

  };

  const handleCancel = () => {
    uiState.setShowRiverName('')
  };

  const [wh, setwh] = useState<any>({ w: 0, h: 0 });


  useEffect(() => {
    if (fullScreen) {
      let doc = document.getElementById('root')
      if (doc) {
        let width = doc.clientWidth
        let height = doc.clientHeight
        setwh({ w: width, h: height })
      }
    }
  }, [fullScreen])

  return (
    <Modal
      title={rName}
      open={rName ? true : false}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
      width={fullScreen ? wh.w : 1400}
      style={fullScreen ? { top: 10, paddingBottom: 0 } : {}}
    >

      <div style={{
        position: 'relative',
        // height: '600px',
        height: fullScreen ? wh.h - 90 : 600,
        // opacity: fullScreen ? 0 : 1
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
            uiState.setFullScreen(!fullScreen)
          }}>
          {/* <ExpandOutlined /> */}
          {fullScreen ? <FullscreenExitOutlined /> : <ExpandOutlined />}
        </div>
      </div>

    </Modal>
  );
})
export default ModalViewRiver;
