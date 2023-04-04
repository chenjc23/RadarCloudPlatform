import React from 'react';
import { useRef, useEffect, useState } from 'react';
import { Button, message, Modal } from 'antd';

import {
  CameraOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  RadiusBottomrightOutlined,
} from '@ant-design/icons';
import ColorBar from '@/components/ColorBar';

import { fetchSarImage } from '@/services/imgWise/fetchSarImage';
import { addMonitorArea } from '@/services/cesiumWise/addMonitorArea';

import { CesiumViewer } from './CesiumViewer';
import styles from './index.less';

const viewer = new CesiumViewer();

type CesiumWidgetPropsType = {
  imageType?: 'intensity' | 'defo';
  displayMode?: 'realtime' | 'history';
  batchId?: any;
};

type ConfirmModalPropsType = {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalPropsType> = (props: ConfirmModalPropsType) => {
  const { open, onOk, onCancel } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    setConfirmLoading(true);
    await onOk();
    // result ? message.success("监测点保存成功") : message.error("网络异常，保存失败");
    setConfirmLoading(false);
  };

  return (
    <Modal
      title="Confirm"
      open={open}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
    >
      <p>是否确定保存所选区域？</p>
    </Modal>
  );
};

const CesiumWidget: React.FC<CesiumWidgetPropsType> = (props: CesiumWidgetPropsType) => {
  const { imageType, displayMode, batchId } = props;
  const [showGlobe, setShowGlobe] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);

  const handleModalConfirm = async () => {
    const result = await addMonitorArea({ areaLoc: viewer.startPoint.concat(viewer.endPoint) });
    if (result) {
      viewer.confirmArea();
      message.success('监测点保存成功！');
    } else {
      viewer.cancelArea();
      message.error('网络异常，保存失败');
    }
    // 禁用cesium区域选择事件
    viewer.areaPickFlag = false;
    // 关闭确认对话框
    setShowModal(false);
  };

  const handleModalCancel = async () => {
    viewer.cancelArea();
    // 禁用cesium区域选择事件
    viewer.areaPickFlag = false;
    // 关闭确认对话框
    setShowModal(false);
  };

  // 确认区域选择的回调
  const handleAreaCheck = () => {
    setShowModal(true);
  };

  const handleAreaPickToggle = () => {
    viewer.areaPickFlag = true;
  };

  // 节点挂载后再实例化Cesium对象
  useEffect(() => {
    viewer.build();
    viewer.addPickAreaEvent(handleAreaCheck);
  }, []);

  // 外部状态改变更新贴图
  useEffect(() => {
    async function singleCoverImg() {
      // 向后端请求sar图像地址
      const imgUrl = await fetchSarImage({ imageType, batchId });
      // viewer贴图
      if (imgUrl) viewer.coverSarImage(imgUrl);
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
    viewer.toggleClipping(!showGlobe);
  };

  const handleSetDefaultView = () => {
    viewer.flytoOrigin();
  };

  return (
    <>
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
            <Button
              icon={<RadiusBottomrightOutlined />}
              style={{ zoom: '130%' }}
              onClick={handleAreaPickToggle}
            />
          </div>
          <ColorBar />
        </div>
        <div id="cesiumContainer" />
      </div>
      <ConfirmModal
        open={showModal}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}
      ></ConfirmModal>
    </>
  );
};

export default CesiumWidget;
