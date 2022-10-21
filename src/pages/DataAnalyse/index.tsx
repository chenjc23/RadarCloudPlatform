import React from "react";
import {
  PageContainer,
  ProCard,
  ProTable,
} from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { Row, Col, Radio, Switch, Select, DatePicker, Table } from "antd";
import type { RadioChangeEvent } from "antd";
import { useState, useEffect } from "react";
import { FieldTimeOutlined } from "@ant-design/icons";
import DataAnalyseCharts from './components/DataAnalyseCharts';

import type { GnotePoint, DistancePoint } from "@/models/supervisePoint";
import styles from './index.less';


// Cesium 相关配置
window.CESIUM_BASE_URL = '/static/cesium';
import * as Cesium from 'cesium';
import '@/../node_modules/cesium/Build/Cesium/Widgets/widgets.css'
Cesium.Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOGM1Y2MyYy0zNzhjLTQwN2QtYjkyOC0zZDYzN" +
  "jI5NTEyNTAiLCJpZCI6MTA5NzUwLCJpYXQiOjE2NjQ1MjM0NDZ9.gPRCXltXZgZxTZDdtToSvyxAdRfOjNQRvUdWHCyYXDQ";

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
  }
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
  }
];


const DataAnalyse: React.FC = () => {
  const [showDenoise, setShowDenoise] = useState(false);
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


  const setCesium = () => {
    const arc = new Cesium.ArcGisMapServerImageryProvider({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
    })

    const viewer = new Cesium.Viewer("cesiumContainer", {
      imageryProvider: arc,
      terrainProvider : new Cesium.CesiumTerrainProvider({
        url : Cesium.IonResource.fromAssetId(3956),
        requestVertexNormals : true
      }),
      baseLayerPicker: false,
      timeline: false,
      shouldAnimate: false,
      shadows: false,
      animation: false,
    });
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(117.3052368164, 49.4280128479, 5000),
      orientation: {
        heading: Cesium.Math.toRadians(0), // 左右角度
        pitch: Cesium.Math.toRadians(-90), // -90为正俯视
        roll: 0.0,
      }
    });
  };

  useEffect(() => {
    setCesium();
    document.title = '';
  }, []);


  return (
    <PageContainer header={{title: '', breadcrumb: {}}}>
      <Row>
        <Col span={5}>
          <ProCard split='horizontal'>
            <ProCard title='系统状态'>
              <Radio.Group value={1}>
                <div className={styles.radioGroup}>
                  <Radio value={1}>雷达</Radio>
                  <Radio value={2}>转台</Radio>
                  <Radio value={3}>通信</Radio>
                  <Radio value={4}>定位</Radio>
                </div>
              </Radio.Group>
            </ProCard>
            <ProCard title='雷达图像'>
              <div>
                <span>图像类型:</span>
                <Radio.Group
                  defaultValue={1}
                  optionType='button'
                  buttonStyle='solid'
                  onChange={handleImgTypeChange}
                >
                  <div className={styles.imgTypeBt}>
                    <Radio value={1} style={{padding: '0px 10px'}}>强度</Radio>
                    <Radio value={2} style={{padding: '0px 10px'}}>形变</Radio>
                  </div>
                </Radio.Group>
                { showDenoise && (
                  <Switch
                    className={styles.denoiseSwitch}
                    checkedChildren='降噪'
                    unCheckedChildren='降噪'
                    defaultChecked={false}
                  />
                ) }
              </div>
              <div style={{margin: '4px auto'}}>
                <span>当前模式:</span>
                <Switch
                  className={styles.modelSwitch}
                  onChange={(checked) => setShowTasks(checked)}
                  checkedChildren='历史图像'
                  unCheckedChildren='实时图像'
                  defaultChecked={false}
                />
              </div>
              { showTasks && (
                <div>
                  <span><FieldTimeOutlined/>任务批次:</span>
                  <Select
                    placeholder='选择一个批次'
                  />
                  <DatePicker.RangePicker
                    showTime={{format: 'HH:mm'}}
                    format='MM-DD HH:mm'
                  />
                </div>
              )}
            </ProCard>
            <ProCard title='监测点列表' extra={
              <Radio.Group
                defaultValue={1}
                onChange={handleSupervisedTypeChange}
              >
                <Radio value={1}>经纬</Radio>
                <Radio value={2}>距离</Radio>
              </Radio.Group>
            }>
              { superviseType === 'gnote' ? (
                <Table
                  columns={gnoteItems}
                  rowKey='id'
                  size='small'
                />
              ) : (
                <Table
                  columns={distanceItems}
                  rowKey='id'
                  size='small'
                />
              )}
            </ProCard>

          </ProCard>
        </Col>
        <Col span={19}>
          <div>
            <div id='cesiumContainer'/>
          </div>
          <p></p>
          <DataAnalyseCharts />
        </Col>
      </Row>

    </PageContainer>

  );
};

export default DataAnalyse;
