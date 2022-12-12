import React, { useEffect, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { message, Button, Form, Input, Select, Row, Col, Card } from 'antd';
import { tcpConnect } from '@/services/deviceWide/tcpConnect';
import { setDeviceParams } from '@/services/deviceWide/setDeviceParams';
import { staticRead, readBinaryPerSecond } from '@/services/deviceWide/staticRead';
import type { JsonDataType } from '@/services/deviceWide/staticRead';

import { Line } from '@ant-design/charts';

const Temp: React.FC = () => {
  const initRadarParams = {
    startFreq: 8500,
    stopFreq: 12000,
    channelGain: 0,
    pulseWidth: 2,
    prf: 100,
    sampleFreq: 2,
    channelDelay: 100,
    sampleTime: undefined,
  };

  // 控制采样点数相关的状态变量
  const [refParams, setRefParams] = useState({ pulseWidth: 2000, sampleFreq: 2 });
  const [paramsInRadar, setParamsInRadar] = useState(initRadarParams);
  // 回波数据状态变量
  const [data, setData] = useState<JsonDataType[]>([]);
  const [readSign, setReadSign] = useState<{ offset: number; readCount: number }>({
    offset: 0,
    readCount: 0,
  });

  useEffect(() => {
    const { offset, readCount } = readSign;
    if (readCount > 0) {
      setTimeout(async () => {
        const result = await readBinaryPerSecond({ ...paramsInRadar, offset });
        if (result === false) {
          message.error('雷达dataBuf已读取完全');
          setReadSign({ readCount: 0, offset: 0 });
        } else {
          setData(result.data);
          setReadSign({ offset: offset + 1, readCount: readCount - 1 });
        }
      }, 1500);
    }
  }, [readSign]);

  // 采样点数跟随脉宽与采样频率改变
  const onPulseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefParams({ ...refParams, pulseWidth: Math.round(Number(e.target.value) * 1000) });
  };
  const onFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefParams({ ...refParams, sampleFreq: Number(e.target.value) });
  };

  // TCP连接请求
  const onTcpConnect = async (params: any) => {
    const result = await tcpConnect(params);
    if (result) {
      message.success('网络已连接，请设置雷达参数');
    } else {
      message.error('雷达未正常工作');
    }
  };

  // 设置雷达参数请求
  const onSetParams = async (params: any) => {
    await setParamsInRadar(params);
    const result = await setDeviceParams(params);
    if (result) {
      message.success('参数设置完毕！');
    } else {
      message.error('请先连接雷达网络！');
    }
  };

  // 静止采样工作指令
  const onStaticRead = async (params: any) => {
    const { sampleTime } = params;
    const newParams = { ...paramsInRadar, sampleTime };
    const result = await staticRead(newParams);
    if (result === true) {
      message.success('已成功发送指令，数据正在采集！');
      setReadSign({ offset: 0, readCount: Math.floor(Number(sampleTime)) });
      setParamsInRadar(newParams);
    } else if (result === false) {
      message.error('请先连接雷达网络！');
    } else {
      message.warn(result.message);
    }
  };

  const config = {
    data,
    title: 'RangeComp',
    xField: 'x',
    yField: 'val',
  };

  return (
    <PageContainer>
      <Row>
        <ProCard>
          <Line height={300} {...config} />
        </ProCard>
      </Row>
      <Row>
        <Col span={3}>
          <ProCard title="雷达连接">
            <Form name="radarConnection" initialValues={{ waveBand: 2 }} onFinish={onTcpConnect}>
              <Form.Item name="waveBand" label="波段选择">
                <Select
                  // defaultValue={2}
                  options={[
                    {
                      value: 1,
                      label: 'X',
                    },
                    {
                      value: 2,
                      label: 'X_ZYNQ',
                    },
                    {
                      value: 3,
                      label: 'ka',
                    },
                    {
                      value: 4,
                      label: 'W',
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 6 }}>
                <Button type="primary" htmlType="submit">
                  网络连接
                </Button>
              </Form.Item>
            </Form>
          </ProCard>
        </Col>
        <Col span={10.5}>
          <ProCard title="雷达参数设置">
            <Form
              name="paramSetting"
              labelCol={{ span: 6 }}
              layout="horizontal"
              initialValues={initRadarParams}
              onFinish={onSetParams}
            >
              <Row gutter={12}>
                <Col>
                  <Form.Item name="startFreq" label="起始频率" help=">=8300MHz">
                    <Input />
                  </Form.Item>
                  <Form.Item name="stopFreq" label="结束频率" help="<=12500MHz">
                    <Input />
                  </Form.Item>
                  <Form.Item name="channelGain" label="通道增益" help="dB(0~80)">
                    <Input />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item name="pulseWidth" label="脉冲宽度" help="ms(0.1~8)">
                    <Input onChange={onPulseChange} />
                  </Form.Item>
                  <Form.Item name="prf" label="PRF" help="Hz(1~200)">
                    <Input />
                  </Form.Item>
                  <Form.Item name="sampleFreq" label="采样频率" help="MHz(1~10)">
                    <Input onChange={onFreqChange} />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item name="sampleNumber" label="采样点数" help="脉宽×采样">
                    <Input
                      type="text"
                      placeholder={Math.floor(
                        refParams.pulseWidth * refParams.sampleFreq,
                      ).toString()}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item name="channelDelay" label="通道延迟" help="采样点">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Form.Item wrapperCol={{ offset: 18 }}>
                  <Button type="primary" htmlType="submit">
                    参数设置
                  </Button>
                </Form.Item>
              </Row>
            </Form>
          </ProCard>
        </Col>
        <Col span={3}>
          <ProCard title="雷达静止采集数据">
            <Form name="staticRead" initialValues={{ sampleTime: 5 }} onFinish={onStaticRead}>
              <Form.Item name="sampleTime" label="采集时间">
                <Input addonAfter="秒" />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 6 }}>
                <Button type="primary" htmlType="submit">
                  静止采集
                </Button>
              </Form.Item>
            </Form>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Temp;
