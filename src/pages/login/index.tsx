import { IMAGE_PATH } from '@/config';
import { useState, useEffect } from 'react';
import LoginFormView from './loginFormView';

import styles from './styles.less';

const LoginView = (props: any) => {
  const [w, setW] = useState<number>(window.innerWidth);
  const [h, setH] = useState<number>(window.innerHeight);

  useEffect(() => {
    setW(window.innerWidth);
    setH(window.innerHeight);
  }, [window.innerWidth, window.innerHeight]);

  return (
    <div className={`${styles.login_index}`}>
      <img
        className={styles.bg_img}
        src={`${IMAGE_PATH}/login/bg_1.png`}
        alt=""
        width="100%"
      />

      <LoginFormView w={w} h={h} />
    </div>
  );
};
export default LoginView;
