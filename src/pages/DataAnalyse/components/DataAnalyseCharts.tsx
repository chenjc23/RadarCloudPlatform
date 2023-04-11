import React from 'react';
import { useState, useEffect } from 'react';
import { Line } from '@ant-design/charts';
import { Radio } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { getTgData } from '@/services/monitorWise/targetWise';

const DataAnalyseCharts: React.FC<{ tgId?: string }> = (props: { tgId?: string }) => {
  const [data, setData] = useState([]);

  const dataFetch = async () => {
    if (!props.tgId) return;
    const tgItem: any = await getTgData({ tgId: props.tgId });
    if (tgItem) {
      // 格式化上传的数据的时间
      const formatData = tgItem.measurements.map((doc: any) => {
        const upload_time = doc.upload_time.toLocaleString();
        return {
          defo: doc.defo,
          upload_time,
        };
      });
      setData(formatData);
    }
  };

  useEffect(() => {
    dataFetch();
  }, []);

  const config = {
    data,
    title: '形变曲线(mm)',
    xField: 'upload_time',
    yField: 'defo',
    xAxis: {
      type: 'time',
    },
    yAxis: {
      label: {},
    },
    slider: {
      start: 0.1,
      end: 0.5,
    },
  };

  return (
    <div>
      <ProCard title="形变曲线(mm)" bordered={true}>
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
