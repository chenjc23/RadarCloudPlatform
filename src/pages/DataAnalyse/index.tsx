import React from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Row, Col, Radio, Switch, Select, DatePicker, Table, Button } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';
import { FieldTimeOutlined, PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

import MapArea from './components/MapArea';
import DataAnalyseCharts from './components/DataAnalyseCharts';

//import type { GnotePoint, DistancePoint } from "@/models/supervisePoint";
import styles from './index.less';

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
  const [showGlobe, setShowGlobe] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [superviseType, setSuperviseType] = useState<'gnote' | 'distance'>('gnote');

  const handleImgTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === 2) {
      setShowDenoise(true);
    } else {
      setShowDenoise(false);
    }
  };

  const handleSupervisedTypeChange = (e: RadioChangeEvent) => {
    if (e.target.value === 1) {
      setSuperviseType('gnote');
    } else {
      setSuperviseType('distance');
    }
  };

  return (
    <PageContainer header={{ title: '', breadcrumb: {} }}>
      <Row>
        <Col span={5}>
          <ProCard split="horizontal">
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
                  defaultValue={1}
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
                  onChange={(checked) => setShowTasks(checked)}
                  checkedChildren="历史图像"
                  unCheckedChildren="实时图像"
                  defaultChecked={false}
                />
              </div>
              {showTasks && (
                <div>
                  <span>
                    <FieldTimeOutlined />
                    任务批次:
                  </span>
                  <Select placeholder="选择一个批次" />
                  <DatePicker.RangePicker showTime={{ format: 'HH:mm' }} format="MM-DD HH:mm" />
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
          <div className={styles.cesium}>
            <Button
              className={styles.zoomButton}
              icon={showGlobe ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
              onClick={() => {
                setShowGlobe(!showGlobe);
              }}
            />
            <MapArea clipEnable={!showGlobe} />
          </div>
          <DataAnalyseCharts />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default DataAnalyse;
