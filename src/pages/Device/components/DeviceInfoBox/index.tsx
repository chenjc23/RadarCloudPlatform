import React, { useState } from 'react';
import { Badge, Button, Descriptions, Modal, Space, Tag, Radio } from 'antd';
import { CaretRightOutlined, PauseOutlined, PoweroffOutlined } from '@ant-design/icons';

import { myRadar } from '@/constant/radarSpecific';

type DeviceInfoBoxType = {
  status: 'online' | 'offline';
};

const DeviceInfoBox: React.FC<DeviceInfoBoxType> = (props) => {
  const { status } = props;
  const [showDetail, setShowDetail] = useState(false);

  let badge = <Badge status="default" text="Default" />;
  switch (status) {
    case 'online': {
      badge = <Badge status="success" text="在线" />;
      break;
    }
    case 'offline': {
      badge = <Badge status="error" text="离线" />;
      break;
    }
    default:
      break;
  }

  return (
    <>
      <Space size={'middle'}>
        <div>
          雷达：
          <Tag color="#2db7f5" onClick={() => setShowDetail(true)}>
            {myRadar.radarName}
          </Tag>
        </div>
        <div>状态：{badge}</div>
      </Space>

      <Space style={{ marginTop: '10px' }}>
        <Button type="primary" loading={false} icon={<PoweroffOutlined />}>
          重启
        </Button>
        <Button type="primary" icon={<CaretRightOutlined />}>
          开始
        </Button>
        {/*<Button type="primary" shape="circle" icon={<PauseOutlined />} />*/}
      </Space>
      <Modal open={showDetail} onCancel={() => setShowDetail(false)} footer={false} centered>
        <Descriptions title={'设备信息'} bordered size={'middle'} column={2}>
          <Descriptions.Item label={'名称'} span={1}>
            {myRadar.radarName}
          </Descriptions.Item>
          <Descriptions.Item label={'波段'} span={1}>
            {myRadar.waveband}
          </Descriptions.Item>
          <Descriptions.Item label={'状态'} span={3}>
            {badge}
          </Descriptions.Item>
          <Descriptions.Item label={'位置'} span={2}>
            经度：{myRadar.radarLocation.longitude.toFixed(5)}
            <br />
            纬度：{myRadar.radarLocation.latitude.toFixed(5)}
            <br />
            高度：{myRadar.radarLocation.height.toFixed(5)}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  );
};

export default DeviceInfoBox;
