interface QattrModel {
  name: string;
  value: string;
}

class QAttribute {
  name: any = '';

  otherList: QattrModel[] = [];

  constructor(obj: any = {}) {
    let otherList: QattrModel[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const it = obj[key];
        if (key == 'name') {
          this.name = it || '';
        } else {
          otherList.push({
            name: key,
            value: it,
          });
        }
      }
    }
    this.otherList = otherList;
  }

  toObjectData() {
    let obj: any = {
      name: this.name,
    };
    for (let i = 0; i < this.otherList.length; i++) {
      let item = this.otherList[i];
      let key = item.name;
      let value = item.value;
      obj[key] = value;
    }
    return obj;
  }
  setAttributeFields(values: any) {
    let otherList: QattrModel[] = [];
    for (let i = 0; i < values.length; i++) {
      let val = values[i];
      if (val.caption) {
        this.name = val.value;
      } else {
        otherList.push({
          name: val.name,
          value: val.value,
        });
      }
    }
    this.otherList = otherList;
  }
  // setAttributeField(item: any, value: any) {
  // if (item === 'name') {
  //   this.name = value
  // } else {
  //   this.otherList = value
  //   // let obj = this.otherList.find((it: QattrModel) => it.name === item.name)
  //   // if (obj) {
  //   //   obj.value = value
  //   // } else {
  //   //   this.otherList.push({
  //   //     name: item.name,
  //   //     value: value
  //   //   })
  //   // }
  // }
  // }

  getAttributeFields() {
    let sArr: Array<any> = [
      {
        caption: '名称',
        value: this.name,
        name: 'name',
      },
    ];

    this.otherList.forEach((it: any) => {
      sArr.push({
        name: it.name,
        value: it.value,
      });
    });
    return sArr;
  }
}

export default QAttribute;
