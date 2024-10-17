







export default class Chart {
    chartViewId: string | undefined
    childs: Array<Chart>
    chartType?: string
    viewParams?: any
    metaId?: string
    queryParams?: any

    constructor(params: Chart) {
        this.chartViewId = params.chartViewId;
        this.chartType = params.chartType;
        this.viewParams = params.viewParams;
        this.metaId = params.metaId;
        this.queryParams = params.queryParams;


        if (params.childs && params.childs.length > 0) {
            this.childs = params.childs.map(item => new Chart(item));
        } else {
            this.childs = []
        }
    }


}
