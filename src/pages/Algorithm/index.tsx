import React from "react";

import { ProCard, PageContainer } from "@ant-design/pro-components";
import {
  Form,
  message,
  Input,
  Button
} from "antd";

import type { AlgorithmConfig } from "@/models/algorithm";
import styles from './index.less';


const Algorithm: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: AlgorithmConfig) => {
    message.success('提交成功!');
  }


  return (
      <PageContainer header={{title: '', breadcrumb: {}}}>
        <Form
          form={form}
          className={styles.algorithm}
          name='algorithmConfig'
          onFinish={handleSubmit}
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 20 }}
          layout='horizontal'
          initialValues={{}}
        >
          <ProCard split='horizontal'>
            <ProCard split='vertical'>
              <ProCard title='回波录取参数'>
                <div className={styles.wrapper_top}>
                  <Form.Item name='interpolate' label='数据插值倍数'><Input placeholder='2'/></Form.Item>
                  <Form.Item name='data_start' label='原始数据起始位置'><Input placeholder='0'/></Form.Item>
                  <Form.Item name='start_invalid_length' label='单帧数据起始无效长度'><Input placeholder='1024'/></Form.Item>
                  <Form.Item name='end_invalid_length' label='单帧数据结束无效长度'><Input placeholder='1024'/></Form.Item>
                </div>
              </ProCard>
              <ProCard title='成像参数'>
                <div className={styles.wrapper_top}>
                  <Form.Item name='correction_factor' label='距离衰减校正因子系数'><Input placeholder='0.5'/></Form.Item>
                  <Form.Item name='angular_resolution' label='成像角分辨率'><Input placeholder='0.12'/></Form.Item>
                  <Form.Item name='distance_resolution' label='成像距离分辨率'><Input placeholder='0.3'/></Form.Item>
                  <Form.Item name='pershot_count' label='单次成像距离向条数'><Input placeholder='10'/></Form.Item>
                </div>
              </ProCard>
            </ProCard>
            <ProCard split='vertical' title='PS点提取及形变反演参数'>
              <ProCard>
                <div className={styles.wrapper}>
                  <Form.Item name='ps_sensitivity' label=' PS点灵敏度'><Input placeholder='10'/></Form.Item>
                  <Form.Item name='angular_resolution' label='PS初始化图像数量'><Input placeholder='10'/></Form.Item>
                  <Form.Item name='amp_threshold' label='幅度检测门限'><Input placeholder='0'/></Form.Item>
                  <Form.Item name='select_init' label='幅度离差选择门限初值'><Input placeholder='0.55'/></Form.Item>
                  <Form.Item name='coherence_init' label='相干系数阈值初值'><Input placeholder='0.45'/></Form.Item>
                  <Form.Item name='phase_threshold' label='干涉相位残差阈值'><Input placeholder='0.6'/></Form.Item>
                  <Form.Item name='coherence_window' label='相干半窗长'><Input placeholder='2'/></Form.Item>
                  <Form.Item name='control_var' label='相位滤波类型控制变量'><Input placeholder='1'/></Form.Item>
                </div>
              </ProCard>
              <ProCard>
                <div className={styles.wrapper}>
                  <Form.Item name='filter_window' label='滤波半窗长'><Input placeholder='2'/></Form.Item>
                  <Form.Item name='ps_adjust' label='PS门限调节系数'><Input placeholder='0.02'/></Form.Item>
                  <Form.Item name='time_alpha' label='时间滤波参数alpha'><Input placeholder='0.7'/></Form.Item>
                  <Form.Item name='time_beta' label='时间滤波参数beta'><Input placeholder='0.1'/></Form.Item>
                  <Form.Item name='average_weighted' label='均值加权'><Input placeholder='0.1'/></Form.Item>
                  <Form.Item name='deviation_weighted' label='标准差加权'><Input placeholder='0.1'/></Form.Item>
                  <Form.Item name='block_count' label='相关系数计算分块数'><Input placeholder='8'/></Form.Item>
                  <Form.Item name='estimated_distance' label='大气相位误差估计距离'><Input placeholder='15'/></Form.Item>
                </div>
              </ProCard>
              <ProCard>
                <div className={styles.wrapper}>
                  <Form.Item name='estimated_angle' label='大气相位误差估计角度'><Input placeholder='6'/></Form.Item>
                  <Form.Item name='singular_threshold' label='奇异点门限'><Input placeholder='3'/></Form.Item>
                  <Form.Item name='coeffect_ps' label='相关系数有效PS点'><Input placeholder='0.2'/></Form.Item>
                  <Form.Item name='effect_ps' label='有效PS点'><Input placeholder='0.3'/></Form.Item>
                  <Form.Item name='denoise_threshold' label='去噪门限'><Input placeholder='3'/></Form.Item>
                  <Form.Item name='noise_balanced' label='是否噪声均衡'><Input placeholder='1'/></Form.Item>
                  <Form.Item name='balance_type' label='噪声均衡类型'><Input placeholder='0'/></Form.Item>
                  <Form.Item name='correction_threshold' label='第二阶段大气校正门限'><Input placeholder='1'/></Form.Item>
                </div>
              </ProCard>
              <ProCard>
                <div className={styles.wrapper}>
                  <Form.Item name='update_period' label='二次大气补偿更新周期'><Input placeholder='1'/></Form.Item>
                  <Form.Item name='atmos_filter' label='是否大气滤波'><Input placeholder='0'/></Form.Item>
                  <Form.Item name='atmos_varA' label='大气滤波参数A'><Input placeholder='0.6'/></Form.Item>
                  <Form.Item name='atmos_varB' label='大气滤波参数B'><Input placeholder='0.4'/></Form.Item>
                  <Form.Item name='accumulate_param' label='短时形变累积参数'><Input placeholder='0.1'/></Form.Item>
                  <Form.Item name='model_type' label='大气模型类型'><Input placeholder='2'/></Form.Item>
                  <Form.Item name='correction_algorithm' label='大气校正算法'><Input placeholder='1'/></Form.Item>
                  <Form.Item name='deform_choice' label='形变图像选择'><Input placeholder='0'/></Form.Item>
                </div>
              </ProCard>
            </ProCard>
          </ProCard>
          <Form.Item>
            <div className={styles.buttons}>
              <Button htmlType="button" onClick={async () => {
                form.resetFields();
              }}>
                重置
              </Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </div>
          </Form.Item>
        </Form>
      </PageContainer>
  );
};

export default Algorithm;
