class Controller{
    constructor($scope, $filter, Survey, Servertime, preloader){
        this.$scope = $scope;
        this.$filter = $filter;
        this.API = Survey;
        this.Servertime = Servertime;

        this.list = [];
        this.filter = '';
        this.differTime = 0;

        this.order = {
            current: 'Newest',
            list: [
                'Newest',
                'Oldest'
            ],
            isDisplayed: false
        };

        preloader.requestIsSent('main');
        this.API.getCompletedSurveys().then((list) => {
            this.list = list;
            this.orderByDate(this.order.current);
        }).finally(()=>{
            preloader.responseIsReceived('main');
        });

        this.Servertime.getServerTime().then((timestamp)=>{
            this.differTime  = new Date().getTime() - timestamp;
        });
    }

    orderByDate(criteria){
        if (!_.find(this.order.list, (value, key)=>{ return value === criteria })) return;

        this.list = this.$filter('orderBy')(this.list, ['status.date'], criteria === 'Newest');

        this.order.current = criteria;
        this.order.isDisplayed = false;
    }

    getRelativeDate(date){
        if (date) {
            var timestamp = new Date(date).getTime(),
                result = this.differTime < 0 ? new Date(timestamp + this.differTime) : new Date(timestamp - this.differTime);

            return this.$filter('relativeDate')(result);
        } else {
            return '';
        }
    }

    searchByTitle($event){
        $event.preventDefault();
    }
}

export default Controller;
