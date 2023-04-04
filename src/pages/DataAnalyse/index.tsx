import React from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Row, Col, Radio, Switch, Select, DatePicker, Table, Button } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';
import { FieldTimeOutlined } from '@ant-design/icons';

import CesiumWidget from './CesiumWidget';

import DataAnalyseCharts from './components/DataAnalyseCharts';

//import type { GnotePoint, DistancePoint } from "@/models/supervisePoint";
import styles from './index.less';
import DeviceInfoBox from '@/pages/Device/components/DeviceInfoBox';

const gnoteItems = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '经度º',
    dataIndex: 'longitude',
  },
  {
    title: '纬度º',
    dataIndex: 'latitude',
  },
];

const distanceItems = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '距离/m',
    dataIndex: 'distance',
  },
  {
    title: '方位角º',
    dataIndex: 'angle',
  },
];

const DataAnalyse: React.FC = () => {
  const [showDenoise, setShowDenoise] = useState(false);

  const [imageType, setImageType] = useState<'intensity' | 'defo'>('defo');
  const [displayMode, setDisplayMode] = useState<'realtime' | 'history'>('realtime');
  const [batchId, setBatchId] = useState<any>(null);

  const [superviseType, setSuperviseType] = useState<'gnote' | 'distance'>('gnote');

  const handleImgTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === 2) {
      setShowDenoise(true);
      setImageType('defo');
    } else {
      setShowDenoise(false);
      setImageType('intensity');
    }
  };

  const handleSupervisedTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === 1) {
      setSuperviseType('gnote');
    } else {
      setSuperviseType('distance');
    }
  };

  const handleDisplayModeToggle = (checked: boolean) => {
    const currentMode = checked ? 'history' : 'realtime';
    setDisplayMode(currentMode);
  };

  return (
    <PageContainer header={{ title: '', breadcrumb: {} }} className={styles.container}>
      <Row>
        <Col span={5}>
          <ProCard split="horizontal">
            <ProCard title="系统操作">
              <DeviceInfoBox status={'online'} />
            </ProCard>
            <ProCard title="系统状态">
              <Radio.Group value={1}>
                <div className={styles.radioGroup}>
                  <Radio value={1}>雷达</Radio>
                  <Radio value={2}>转台</Radio>
                  <Radio value={3}>通信</Radio>
                  <Radio value={4}>定位</Radio>
                </div>
              </Radio.Group>
            </ProCard>
            <ProCard title="雷达图像">
              <div>
                <span>图像类型:</span>
                <Radio.Group
                  defaultValue={2}
                  optionType="button"
                  buttonStyle="solid"
                  onChange={handleImgTypeChange}
                >
                  <div className={styles.imgTypeBt}>
                    <Radio value={1} style={{ padding: '0px 10px' }}>
                      强度
                    </Radio>
                    <Radio value={2} style={{ padding: '0px 10px' }}>
                      形变
                    </Radio>
                  </div>
                </Radio.Group>
                {showDenoise && (
                  <Switch
                    className={styles.denoiseSwitch}
                    checkedChildren="降噪"
                    unCheckedChildren="降噪"
                    defaultChecked={false}
                  />
                )}
              </div>
              <div style={{ margin: '4px auto' }}>
                <span>当前模式:</span>
                <Switch
                  className={styles.modelSwitch}
                  onChange={handleDisplayModeToggle}
                  checkedChildren="历史图像"
                  unCheckedChildren="实时图像"
                  defaultChecked={false}
                />
              </div>
              {displayMode === 'history' && (
                <div>
                  <span>
                    <FieldTimeOutlined />
                    任务批次:
                  </span>
                  <Select placeholder="选择一个批次" />
                  <DatePicker.RangePicker
                    showTime={{ format: 'HH:mm' }}
                    format="MM-DD HH:mm"
                    onOk={(value: any) => {
                      console.log(new Date(value[0]).toLocaleString());
                    }}
                  />
                </div>
              )}
            </ProCard>
            <ProCard
              title="监测点列表"
              extra={
                <Radio.Group defaultValue={1} onChange={handleSupervisedTypeChange}>
                  <Radio value={1}>经纬</Radio>
                  <Radio value={2}>距离</Radio>
                </Radio.Group>
              }
            >
              {superviseType === 'gnote' ? (
                <Table columns={gnoteItems} rowKey="id" size="small" />
              ) : (
                <Table columns={distanceItems} rowKey="id" size="small" />
              )}
            </ProCard>
          </ProCard>
        </Col>
        <Col span={19}>
          <CesiumWidget imageType={imageType} displayMode={displayMode} batchId={batchId} />
          <DataAnalyseCharts />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DataAnalyse;
