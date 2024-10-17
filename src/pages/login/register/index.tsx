import { useState, useEffect } from 'react';
import { IMAGE_PATH } from '@/config';
import RegisterFormView from './registerFormView';

import styles from './styles.less';

const RegisterIndexView = () => {
  const [w, setW] = useState<number>(window.innerWidth);
  const [h, setH] = useState<number>(window.innerHeight);

  useEffect(() => {
    setW(window.innerWidth);
    setH(window.innerHeight);
  }, [window.innerWidth, window.innerHeight]);

  return (
    <div className={`${styles.register_index}`}>
      <img
        className={styles.bg_img}
        src={`${IMAGE_PATH}/login/bg_1.png`}
        alt=""
      />
      <img
        className={styles.bg_ic}
        src={`${IMAGE_PATH}/login/bg_2.png`}
        alt=""
      />
      <RegisterFormView w={w} h={h} />
    </div>
  );
};
export default RegisterIndexView;
