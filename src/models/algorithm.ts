
export type AlgorithmConfig = {
  // 回波录取参数
  interpolate?: number,    // 数据插值倍数
  data_start?: number,     //
  start_invalid_length?: number,
  end_invalid_length?: number,
  // 成像参数
  correction_factor?: number,
  angular_resolution?: number,
  distance_resolution?: number,
  pershot_count?: number,
  // PS点提取及形变反演参数
  ps_sensitivity?: number,
  img_count?: number,
  amp_threshold?: number,
  select_init?: number,
  coherence_init?: number,
  phase_threshold?: number,
  coherence_window?: number,
  control_var?: number,

  filter_window?: number,
  ps_adjust?: number,
  time_alpha?: number,
  time_beta?: number,
  average_weighted?: number,
  deviation_weighted?: number,
  block_count?: number,
  estimated_distance?: number,

  estimated_angle?: number,             // 大气相位误差估计角度
  singular_threshold?: number,          // 奇异点门限
  coeffect_ps?: number,                 // 相关系数有效PS点
  effect_ps?: number,                   // 有效PS点
  denoise_threshold?: number,           // 去噪门限
  noise_balanced?: number,              // 是否噪声均衡
  balance_type?: number,                // 噪声均衡类型
  correction_threshold?: number,        // 第二阶段大气校正门限

  update_period?: number,               // 二次大气补偿更新周期
  atmos_filter?: number,                // 是否大气滤波
  atmos_varA?: number,                  // 大气滤波参数A
  atmos_varB?: number,                  // 大气滤波参数B
  accumulate_param?: number,            // 短时形变累积参数
  model_type?: number,                  // 大气模型类型
  correction_algorithm?: number,        // 大气校正算法
  deform_choice?: number,               // 形变图像选择
}
