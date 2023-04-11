// Cesium 相关配置
import { Button, Popconfirm } from 'antd';
import ReactDom from 'react-dom';

window.CESIUM_BASE_URL = '/static/cesium';
import * as Cesium from 'cesium';
import '@/../node_modules/cesium/Build/Cesium/Widgets/widgets.css';
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOGM1Y2MyYy0zNzhjLTQwN2QtYjkyOC0zZDYzN' +
  'jI5NTEyNTAiLCJpZCI6MTA5NzUwLCJpYXQiOjE2NjQ1MjM0NDZ9.gPRCXltXZgZxTZDdtToSvyxAdRfOjNQRvUdWHCyYXDQ';

import { demo as radarSpecific } from '@/constant/radarSpecific';
import { tempTarget as layerSpecific } from '@/constant/layerSpecific';
import { imgPathPrefix } from '@/constant/layerSpecific';
import React from 'react';

// 获取雷达相关参数
const {
  radarLocation: { longitude, latitude },
  imageSpan: { lngMin, lngMax, latMin, latMax },
} = radarSpecific;
const { terrainUrl, defoUrl } = layerSpecific;

const [lngCenter, latCenter] = [(lngMin + lngMax) / 2, (latMin + latMax) / 2];

export class CesiumViewer {
  viewer: any;
  originCameraAttr: any;
  currentImg: any;

  startPoint: any;
  endPoint: any;
  areaPickFlag: boolean;
  currentAreaEntity: any;
  areaEntities: any;

  areaPoints: any;

  geoInfoBox: any;

  constructor() {
    this.viewer = null;
    // 设置相机初始位置
    this.originCameraAttr = {
      destination: Cesium.Cartesian3.fromDegrees(lngCenter, latCenter, 8000),
      orientation: {
        heading: Cesium.Math.toRadians(0), // 左右角度
        pitch: Cesium.Math.toRadians(-90), // -90为正俯视
        roll: 0.0,
      },
    };

    this.areaPickFlag = false;
    // viewer当前贴图
    this.currentImg = null;
    this.currentAreaEntity = null;
    this.areaEntities = [];
    this.areaPoints = [];

    this.startPoint = null;
    this.endPoint = null;
  }

  build() {
    // 设置地形Provider, 即DEM底图
    const terrainProvider = new Cesium.CesiumTerrainProvider({
      url: terrainUrl,
    });
    // 创建viewer视图
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      }),
      // terrainProvider : new Cesium.CesiumTerrainProvider({
      //   url : Cesium.IonResource.fromAssetId(3956),
      //   requestVertexNormals : true
      // }),
      //terrainProvider,
      homeButton: false,
      navigationHelpButton: false,
      geocoder: true,
      infoBox: false,
      // fullscreenButton: false,
      baseLayerPicker: false,
      timeline: false,
      shouldAnimate: false,
      shadows: false,
      animation: false,
      sceneModePicker: false,
      selectionIndicator: false,
      fullscreenButton: false,
    });
    // this.viewer.imageryLayers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
    //   url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    // }));
    this.viewer.imageryLayers.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        url: 'http://localhost:83/temp/defo.png',
        rectangle: Cesium.Rectangle.fromDegrees(lngMin, latMin, lngMax, latMax),
      }),
    );

    this.viewer._cesiumWidget._creditContainer.style.display = 'none'; //隐藏logo版权

    // 初始化viewer
    this.setDefaultView();
    this.addRadarPointEntity();
    this.setClipAttr();
    this.addMouseEvent();

    this.setGeoInfoBox();
    //this.addScaleLineEntity();
  }

  setGeoInfoBox = () => {
    const geoInfoBox = document.createElement('div');
    this.viewer.container.appendChild(geoInfoBox);
    geoInfoBox.className = 'backdrop';
    geoInfoBox.style.position = 'absolute';
    geoInfoBox.style.bottom = '0';
    geoInfoBox.style.right = '0';
    geoInfoBox.style['pointer-events'] = 'none'; // 点击穿透
    geoInfoBox.style['whiteSpace'] = 'pre'; // 显示多空格
    geoInfoBox.style.padding = '2px';
    geoInfoBox.style.backgroundColor = 'black';
    geoInfoBox.style.width = '70%';
    geoInfoBox.style.paddingRight = '10%';
    geoInfoBox.style.fontSize = '8pt';
    geoInfoBox.style.textAlign = 'right';
    this.geoInfoBox = geoInfoBox;
  };

  public addPickAreaEvent = (callback: any) => {
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((event: any) => {
      // 是否开启区域选择
      if (!this.areaPickFlag) return;
      // 是否已确定区域初始点
      if (!this.startPoint) {
        this.startPoint = this.getPosLngLat(event.position);
        // 若选择了区域外的点，则直接跳出
        if (!this.startPoint) return;
        // 若已选初始点，添加面实体
        // let areaPoints:any =  [0, 0, 0, 0];
        // if (this.endPoint) {
        //   areaPoints = [...this.startPoint, this.endPoint[0], this.startPoint[1], ...this.endPoint, this.startPoint[0], this.endPoint[1]];
        // }
        this.currentAreaEntity = this.viewer.entities.add({
          rectangle: {
            coordinates: new Cesium.CallbackProperty(() => {
              if (this.endPoint) {
                return Cesium.Rectangle.fromCartesianArray(
                  Cesium.Cartesian3.fromDegreesArray(this.startPoint.concat(this.endPoint)),
                );
              }
              return Cesium.Rectangle.fromDegrees();
            }, false),
            //height: 0,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            material: Cesium.Color.RED.withAlpha(0.3),
            // outline: true,
            // outlineColor: Cesium.Color.RED.withAlpha(0.8),
          },
        });
      } else {
        // 确认区域后所有的处理交由回调调用处理
        callback();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((movement: any) => {
      // 是否选择初始点
      if (!this.startPoint) return;
      this.endPoint = this.getPosLngLat(movement.endPosition);
      if (!this.endPoint) return;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  };

  public confirmArea = () => {
    this.viewer.entities.add({
      name: '',
      rectangle: {
        coordinates: Cesium.Rectangle.fromCartesianArray(
          Cesium.Cartesian3.fromDegreesArray(this.startPoint.concat(this.endPoint)),
        ),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        material: Cesium.Color.GREEN.withAlpha(0.6),
      },
    });

    this.viewer.entities.remove(this.currentAreaEntity);
    // 添加存储实体
    this.areaEntities.push(this.currentAreaEntity);
    // 添加实体位置（用于向后端传输）
    this.areaPoints = this.areaPoints.concat(this.startPoint, this.endPoint);
    this.startPoint = null;
    this.endPoint = null;
  };

  public cancelArea = () => {
    this.viewer.entities.remove(this.currentAreaEntity);
    this.startPoint = null;
    this.endPoint = null;
  };

  // 获取目标点位的经纬信息
  private getPosLngLat = (position: any) => {
    const ray = this.viewer.camera.getPickRay(position);
    const cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    if (cartesian) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      return [lng, lat];
    }
    return null;
  };

  // 设置默认相机视角
  setDefaultView = () => {
    this.viewer.camera.setView(this.originCameraAttr);
  };

  addRadarPointEntity = () => {
    this.viewer.entities.add({
      name: 'radar point',
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
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
  };

  addScaleLineEntity = () => {
    // 添加雷达扫描边界
    this.viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          117.27763989399657,
          49.437545209492335,
          longitude,
          latitude,
          117.2939262879331,
          49.40972240310838,
        ]),
        clampToGround: true,
        width: 4,
        material: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.DARKORANGE,
        }),
      },
    });
  };

  // 裁剪底图
  setClipAttr = () => {
    const globe = this.viewer.scene.globe;
    // const position = Cesium.Cartographic.toCartesian(
    //   Cesium.Cartographic.fromDegrees(lngCenter, latCenter),
    // );
    const position = Cesium.Cartesian3.fromDegrees(lngCenter, latCenter);
    const distance = 1900.0;
    // const boundingSphere = new Cesium.BoundingSphere(position, distance);

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
      enabled: false,
    });
    globe.backFaceCulling = false;
    globe.showSkirts = false;

    // 设置相机视角
    // viewer.camera.viewBoundingSphere(
    //   boundingSphere,
    //   new Cesium.HeadingPitchRange(0.0, -1.2, boundingSphere.radius * 4.0),
    // );
    // viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  };

  private addMouseEvent = () => {
    // 获取鼠标经纬度
    const viewer = this.viewer;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((movement: any) => {
      const ray = viewer.camera.getPickRay(movement.endPosition);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        this.geoInfoBox.innerText =
          `经度: ${lon.toFixed(5)}` +
          '        ' +
          `纬度: ${lat.toFixed(5)}` +
          '        ' +
          `高度: ${height.toFixed(3)}`;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  };

  // 裁剪与否的切换
  public toggleClipping = (flag: boolean) => {
    this.viewer.scene.globe.clippingPlanes.enabled = !flag;
  };

  // 视角转移到初始位置
  public flytoOrigin = () => {
    this.viewer.camera.flyTo({
      ...this.originCameraAttr,
      duration: 1.5,
    });
  };

  // 更新sar贴图
  public coverSarImage = (imgUrl: string) => {
    // 若图像未改变则无需更新
    if (imgUrl === this.currentImg) return;

    const layer = this.viewer.imageryLayers;
    if (layer.get(1)) {
      layer.remove(layer.get(1));
    }
    layer.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        url: imgPathPrefix + imgUrl,
        rectangle: Cesium.Rectangle.fromDegrees(lngMin, latMin, lngMax, latMax),
      }),
    );
    // 更新当前图像记录
    this.currentImg = imgUrl;
  };
}
