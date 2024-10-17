import styles from './styles.less'
import { systemTitle } from '@/common'

const HeaderView = (props: any) => {
  return (
    <div className={styles.box}>
      <div className={styles.header}>
        <div className={styles.title}>{systemTitle}</div>
      </div>
    </div>
  )
}

export default HeaderView
