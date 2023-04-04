import React from 'react';
import { useState, useEffect } from 'react';
import { Line } from '@ant-design/charts';
import { Radio } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { getDefoData } from '@/services/cesiumWise/askForMeta';

const DataAnalyseCharts: React.FC = () => {
  const [data, setData] = useState([]);

  // const dataFetch = () => {
  //   fetch('https://gw.alipayobjects.com/os/bmw-prod/55424a73-7cb8-4f79-b60d-3ab627ac5698.json')
  //     .then((res) => res.json())
  //     .then((dataJson) => setData(dataJson))
  //     .catch((e) => {
  //       console.error('fetch data failed', e);
  //     });
  // };

  const dataFetch = async () => {
    const defo = await getDefoData();
    if (defo) {
      setData(defo as any);
    }
  };

  useEffect(() => {
    dataFetch();
  }, []);

  const config = {
    data,
    title: '形变曲线(mm)',
    xField: 'year',
    yField: 'value',
    seriesField: 'category',
    xAxis: {
      type: 'time',
    },
    yAxis: {
      label: {},
    },
  };

  return (
    <div>
      <ProCard title="形变曲线(mm)" bordered={true}>
        {/*<Radio.Group defaultValue={1}>*/}
        {/*  <Radio value={1}>形变曲线(mm)</Radio>*/}
        {/*  <Radio value={2}>速度曲线(mm/h)</Radio>*/}
        {/*  <Radio value={3}>加速度曲线(mm/h²)</Radio>*/}
        {/*</Radio.Group>*/}
        <Line height={300} {...config} />
      </ProCard>
      <ProCard title="速度曲线(mm/h)" bordered={true}>
        <Line height={300} {...config} />
      </ProCard>
      <ProCard title="加速度曲线(mm/h²)" bordered={true}>
        <Line height={300} {...config} />
      </ProCard>
    </div>
  );
};

export default DataAnalyseCharts;
