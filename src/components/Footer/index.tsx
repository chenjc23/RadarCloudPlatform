import React from "react";
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} 空间信息感知技术团队出品`}
      links={[
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/chenjc23/RadarCloudPlatform',
        },
        {
          key: 'Jc Chen',
          title: 'Jc Chen',
          href: 'https://github.com/chenjc23/RadarCloudPlatform',
        },
      ]}
    />
  );
};

export default Footer;
