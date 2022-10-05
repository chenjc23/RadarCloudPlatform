
export type DeviceConfig = {
  rotate_speed?: number,    // 正扫转台转速
  pitch?: number,           // 天线俯仰角
  longitude?: number,       // 雷达位置经度
  latitude?: number,        // 雷达位置纬度
  height?: number,          // 雷达位置高度
  zero_point?: number,      // 雷达零点朝向
  scan_start?: number,      // 起始扫描角
  scan_end?: number,        // 结束扫描角
  min_detect?: number,      // 最近探测距离
  max_detect?: number,      // 最远探测距离
  scatter_effect?: boolean, // 散射图像有效
  scatter_extract?: number, // 散射图像帧抽取
  deform_effect?: boolean,  // 形变图像有效
  deform_extract?: number,  // 形变图像帧抽取
  sensitivity?: number,     // 探测灵敏度
}
