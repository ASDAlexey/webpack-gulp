import answersModalTmpl from './result-modal.tmpl.html';

class Controller{
    constructor($scope, $state, $modal, TYPES_OF_QUESTIONS, Survey, preloader, DownloadFile){
        this.$scope = $scope;
        this.API = Survey;
        this.DownloadFile = DownloadFile;
        this.$modal = $modal;
        this.TYPES_OF_QUESTIONS = TYPES_OF_QUESTIONS;

        this.limitAnswers = 5;
        this.survey = {};
        this.questions = [];
        this.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

        if (!$state.params.surveyId) $state.go('app.answers');

        preloader.requestIsSent('main');
        this.API.getAnswers($state.params.surveyId).then((survey) => {
            this.survey = survey;
            this.questions = survey.questions.items;
            this.orderQuestions();

            // set SEO parameters
            this.$scope.page.title = `${this.survey.title} | JellyChip`;
            this.$scope.page.description = _.pluck(this.questions, 'title').join(', ');
        }, ()=>{
            this.$state.go('app.answers');
        }).finally(()=>{
            preloader.responseIsReceived('main');
        });
    }

    orderQuestions(){
        this.questions = _.sortBy(this.questions, function(item){
            return Math.max(parseInt(item.order, 10));
        });
    }

    getType(type){
        return _.findWhere(this.TYPES_OF_QUESTIONS, { value: type }).title;
    }

    showModal(question){
        this.$modal.open({
            template: answersModalTmpl,
            controller: function Controller($scope, $modalInstance, question) {
                $scope.question = question;
            },
            size: 'lg',
            windowClass: 'answers-modal',
            resolve: {
                question: function () {
                    return question;
                }
            }
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
