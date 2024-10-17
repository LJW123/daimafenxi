import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Modal } from "antd";

import uiState from "@/mobx/ui";

import RiverContent from "./content";
import IframeView from "./iframeView";
import { PUBLIC_PATH } from "@/config";
import styles from "./styles.less";

const RiverInfoModel = observer((props: any) => {
  const rvInfo = uiState.rvInfo;
  const type = rvInfo?.type || "";

  const handleCancel = () => {
    uiState.setRvInfo(null);
  };

  return (
    <Modal
      title={<div style={{ opacity: 0 }}>详情</div>}
      open={rvInfo ? true : false}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
      width={1400}
      wrapClassName={styles.iframe_model}
      style={{
        backgroundImage: `url(${PUBLIC_PATH}images/iframeBg.png)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {type == "iframe" && <IframeView rvInfo={rvInfo} />}
      {type == "view" && <RiverContent rvInfo={rvInfo} />}
    </Modal>
  );
});
export default RiverInfoModel;
