import confirmTmpl from './confirm.template.html';
import confirmCtrl from './confirm.controller.js';

class Controller{
    constructor($scope, $modal, Modal, Survey, User, STATUSES_OF_SURVEYS, preloader, paymentModal, DownloadFile){
        this.$scope = $scope;
        this.$modal = $modal;
        this.API = Survey;
        this.User = User;
        this.paymentModal = paymentModal;
        this.DownloadFile = DownloadFile;
        this.STATUSES_OF_SURVEYS = STATUSES_OF_SURVEYS;

        this.list = null;
        this.invoices = null;
        this.isDisplaedReason = false;
        this.modal = {
            title: '',
            content: ''
        };

        this.model = {};

        this.initData();

        preloader.requestIsSent('main');
        this.API.getMySurveys().then((list) => {
            this.list = list;
        }).finally(()=>{
            preloader.responseIsReceived('main');
        });
    }

    initData(){
        this.$scope.$watch('user.model.wallets', (wallets)=>{
            var wallet = _.findWhere(wallets, {type: 'SURVEY'});
            this.credits = angular.isObject(wallet) ? wallet.value : 0;
        });

        this.model.cost = 0;
    }

    buyResponses(){
        return this.paymentModal.show(this.model);
    }

    getTitleOfStatus(code){
        var item = _.find(this.STATUSES_OF_SURVEYS, (item) => {
            return item.code === code;
        });

        return item !== -1 && angular.isObject(item) && item.title ? item.title : code;
    }

    getColorOfStatus(code){
        var item = _.find(this.STATUSES_OF_SURVEYS, (item) => {
            return item.code === code;
        });

        return item !== -1 && angular.isObject(item) && item.color ? item.color : '';
    }

    getFormattedDate(date){
        if (! date) return '';

        return moment(date).format('D/M/YYYY');
    }

    showReason(survey, reason = '', title = ''){
        this.isDisplaedReason = true;

        this.modal = {
            title: title || 'Feedback',
            content: reason || survey.status.reason
        }
    }

    hideReason(){
        this.isDisplaedReason = false;

        this.modal = {
            title: '',
            content: ''
        }
    }

    hasSufficientPoints(survey){
        var points = this.$scope.user.getSurveyPoints(),
            cost = survey.cost;

        return points >= cost ? true : false;
    }

    withdraw(survey){
        if (!this.hasSufficientPoints(survey)) {
            this.paymentModal.show(survey).then((response)=>{
                angular.bind(this, successRequest)();
            });
        } else {
            angular.bind(this, successRequest)();
        }

        function successRequest() {
            this.API.withdraw(survey.id)
                .then((data) => {
                    var indexSurvey = _.indexOf(this.list, survey);

                    if (indexSurvey !== -1) this.list[indexSurvey] = data;

                    return data;
                })
                .then((data) => {
                    return this.User.getUser();
                })
            ;
        }
    }

    suspend(survey){
        this.API.suspend(survey.id).then((data)=>{
            var indexSurvey = _.indexOf(this.list, survey);

            if (indexSurvey !== -1) this.list[indexSurvey] = data;
        });
    }

    delete(survey){
        if (survey.status.code === 'ACTIVE') {
            this.showReason(survey, 'Delete action is not available for a live survey', 'Message');
        } else {
            var modalInstance = this.$modal.open({
                template: confirmTmpl,
                controller: confirmCtrl,
                size: 'sm',
                resolve: {
                    title: function () {
                        return 'Confirm';
                    },
                    content: function () {
                        return 'Are you sure you want to delete this item?';
                    }
                }
            });

            modalInstance.result.then(()=>{
                this.API.delete(survey.id).then((data)=>{
                    var indexSurvey = _.indexOf(this.list, survey);

                    if (indexSurvey !== -1) this.list.splice(indexSurvey, 1);
                });
            });
        }
    }

    resume(survey){
        this.API.resume(survey.id).then((data)=>{
            var indexSurvey = _.indexOf(this.list, survey);

            if (indexSurvey !== -1) this.list[indexSurvey] = data;
        });
    }

    submit(survey){
        this.API.submit(survey.id).then((data)=>{
            var indexSurvey = _.indexOf(this.list, survey);

            if (indexSurvey !== -1) this.list[indexSurvey] = data;
        });
    }

    downloadResults(survey, format){
        this.API.downloadResults(survey.id, format).then((content)=>{
            var title = survey.title.split(' ').join('_');

            this.DownloadFile.downloadCSV(title, content);
        });
    }
}

export default Controller;
