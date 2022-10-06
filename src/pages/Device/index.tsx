import React from "react";
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormGroup,
  ProFormText,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Statistic, message, Button } from "antd";
import { PoweroffOutlined, ReloadOutlined, CaretRightOutlined, PauseOutlined } from "@ant-design/icons";
import type { DeviceConfig } from '@/models/device'
import styles from './index.less';

const HeaderContent: React.FC = () => {

  return (
      <div className={styles.headerContent}>
        <div className={styles.content}>
          <div>
            <Button type='primary' shape='circle' icon={<CaretRightOutlined/>}/><p>开始工作</p>
          </div>
          <div>
            <Button type='primary' shape='circle' icon={<PauseOutlined/>}/><p>结束工作</p>
          </div>
          <div>
            <Button type='primary' shape='circle' icon={<ReloadOutlined/>}/><p>雷达复位</p>
          </div>
          <div>
            <Button type="primary" shape="circle" icon={<PoweroffOutlined/>}/><p>雷达重启</p>
          </div>

        </div>
        <div className={styles.headerExtraContent}>
          <Statistic title='今日上传次数' value={111}/>
          <Statistic title='最近上传时间' value={new Date().toLocaleString()}/>
        </div>
      </div>

  );
};

const Device: React.FC = () => {

  const handleSubmit = async (values: DeviceConfig) => {
    message.success('提交成功!');
  };

  return (
    <PageContainer
      content={<HeaderContent/>}
    >
      <ProForm
        name='deviceConfig'
        layout='horizontal'
        submitter={{
          submitButtonProps: {style:{marginTop: '8px'}},
          resetButtonProps: {style:{marginTop: '8px'}}
        }}
        onFinish={handleSubmit}
      >
        <ProCard split='vertical'>
          <ProCard>
            <ProFormGroup label='扫描模式'>
              <ProFormSelect
                name='rotate_speed'
                label='正扫转台转速'
                width={'sm'}
                valueEnum={{
                  0: '停止',
                  2: '2rpm',
                  1: '1rpm',
                  0.25: '1/4rpm',
                  0.0625: '1/16rpm',
                }}
                initialValue={"1"}
                help='0:stop;20:2rpm;30:1rpm;50:1/4rpm;60:1/16rpm;'
              />
            </ProFormGroup>
            <ProFormGroup label='雷达位姿'>
              <ProFormText
                name='longitude'
                width={'sm'}
                label='雷达位置经度'
                help='单位：°，格式 dd.ddddd°'
              />
              <ProFormText
                name='latitude'
                width={'sm'}
                label='雷达位置纬度'
                help='单位：°，格式 dd.ddddd°'
              />
              <ProFormText
                name='height'
                width={'sm'}
                label='雷达位置高度'
                help='单位：米'
              />
              <ProFormText
                name='zero_point'
                width={'sm'}
                label='雷达零点朝向'
                help='格式 dd.dd°，相对于正北方向，顺时针'
              />
            </ProFormGroup>
          </ProCard>
          <ProCard>
            <ProFormGroup label='雷达天线'>
              <ProFormText
                name='pitch'
                label='天线俯仰角'
                width={'sm'}
                help='单位：°'
              />
            </ProFormGroup>
            <ProFormGroup label='扫描区域'>
              <ProFormText
                name='scan_start'
                label='起始扫描角'
                width={'sm'}
                help='格式 dd.dd°,从转台零位开始，顺时针方向'
              />
              <ProFormText
                name='scan_end'
                label='结束扫描角'
                width={'sm'}
                help='格式 dd.dd°,从转台零位开始，顺时针方向'
              />
              <ProFormText
                name='min_detect'
                label='最近探测距离'
                width={'sm'}
                help='单位：米'
              />
              <ProFormText
                name='max_detect'
                label='最远探测距离'
                width={'sm'}
                help='单位：米'
              />
            </ProFormGroup>
          </ProCard>
          <ProCard>
            <ProFormGroup label='灵敏度'>
              <ProFormText
                name='sensitivity'
                label='探测灵敏度'
                width={'sm'}
                help='默认10，范围0-20'
              />
            </ProFormGroup>
            <ProFormGroup label='输出'>
              <ProFormSelect
                name='scatter_effect'
                label='散射图像有效'
                width={'sm'}
                valueEnum={{
                  0: '无效',
                  1: '有效',
                }}
                initialValue={"1"}
              />
              <ProFormText
                name='scatter_extract'
                label='散射图像帧抽取'
                help='0：无效，非0数字表示抽取比'
              />
              <ProFormSelect
                name='deform_effect'
                label='形变图像有效'
                width={'sm'}
                valueEnum={{
                  0: '无效',
                  1: '有效',
                }}
                initialValue={"1"}
              />
              <ProFormText
                name='deform_extract'
                label='形变图像帧抽取'
                width={'sm'}
                help='0：无效，非0数字表示抽取比'
              />
            </ProFormGroup>
          </ProCard>
        </ProCard>
      </ProForm>
    </PageContainer>
  );
};

export default Device;
