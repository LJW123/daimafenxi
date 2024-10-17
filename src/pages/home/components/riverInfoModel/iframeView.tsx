import { observer } from "mobx-react-lite";
import styles from "./styles.less";
import { ExpandOutlined } from "@ant-design/icons";


const IframeView = observer((props: any) => {
  const rvInfo = props.rvInfo;

  const { data, title, url } = rvInfo;

  if (!data) return null;

  const handleFullScreen = () => {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  return (
    <div className={styles.iframeWrapper}>
      <div className={styles.fullscreen} onClick={handleFullScreen}>
        <ExpandOutlined />
      </div>
      <iframe
        className={styles.iframeContent}
        allow="fullscreen"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        src={url}
        scrolling="no"
      ></iframe>
    </div>
  );
});

export default IframeView;
