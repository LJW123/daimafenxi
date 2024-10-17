






export class Style {
    bgImage: string
    titleImage: string
    style: any = {}
    constructor(params: any) {
        this.bgImage = params.bgImage || '';
        this.titleImage = params.titleImage || '';
        this.style = params.style || {};

    }


}


export class PageStyle {
    mainPage: Style
    headerPage: Style
    leftPage: Style
    rightPage: Style
    constructor(params: any) {
        
        this.mainPage = new Style(params.mainPage || {});
        this.headerPage = new Style(params.headerPage || {});
        this.leftPage = new Style(params.leftPage || {});
        this.rightPage = new Style(params.rightPage || {});

    }


}
