// Cesium 相关配置
window.CESIUM_BASE_URL = '/static/cesium';
import * as Cesium from 'cesium';
import '@/../node_modules/cesium/Build/Cesium/Widgets/widgets.css';
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhOGM1Y2MyYy0zNzhjLTQwN2QtYjkyOC0zZDYzN' +
  'jI5NTEyNTAiLCJpZCI6MTA5NzUwLCJpYXQiOjE2NjQ1MjM0NDZ9.gPRCXltXZgZxTZDdtToSvyxAdRfOjNQRvUdWHCyYXDQ';

import { dawangshan as radarSpecific } from '@/constant/radarSpecific';
import { tempTarget as layerSpecific } from '@/constant/layerSpecific';
import { imgPathPrefix } from '@/constant/layerSpecific';

// 获取雷达相关参数
const {
  radarLocation: { longitude, latitude },
  imageSpan: { lngMin, lngMax, latMin, latMax },
} = radarSpecific;
const { terrainUrl, defoUrl } = layerSpecific;

const [lngCenter, latCenter] = [(lngMin + lngMax) / 2, (latMin + latMax) / 2];

export class CesiumViewer {
  viewer: Cesium.Viewer;
  originCameraAttr;
  currentImg: string | null;

  constructor() {
    // 设置地形Provider, 即DEM底图
    const terrainProvider = new Cesium.CesiumTerrainProvider({
      url: terrainUrl,
    });
    // 创建viewer视图
    this.viewer = new Cesium.Viewer('cesiumContainer', {
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

    this.originCameraAttr = {
      destination: Cesium.Cartesian3.fromDegrees(lngCenter, latCenter, 8000),
      orientation: {
        heading: Cesium.Math.toRadians(0), // 左右角度
        pitch: Cesium.Math.toRadians(-90), // -90为正俯视
        roll: 0.0,
      },
    };

    this.currentImg = null;

    this.setDefaultView();
    this.addRadarPointEntity();
    this.setClipAttr();
    this.addMouseEvent();
  }

  // 设置默认相机视角
  setDefaultView = () => {
    this.viewer.camera.setView(this.originCameraAttr);
  };

  addRadarPointEntity = () => {
    this.viewer.entities.add({
      // name : 'Red box with black outline',
      // position: Cesium.Cartesian3.fromDegrees(117.3052368164, 49.4280128479, 1000),
      // box : {
      //   dimensions : new Cesium.Cartesian3(400.0, 300.0, 500.0),
      //   material : Cesium.Color.RED.withAlpha(0.5),
      //   outline : true,
      //   outlineColor : Cesium.Color.BLACK
      // },
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
    const position = Cesium.Cartographic.toCartesian(
      Cesium.Cartographic.fromDegrees(lngCenter, latCenter),
    );
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
      enabled: true,
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

  addMouseEvent = () => {
    // 获取鼠标经纬度
    const viewer = this.viewer;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event: any) {
      const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        // const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        // 高度需要通过globe对象另外通过经纬求
        console.log(lon, lat, viewer.scene.globe.getHeight(cartographic));
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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
