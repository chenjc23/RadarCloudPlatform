import React, { useEffect, useRef } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';

import {
  Row,
  Col,
  Radio,
  Switch,
  Select,
  DatePicker,
  Table,
  Button,
  Tag,
  Space,
  Input,
  InputRef,
  message,
} from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useState } from 'react';
import { FieldTimeOutlined } from '@ant-design/icons';

import CesiumWidget from './CesiumWidget';

import DataAnalyseCharts from './components/DataAnalyseCharts';

//import type { GnotePoint, DistancePoint } from "@/models/supervisePoint";
import styles from './index.less';
import DeviceInfoBox from '@/pages/Device/components/DeviceInfoBox';
import { ColumnsType } from 'antd/es/table';
import { getMonitorArea } from '@/services/cesiumWise/MonitorArea';
import { myRadar } from '@/constant/radarSpecific';
import { addBatch, getBatch } from '@/services/monitorWise/batchWise';
import { text } from 'express';

export interface TgType {
  tgId: string;
  batchId: string;
  tgName: string;
  tgScale: number[];
  measurements?: any[];
}

export interface BatchType {
  batchId?: string;
  batchName?: string;
  tgPoints?: TgType[];
  create_time?: Date;
  last_modified?: Date;
}

export interface TgPointType {
  tgId: string;
  tgName: string;
  lng: number;
  lat: number;
}

const distanceItems = [
  {
    title: '名称',
    dataIndex: 'tgName',
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
  const [imageType, setImageType] = useState<'intensity' | 'defo'>('defo');
  const [displayMode, setDisplayMode] = useState<'realtime' | 'history'>('realtime');

  const [currentBatch, setCurrentBatch] = useState<BatchType>();
  const [currentTgId, setCurrentTgId] = useState<string>();

  const updateBatchInfo = async (params?: any) => {
    const batch = await getBatch(params);
    if (!batch) return;
    // 判断batch是否有更新，无更新则不修改state（此处涉及嵌套对象的浅比较，浅比较地址不同，则认为state不同，导致一直刷新）
    if (
      !currentBatch ||
      batch.batchId !== currentBatch.batchId ||
      batch.last_modified !== currentBatch.last_modified
    ) {
      setCurrentBatch(batch as BatchType);
    }
  };

  // 监测点添加的事件处理
  const handleTgAdded = async () => {
    await updateBatchInfo({ flag: 'default' });
  };

  // 页面组件部分

  // 雷达图像
  const RadarImgCard: React.FC = () => {
    const batchInputRef = useRef<InputRef>(null);

    const [showDenoise, setShowDenoise] = useState(false);

    const [confirming, setConfirming] = useState<boolean>(false);
    const [batchOptions, setBatchOptions] = useState([]);

    // 图像类型切换事件
    const handleImgTypeChange = (e: RadioChangeEvent) => {
      if (e.target.value === 2) {
        setShowDenoise(true);
        setImageType('defo');
      } else {
        setShowDenoise(false);
        setImageType('intensity');
      }
    };

    // 图像模式的切换事件处理
    const handleDisplayModeToggle = async (checked: boolean) => {
      const currentMode = checked ? 'history' : 'realtime';
      setDisplayMode(currentMode);
    };

    // 确认添加批次事件处理
    const handleBatchConfirm = async () => {
      const batchName = batchInputRef.current?.input?.value;
      if (!batchName) {
        message.warning('请先输入批次名称！');
        return;
      }
      setConfirming(true);
      const result = await addBatch({ batchName });
      if (result) {
        await updateBatchInfo({ flag: 'default' });
        message.success(`新建批次：${batchName}`);
      } else {
        message.error('新建批次发生错误！');
      }
      setConfirming(false);
    };

    // 批次选择处理
    const handleBatchSelect = async (value: any) => {
      await updateBatchInfo({ flag: 'specific', batchId: value });
    };

    // 页面渲染更新当前batch
    useEffect(() => {
      if (displayMode === 'realtime') {
        updateBatchInfo({ flag: 'default' });
      }
      // 更新batch选项
      const asyncGetBatch = async () => {
        if (displayMode === 'history') {
          const batches = await getBatch({ flag: 'all' });
          if (batches) {
            setBatchOptions(
              batches.map((batch: BatchType) => {
                // 构建batch的选项
                const create_time = new Date(batch.create_time as Date);
                const label = batch.batchName + ' -- ' + create_time.toLocaleString();
                return {
                  label,
                  value: batch.batchId,
                };
              }),
            );
          }
        }
      };
      asyncGetBatch();
    }, []);

    return (
      <ProCard title="雷达图像">
        <div className={styles.imgBoxWrap}>
          <div>
            <span>图像类型：</span>
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
          <div>
            <span>当前模式：</span>
            <Switch
              className={styles.modelSwitch}
              onChange={handleDisplayModeToggle}
              checkedChildren="历史图像"
              unCheckedChildren="实时图像"
              checked={displayMode === 'history'}
            />
          </div>
          {displayMode === 'history' ? (
            <div>
              <span>
                <FieldTimeOutlined />
                任务批次：
              </span>
              <Select
                style={{ width: '230px' }}
                placeholder="选择一个批次"
                options={batchOptions}
                onSelect={handleBatchSelect}
                value={currentBatch?.batchId}
              />
              <DatePicker.RangePicker
                showTime={{ format: 'HH:mm' }}
                format="MM-DD HH:mm"
                onOk={(value: any) => {
                  console.log(new Date(value[0]).toLocaleString());
                }}
              />
            </div>
          ) : (
            <>
              <div>
                <span>当前批次：</span>
                {currentBatch ? (
                  <Tag color="#2db7f5">{currentBatch.batchName}</Tag>
                ) : (
                  <Tag color="#2db7f5">无</Tag>
                )}
              </div>
              <div>
                <span style={{ color: '#0099CC' }}>新建批次：</span>
                <Space>
                  <Input placeholder="输入批次名称" ref={batchInputRef} />
                  <Button type="primary" onClick={handleBatchConfirm} loading={confirming}>
                    Submit
                  </Button>
                </Space>
              </div>
            </>
          )}
        </div>
      </ProCard>
    );
  };

  // 监测点列表
  const TgTableCard: React.FC = (props) => {
    const [superviseType, setSuperviseType] = useState<'gnote' | 'distance'>('gnote');

    // 解析batch数据获取监测点列表数据
    let tgPointsData: any = null;
    if (currentBatch) {
      const tgPoints = currentBatch.tgPoints;
      tgPointsData = tgPoints!.map((tg) => {
        const {
          tgId,
          tgName,
          tgScale: [rng_1, lat_1, rng_2, lat_2],
        } = tg;
        const lng = (rng_1 + rng_2) / 2;
        const lat = (lat_1 + lat_2) / 2;
        return {
          tgId,
          tgName,
          lng: lng.toFixed(5),
          lat: lat.toFixed(5),
        };
      });
    }

    const handleSupervisedTypeChange = (e: RadioChangeEvent) => {
      if (e.target.value === 1) {
        setSuperviseType('gnote');
      } else {
        setSuperviseType('distance');
      }
    };

    const handleDeleteTg = (tgId: string) => {};

    const gnoteItems: ColumnsType<TgPointType> = [
      {
        title: '名称',
        dataIndex: 'tgName',
        key: 'tgName',
        render: (text, record) => {
          return (
            <a
              onClick={() => {
                setCurrentTgId(record.tgId);
              }}
            >
              {text}
            </a>
          );
        },
      },
      {
        title: '经度º',
        dataIndex: 'lng',
        key: 'lng',
      },
      {
        title: '纬度º',
        dataIndex: 'lat',
        key: 'lat',
      },
      {
        title: '操作',
        key: 'operation',
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                handleDeleteTg(record.tgId);
              }}
            >
              删除
            </a>
          );
        },
      },
    ];

    return (
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
          <Table columns={gnoteItems} rowKey="tgId" size="small" dataSource={tgPointsData} />
        ) : (
          <Table columns={distanceItems} rowKey="tgId" size="small" />
        )}
      </ProCard>
    );
  };

  // 左侧操作栏
  const OperateArea: React.FC = () => {
    return (
      <ProCard split="horizontal">
        <ProCard title="系统操作">
          <DeviceInfoBox status={'online'} />
        </ProCard>
        <RadarImgCard />
        <TgTableCard />
      </ProCard>
    );
  };

  return (
    <div className={styles.container}>
      <Row>
        <Col span={5}>
          <OperateArea />
        </Col>
        <Col span={19}>
          <CesiumWidget
            imageType={imageType}
            displayMode={displayMode}
            batchId={currentBatch?.batchId}
            onAddTgSuccess={handleTgAdded}
          />
          <DataAnalyseCharts tgId={currentTgId} />
        </Col>
      </Row>
    </div>
  );
};

export default DataAnalyse;
