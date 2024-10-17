import React, { useState, useEffect, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import QueryDataViewChild from './view2';

const QueryDataView = observer((props: any) => {
  useEffect(() => { }, []);
  return <QueryDataViewChild />;
})
export default QueryDataView;
