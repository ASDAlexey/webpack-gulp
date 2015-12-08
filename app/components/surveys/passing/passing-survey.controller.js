class Controller{
    constructor($scope, Question, $timeout){
        this.$scope = $scope;
        this.API = Question;
        this.$timeout = $timeout;

        this.shoulShowPreloader = false;
        this.shouldShowTextarea = false;
        this.surveyCompleted = false;
        this.model = null;
        this.question = null;
        this.answer = null;
        this.points = 0;

        this.$scope.$watch('home.currentSurvey', (value)=>{
            if (angular.isObject(value)) {
                this.model = value;
                this.loadQuestion();
            }
        });

        this.$scope.$watchGroup(['survey.shouldShowTextarea', 'config.isKeyboard'], (value)=>{
            this.$timeout(()=>{
                this.rebuildScrollbar();
            }, 300);
        });
    }

    resetOwnAnswer(){
        this.answer.answer = '';

        this.shouldShowTextarea = false;
    }

    changedSurveyHeight(sizes) {
        this.isMinHeight = sizes.height < 250;

        this.$timeout(()=>{
            this.rebuildScrollbar();
        }, 300);
    }

    changeOwnAnswer(){
        if (this.answer.answer && !this.question.multiple) {
            this.answer.items = [];
        }
    }

    resetPositionOfScrollbar(){
        this.$scope.$broadcast('scrollbar:reset:survey');
    }

    loadQuestion(){
        this.shoulShowPreloader = true;

        this.API.getQuestion(this.model.id).then((response)=>{

            if (response.subscription.status === 'COMPLETED') {
                this.surveyCompleted = true;
                this.points = response.subscription.earned;

                // update jelly points and animate them
                _.each(this.$scope.user.model.wallets, (wallet)=>{
                    if (wallet.type === 'JELLY') {
                        wallet.value += this.points;
                    }
                });

                this.$scope.user.updatePoints(this.points);
            } else if (angular.isDefined(response.question)) {
                var question = response.question;

                this.surveyCompleted = false;

                switch (question.type) {
                    case 'choice':
                        this.answer = {
                            items: []
                        };
                        break;
                    default:
                        this.answer = {
                            answer: null
                        }
                };

                if (question.randomize == true) {
                    question.items = _.shuffle(question.items);
                }

                this.$timeout(()=>{
                    this.question = question;
                });
            }

            // fixed bug for iPhone/Chrome
            this.$timeout(()=>{
                this.resetPositionOfScrollbar();

                this.$timeout(()=>{
                    this.shoulShowPreloader = false;
                }, 500);
            }, 200);

            this.resetOwnAnswer();
        });
    }

    toggleOwnAnswer(){
        this.shouldShowTextarea = !this.shouldShowTextarea;

        if (this.shouldShowTextarea){
            this.changeOwnAnswer();
        }
    }

    rebuildScrollbar(){
        this.isMobileVersion = $(window).outerWidth() < 568;

        this.$scope.$broadcast('scrollbar:rebuild:survey');
    }

    nextQuestion(){
        if (this.haveAnswer()){
            this.API.answer(this.question.id, this.answer).then((response)=>{
                this.loadQuestion();
            });
        }
        // this will re-init rate directive for serial rate questions
        this.question.isPassed = true;
    }


    skipQuestion(){
        this.API.skip(this.question.id).then((response)=>{
            this.loadQuestion();
        });
        // this will re-init rate directive for serial rate questions
        this.question.isPassed = true;
    }

    haveAnswer(){
        var isFill = false;

        if (this.question) {
            switch (this.question.type) {
                case 'choice':
                    if (angular.isArray(this.answer.items) && this.answer.items.length) {
                        isFill = true;
                    }

                    if (this.question.accept_own && (this.answer.answer && this.answer.answer.length)) {
                        isFill = true;
                    }

                    break;
                case 'boolean':
                    if (this.answer.answer === 'false' || this.answer.answer === 'true') {
                        isFill = true;
                    }

                    break;
                case 'rating':
                    if (angular.isNumber(this.answer.answer) && this.answer.answer <= this.question.size && this.answer.answer > 0) {
                        isFill = true;
                    }

                    break;
                default:
                    if (this.answer.answer && this.answer.answer.length) {
                        isFill = true;
                    }
            };
        }

        return isFill;
    }
}

export default Controller;
