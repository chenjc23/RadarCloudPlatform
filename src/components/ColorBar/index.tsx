import React from 'react';
import { Image, InputNumber, Popover, Button, Space, Row, Col, message } from 'antd';

import { EditOutlined } from '@ant-design/icons';
import { useState } from 'react';
import styles from './index.less';

type ColorBarProps = {
  setMinMax?: () => void;
};

type NumBarProps = {
  scale: {
    minNum: number;
    maxNum: number;
  };
};

const NumberBar: React.FC<NumBarProps> = (props) => {
  const {
    scale: { minNum, maxNum },
  } = props;
  const arr = new Array(9);
  for (let i = 0; i < arr.length; ++i) {
    arr[i] = minNum + ((i + 1) * (maxNum - minNum)) / (arr.length + 1);
    arr[i] = arr[i].toPrecision(3);
  }
  arr.reverse();
  return (
    <div className={styles.numberBar}>
      {arr.map((val) => (
        <div key={val}>{val}</div>
      ))}
    </div>
  );
};

const ColorBar: React.FC<ColorBarProps> = (props) => {
  const { setMinMax } = props;
  const [scale, setScale] = useState({ minNum: -10, maxNum: 10 });

  const onMinNumChange = (val: number) => {
    if (Math.round(val) !== val) {
      message.error('上下限输入需为整数！');
      return;
    }
    if (val >= scale.maxNum) {
      message.error('输入下限需小于上限！');
      return;
    }
    setScale({ ...scale, minNum: val! });
  };

  const onMaxNumChange = (val: number) => {
    if (Math.round(val) !== val) {
      message.error('上下限输入需为整数！');
      return;
    }
    if (val <= scale.minNum) {
      message.error('输入上限需大于下限！');
      return;
    }
    setScale({ ...scale, maxNum: val! });
  };

  const editBar = (
    <Space>
      上下限(mm):
      <InputNumber value={scale.minNum} onChange={(val) => onMinNumChange(val!)} />
      --
      <InputNumber value={scale.maxNum} onChange={(val) => onMaxNumChange(val!)} />
      <Button>预览</Button>
    </Space>
  );

  return (
    <div className={styles.outline}>
      <Popover content={editBar} placement="right">
        <Button icon={<EditOutlined />} onClick={() => setMinMax?.()} />
      </Popover>
      <div className={styles.fullBar}>
        <div>{scale.maxNum}mm</div>
        <div style={{ display: 'flex' }}>
          <Image className={styles.colorBar} src="/pic/colorBar.png" preview={false} />
          <NumberBar scale={scale} />
        </div>
        <div>{scale.minNum}mm</div>
      </div>
    </div>
  );
};

export default ColorBar;
