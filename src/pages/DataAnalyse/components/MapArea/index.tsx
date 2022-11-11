import React from 'react';
//import styles from './index.less';
import { useState, useEffect } from 'react';

// Cesium 相关配置
window.CESIUM_BASE_URL = '/static/cesium';
import * as Cesium from 'cesium';
import '@/../node_modules/cesium/Build/Cesium/Widgets/widgets.css';
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOGM1Y2MyYy0zNzhjLTQwN2QtYjkyOC0zZDYzN' +
  'jI5NTEyNTAiLCJpZCI6MTA5NzUwLCJpYXQiOjE2NjQ1MjM0NDZ9.gPRCXltXZgZxTZDdtToSvyxAdRfOjNQRvUdWHCyYXDQ';

type MapAreaProps = {
  clipEnable?: boolean;
};

const MapArea: React.FC<MapAreaProps> = (props: MapAreaProps) => {
  const [globeViewer, setGlobeViewer] = useState<any>();
  const { clipEnable } = props;

  // 仅挂载后运行一次cesium初始化
  useEffect(() => {
    const setCesium = () => {
      // const arc = new Cesium.ArcGisMapServerImageryProvider({
      //   url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
      // });

      // 设置地形Provider
      const terrainProvider = new Cesium.CesiumTerrainProvider({
        url: 'http://localhost:80/slicehash/demo',
      });

      // 创建viewer视图
      const viewer = new Cesium.Viewer('cesiumContainer', {
        // imageryProvider: arc,
        // terrainProvider : new Cesium.CesiumTerrainProvider({
        //   url : Cesium.IonResource.fromAssetId(3956),
        //   requestVertexNormals : true
        // }),
        terrainProvider,
        homeButton: false,
        navigationHelpButton: false,
        geocoder: false,
        // fullscreenButton: false,
        baseLayerPicker: false,
        timeline: false,
        shouldAnimate: false,
        shadows: false,
        animation: false,
        sceneModePicker: false,
      });

      // 设置初始视角
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(117.3052368164, 49.4280128479, 3000),
        orientation: {
          heading: Cesium.Math.toRadians(0), // 左右角度
          pitch: Cesium.Math.toRadians(-90), // -90为正俯视
          roll: 0.0,
        },
      });

      // 添加DEM底图
      viewer.imageryLayers.addImageryProvider(
        new Cesium.SingleTileImageryProvider({
          url: 'http://localhost:80/slicehash/demo/defo.png',
          //url: 'http://localhost:80/slicehash/demo/colorby.png',
          rectangle: Cesium.Rectangle.fromDegrees(
            117.27761348385629,
            49.411345992903364,
            117.30503052941792,
            49.43642674163687,
          ),
        }),
      );
      // viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
      //   //url: 'http://localhost:80/slicehash/demo/defo.png',
      //   url: 'http://localhost:80/slicehash/demo/test_defo.png',
      //   rectangle: Cesium.Rectangle.fromDegrees(117.27761348385629, 49.411345992903364,
      //     117.30503052941792, 49.43642674163687),
      // }));

      // 添加雷达点位
      viewer.entities.add({
        // name : 'Red box with black outline',
        // position: Cesium.Cartesian3.fromDegrees(117.3052368164, 49.4280128479, 1000),
        // box : {
        //   dimensions : new Cesium.Cartesian3(400.0, 300.0, 500.0),
        //   material : Cesium.Color.RED.withAlpha(0.5),
        //   outline : true,
        //   outlineColor : Cesium.Color.BLACK
        // },
        name: 'radar point',
        position: Cesium.Cartesian3.fromDegrees(117.3052368164, 49.4280128479),
        point: {
          pixelSize: 13,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.GRAY,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
        label: {
          text: 'radar',
          font: '14pt sans-serif',
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          fillColor: Cesium.Color.BLACK,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        // billboard: {
        //   verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // },
      });

      // 添加雷达扫描边界
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            117.27763989399657, 49.437545209492335, 117.3052368164, 49.4280128479,
            117.2939262879331, 49.40972240310838,
          ]),
          clampToGround: true,
          width: 4,
          material: new Cesium.PolylineOutlineMaterialProperty({
            color: Cesium.Color.DARKORANGE,
          }),
        },
      });

      // 获取鼠标经纬度
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction(function (event: any) {
        const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
        if (cartesian) {
          const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
          const lon = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          console.log(lon, lat);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // 裁剪底图
      const globe = viewer.scene.globe;
      const position = Cesium.Cartographic.toCartesian(
        Cesium.Cartographic.fromDegrees(117.2913220066371, 49.423086367270114),
      );
      const distance = 1900.0;
      const boundingSphere = new Cesium.BoundingSphere(position, distance);

      globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
        modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(position),
        planes: [
          new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), distance),
          new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), distance * 0.93),
          new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), distance),
          new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), distance * 0.79),
        ],
        unionClippingRegions: true,
        edgeWidth: 1.0,
        edgeColor: Cesium.Color.LIGHTSLATEGRAY,
        enabled: true,
      });
      globe.backFaceCulling = false;
      globe.showSkirts = false;

      // 设置相机视角
      viewer.camera.viewBoundingSphere(
        boundingSphere,
        new Cesium.HeadingPitchRange(0.0, -1.2, boundingSphere.radius * 4.0),
      );
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

      // 设置viewer全局状态
      setGlobeViewer(viewer);
    };
    setCesium();
  }, []);

  // 每次cesium刷新都运行一次
  if (globeViewer) {
    globeViewer.scene.globe.clippingPlanes.enabled = clipEnable;
  }
  // useEffect(() => {
  //
  // }, [clipEnable]);

  return <div id="cesiumContainer" />;
};

export default MapArea;
