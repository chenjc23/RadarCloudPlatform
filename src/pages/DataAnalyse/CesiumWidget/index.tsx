import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { Button } from 'antd';

import { CameraOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@ant-design/icons';
import ColorBar from '@/components/ColorBar';

import { fetchSarImage } from '@/services/imgWide/fetchSarImage';

import { CesiumViewer } from './CesiumViewer';
import styles from './index.less';

type CesiumWidgetPropsType = {
  imageType?: 'intensity' | 'defo';
  displayMode?: 'realtime' | 'history';
  batchId?: any;
};

const CesiumWidget: React.FC<CesiumWidgetPropsType> = (props: CesiumWidgetPropsType) => {
  const { imageType, displayMode, batchId } = props;
  const viewer = useRef<CesiumViewer>();
  const [showGlobe, setShowGlobe] = useState<boolean>(false);
  // 形变阈值状态变量
  //const [defoThresh, setDefoThresh] = useState();

  // 节点挂载后再实例化Cesium对象
  useEffect(() => {
    viewer.current = new CesiumViewer();
  }, []);

  // 外部状态改变更新贴图
  useEffect(() => {
    async function singleCoverImg() {
      // 向后端请求sar图像地址
      const imgUrl = await fetchSarImage({ imageType, batchId });
      // viewer贴图
      if (imgUrl) viewer.current?.coverSarImage(imgUrl);
    }
    // 不管何种显示模式，状态切换首先更新一次图像
    singleCoverImg();
    // 若在实时模式则设置间隔刷新
    let intervalId: any = null;
    if (displayMode === 'realtime') {
      intervalId = setInterval(singleCoverImg, 60000);
    }
    // 组件卸载后清除interval
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [displayMode, imageType, batchId]);

  const handleFullViewToggle = () => {
    setShowGlobe(!showGlobe);
    viewer.current?.toggleClipping(!showGlobe);
  };

  const handleSetDefaultView = () => {
    viewer.current?.flytoOrigin();
  };

  return (
    <div className={styles.cesium}>
      <div className={styles.topLayer}>
        <div className={'buttonGroup'}>
          <Button
            icon={showGlobe ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
            style={{ zoom: '130%' }}
            onClick={handleFullViewToggle}
          />
          <Button
            icon={<CameraOutlined />}
            style={{ zoom: '130%' }}
            onClick={handleSetDefaultView}
          />
        </div>
        <ColorBar />
      </div>
      <div id="cesiumContainer" />
    </div>
  );
};

export default CesiumWidget;
