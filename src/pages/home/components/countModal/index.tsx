import { observer } from 'mobx-react-lite';
import uiState from '@/mobx/ui';
import { Modal } from 'antd';
import styles from "./styles.less";
import { IMAGE_PATH } from '@/config';
import WorkFlowView from './workFlowView';
import workFlowSpace from './workFlowSpace';

const CountModal = observer((props: any) => {
  const showCountModal = uiState.showCountModal;

  const handleCancel = () => {
    uiState.setShowCountModal(null)
    workFlowSpace.clearData();
  }

  return (
    <Modal
      title={<div className={styles.title}><img src={`${IMAGE_PATH}/count_modal_title_icon.png`} alt="" />{showCountModal?.title || ""}</div>}
      open={showCountModal}
      onCancel={handleCancel}
      wrapClassName={styles.count_modal}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
    >
      <WorkFlowView closeModal={handleCancel} workFlowId={showCountModal?.workFlowId || null} />
    </Modal>
  );
})
export default CountModal;
