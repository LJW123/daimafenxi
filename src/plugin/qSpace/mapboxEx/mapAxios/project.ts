import axios from 'axios';
import STObject from './stobject';
import Relation from './relation';
import {
  getQMap,
  QProject,
  DrawCore,
  QMapModel,
  MapSource,
  defBaseStyle,
  noneBaseStyle,
  getDataUrl,
  BusinessScene,
} from '../../core';
class Project {
  constructor() {}

  /**
   * 打开工程  载入
   * @param pId 工程id
   */
  static async openProject(pId: any) {
    const qMap = getQMap();
    if (!qMap) return;
    const result: any = await Project.queryProject(pId);
    if (result.status == 200 && result?.data?.data?.items?.length > 0) {
      const projectResult = result.data.data.items[0];

      // 标绘列表
      const stobjectList: any = await STObject.querySTObject({
        metaId: projectResult.id,
        loadAttr: true,
      });
      // 载入底图场景
      const baseSceneId = projectResult.bgScene.id;

      let baseResult = null;
      if (baseSceneId) {
        if (baseSceneId == '11') {
          baseResult = defBaseStyle;
        } else if (baseSceneId == '00' || baseSceneId == '0') {
          baseResult = noneBaseStyle;
        } else {
          let baseRes: any = await Project.queryScene(baseSceneId);
          if (baseRes.items?.length > 0) {
            baseResult = baseRes.items[0];
          }
        }
      }
      qMap.setBaseScene(baseResult);

      // 载入业务场景
      // 新 通过关系获取业务场景
      let businessRelation: any = await Relation.queryRelation(
        projectResult.id,
        '业务场景',
      );
      if (businessRelation.length > 0) {
        let sceneIds: string[] = [];
        for (let index = 0; index < businessRelation.length; index++) {
          let relation = businessRelation[index];
          let id = relation.targetObj.id;
          sceneIds.push(id);
        }
        let sceneRes: any = await Project.queryScenes(sceneIds);
        const sceneItems: any[] = sceneRes.items;

        for (let index = 0; index < sceneItems.length; index++) {
          const scene = sceneItems[index];
          qMap.addBusinessScene(scene);
        }
      }

      // 载入数据图层
      const openProjectObj = new QProject(projectResult);

      // 载入标绘数据
      await openProjectObj.drawCollection.addSTobjectList(stobjectList, () => {
        // 载入推演
        const simulationList = projectResult.simulationList;
        if (simulationList) {
          const deduceObj = JSON.parse(simulationList);
          if (deduceObj) openProjectObj.deduceCollection.loadObject(deduceObj);
        }
      });
      getQMap()?.setCurrentProject(openProjectObj);

      return { openProjectObj };
    }
    return null;
  }
  /**
   * 新建工程
   */
  static async newProject(gid: any, obj: any) {
    const qMap = getQMap();
    if (!qMap) return;
    let project = qMap.project;
    if (!project) return;

    let sceneObj = Project.toProjectObj(qMap);

    sceneObj.name = obj.name;
    sceneObj.icon = obj.icon;
    sceneObj.pos = { id: gid }; //3.创建工程

    const projectResult: any = await Project.createProject(sceneObj);

    if (projectResult && projectResult.id) {
      const pid = projectResult.id;

      // 业务场景  新建业务场景和工程的关系
      let businessIds = qMap
        .getBusinessScene()
        .map((it: BusinessScene) => it.id);
      await Relation.createRelation(pid, businessIds, '业务场景');

      // 标绘
      const drawEntitys: DrawCore[] = qMap?.getDrawEntitys() || [];
      const stobjectList = STObject.toStObjectList(drawEntitys);
      const _stobjectList = stobjectList.map((it: any) => {
        it.obj.from = pid;
        return it;
      });
      //保存对象
      if (_stobjectList.length > 0) {
        await STObject.saveStobject(_stobjectList, pid);
      }

      await Project.openProject(pid).then((obj: any) => {});
    }
    return true;
  }
  /**
   * 工程  编辑 保存
   */
  static async saveProject(obj?: any) {
    const qMap = getQMap();
    if (!qMap) return;
    const project = qMap.project;
    if (!project) return;

    const sceneObj = Project.toProjectObj(qMap);
    if (obj) {
      sceneObj.name = obj.name;
      sceneObj.icon = obj.icon;
    }
    await Project.updateProject(sceneObj);
    const pid = sceneObj.id;

    // 业务场景  新建业务场景和工程的关系
    const businessIds = qMap
      .getBusinessScene()
      .map((it: BusinessScene) => it.id);

    await Relation.deleteBySrcRelation(pid);
    await Relation.createRelation(pid, businessIds, '业务场景');

    const drawEntitys: DrawCore[] = qMap?.getDrawEntitys() || [];
    const stobjectList = STObject.toStObjectList(drawEntitys);
    await STObject.destroyAllStobject(pid);
    const _stobjectList = stobjectList.map((it: any) => {
      it.obj.from = pid;
      return it;
    });
    if (_stobjectList.length > 0) {
      //保存 标绘数据
      await STObject.saveStobject(_stobjectList, pid);
    }
  }
  /**
   * 处理工程 组织数据
   */
  static toProjectObj(qMap: QMapModel) {
    const project = qMap.project;
    const deduceCollection = qMap.getDeduceCollection();
    const deduceObj = deduceCollection.toObject();

    const qPagePositionCollection = qMap.getQPagePositionCollection();
    const qPagePosition = qPagePositionCollection.toObject();

    const sceneLayerList: MapSource[] = qMap.getDataLayerList();
    const layers = sceneLayerList.map((it: MapSource) => {
      return it.toObject();
    });
    const viewPos = qMap.getCameraParms();

    let sceneObj: any = {
      title: project.name,
      name: project.name,
      viewPos: JSON.stringify(viewPos),
      bgScene: { id: qMap.getBaseScene()?.id },
      // biScene: { id: businessIds.join(',') },
      sceneLayers: layers,
      simulationList: JSON.stringify(deduceObj),
      charts: JSON.stringify(qPagePosition),
    };

    if (project.sceneObj) {
      let sceneObject = project.sceneObj;
      sceneObj.id = sceneObject.id;
      sceneObj.pos = sceneObject.pos;
    }
    return sceneObj;
  }

  static createProject(sceneObj: any) {
    return new Promise((resolve, reject) => {
      const param = { ...sceneObj };
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/qspaceproject/create`, param)
        .then((res) => {
          let data = res.data.data;
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static updateProject(sceneObj: any) {
    return new Promise((resolve, reject) => {
      const param = { ...sceneObj };
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/qspaceproject/update`, param)
        .then((res: any) => {
          let data = res.data.data;
          resolve(data);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  static deleteProject(proId: any) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .delete(`${datamg}/qspaceproject/delete/${proId}`)
        .then((res) => {
          if (res.status == 200) {
            resolve(res);
          } else {
            reject({ message: '删除失败' });
            //message.error('删除失败');
          }
        })
        .catch((err) => {
          reject(err);
          // message.error('请求失败');
        });
    });
  }

  static queryProject(proId: any) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/qspaceproject/query`, { id: proId })
        .then((res) => {
          if (res.status == 200) {
            resolve(res);
          } else {
            reject({ message: '查询失败' });
            //message.error('删除失败');
          }
        })
        .catch((err) => {
          reject(err);
          // message.error('请求失败');
        });
    });
  }

  // 传入场景的id
  static queryScene(id: string) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/mapservice/scene/query`, { id: id })
        .then((res) => {
          if (res.status == 200) {
            resolve(res.data.data);
          } else {
            reject({ message: '查询失败' });
          }
        })
        .catch((err) => {
          reject(err);
          // message.error('请求失败');
        });
    });
  }

  // 传入场景的ids
  static queryScenes(ids: string[]) {
    return new Promise((resolve, reject) => {
      const datamg = `${getDataUrl()}/datamg`;
      const token = window.qSpaceToken;
      axios
        .create({
          headers: {
            token: token,
          },
        })
        .post(`${datamg}/mapservice/scene/query`, { ids: ids })
        .then((res) => {
          if (res.status == 200) {
            resolve(res.data.data);
          } else {
            reject({ message: '查询失败' });
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default Project;
