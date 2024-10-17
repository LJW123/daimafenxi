import { useState, useEffect } from 'react'
import { useParams, Outlet } from 'umi'
import zhCN from 'antd/lib/locale/zh_CN'
import { observer } from 'mobx-react-lite'

import { ConfigProvider } from 'antd'
import userSpace from '@/mobx/userSpace'
import groupSpace from '@/mobx/groupSpace'
import Schema from '@/configs/pageConfig/schema'
import AttributeConfig from '@/configs/attributeConfig/attributeConfig'
import QueryConfig from '@/configs/queryConfig/queryConfig'

// import HeaderView from '@/pages/home/components/header/view1';
import HeaderView from '@/pages/home/header/view2'

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

import styles from './styles.less'
import { PUBLIC_PATH } from '@/config'
import IdsGather from '@/configs/idsGather'

const IndexHomeView = observer((props: any) => {
  const routerParams = useParams()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    userSpace.verifyToken()
  }, [])

  useEffect(() => {
    if (userSpace.userData) {
      const urlGroupId = routerParams?.gid || null
      groupSpace.getGroupFun(urlGroupId)

      IdsGather.getInstance().LoadConfig()
      AttributeConfig.getInstance().LoadConfig()
      QueryConfig.getInstance().LoadConfig()
      Schema.getInstance().LoadConfig()

      setTimeout(() => {
        setLoading(false)
      }, 100)
    }
  }, [userSpace.userData])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          // Seed Token，影响范围大
          fontFamily: 'Alibaba',
        },
      }}
    >
      {groupSpace.groupData && !loading ? (
        <div className={`${styles.index_layout}`}>
          <HeaderView />
          <Outlet />
        </div>
      ) : (
        <div></div>
      )}
    </ConfigProvider>
  )
})
export default IndexHomeView
