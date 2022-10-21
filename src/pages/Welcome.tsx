import { PageContainer } from '@ant-design/pro-components';
import { Card } from 'antd';
import React from 'react';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 4px 0 rgba(35,49,128,0.02), 0 4px 8px 0 rgba(49,69,179,0.02)',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'rgba(0,0,0,0.65)',
        textAlign: 'justify',
        lineHeight: ' 22px',
        padding: '16px 19px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: 'rgba(0, 0, 0, 0.85)',
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(0,0,0,0.65)',
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
          whiteSpace: 'pre-line'
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a>
    </div>
  );
};

const Welcome: React.FC = () => {
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            'radial-gradient(circle at 97% 10%, #EBF2FF 0%, #F5F8FF 28%, #EBF1FF 124%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: '#1A1A1A',
            }}
          >
            欢迎使用 Radar Cloud Platform
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(0,0,0,0.65)',
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            本项目基于React框架，结合开源GIS系统，研究雷达图像、光学图像与三维DEM的几何映射算法，
            实现SAR监测图像、卫星光学图像与DEM的融合渲染及动态显示。
          </p>
          <div
            style={{
              display: 'flex',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              href="https://umijs.org/docs/introduce/introduce"
              title="数据采集处理进程"
              desc={'(1)建立TCP socket与雷达进行连接通信，接受雷达上传的回波数据;\n' +
                    '(2)调用算法库处理回波数据，得到雷达强度图和形变图;\n' +
                    '(3)文件系统中调用提前存储的DEM底图与算法处理得到的地基SAR图像进行融合计算处理，以二进制文件形式存储计算匹配结果;\n'+
                    '(4)接收前端或服务后端(后续实际开发过程中调整)的设备控制请求，通过TCP/IP向下位机雷达发送配置或控制指令。'}
            />
            <InfoCard
              index={2}
              title="后台服务进程"
              href="https://ant.design"
              desc={'(1)监听服务端口，接收前端发起的请求，如：登录注册、算法参数配置、选定监测点数据分析等;\n' +
                    '(2)对于普通的业务请求，对用户的业务操作进行解析处理后，连接后台数据库，对数据库进行相应的增删改查操作;\n'+
                    '(3)对于选点监测请求，在文件系统中调用匹配好的三维图像，计算用户选定范围内的形变均值，每分钟进行一次运算并实时返回运算结果(是否将运算结果存储入数据库加快查询速度?)\n'+
                    '(4)在历史图像工作模式下，若已保存监测点数据，则对该点的历史分析可直接查询数据库获得，否则需要对感兴趣时间段内的每一份形变数据都进行指定范围内的均值运算获取结果。'}
            />
            <InfoCard
              index={3}
              title="前端页面"
              href="https://procomponents.ant.design"
              desc={'前端使用react，搭载AntDesign企业级框架进行开发。以导航栏的形式展开视图管理，目前计划分为用户中心、设备管理、算法配置、数据分析、日志管理、预警预报6个模块进行开发。\
                    重点是数据分析模块，数据分析模块可分为两大功能：\n' +
                    '(1)三维融合数据的实时显示和历史显示，包括强度图和形变图;\n'+
                    '(2)选定监测点，以折线图形式展现具体范围内的形变趋势。'}
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
