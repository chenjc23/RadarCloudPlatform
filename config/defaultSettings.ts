import { Settings as LayoutSettings } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'realDark',
  // 拂晓蓝
  colorPrimary: '#13C2C2',
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '边坡稳定监测雷达',
  pwa: false,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  //logo: './public/pro_icon.svg',
  iconfontUrl: '',
};

export default Settings;
