class Controller{
    constructor($scope, $timeout, $state, $modal, Survey, User, TYPES_OF_QUESTIONS, COST_OF_RESPONSE, CATEGORIES_OF_SURVEYS, TYPES_OF_RELATIONSHIP, Question, LogicOfQuestions, preloader, paymentModal, logger){
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$state = $state;
        this.$modal = $modal;
        this.API = Survey;
        this.Question = Question;
        this.Logic = LogicOfQuestions;
        this.User = User;
        this.paymentModal = paymentModal;
        this.TYPES_OF_QUESTIONS = TYPES_OF_QUESTIONS;
        this.COST_OF_RESPONSE = COST_OF_RESPONSE;
        this.CATEGORIES_OF_SURVEYS = CATEGORIES_OF_SURVEYS;
        this.TYPES_OF_RELATIONSHIP = TYPES_OF_RELATIONSHIP;
        this.preloader = preloader;
        this.logger = logger;

        this.model = null;
        this.credits = 0;
        this.usertime = new Date();

        this.errors = {
            title: false,
            category: false,
            questions: false
        };
        this.question = {};
        this.editableQuestion = null;
        this.indexEditableQuestion = null;
        this.currentStep = 1; // 1 | 2 | 3
        this.currentQuestion = null;
        this.tempLogic = [];
        this.ratingValue = null;
        this.currentPaymentStep = 'coupon'; // 'coupon' | 'payment' | 'summary'
        this.paymentCouponStatus = 'not verified'; // 'success' | 'error' | 'not verified'

        this.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

        this.isDisplayedLeftTimeList = false;
        this.isDisplayedRightTimeList = false;
        this.isDisplayedTimeline = false;
        this.isDisplayedFilter = false;
        this.isDisplayedAddQuestion = false;
        this.isNotDisplayingLimitNotification = false;
        this.isEditMode = false;

        this.date_start = {
            date: '',
            time: ''
        };
        this.date_end = {
            date: '',
            time: ''
        };
        this.cities = [];
        this.education = [];
        this.work = [];

        this.model = {
            'title': '',
            'type': 'free', // 'free' | 'pro'
            'distribution': 'ALL', // ALL | REGISTERED
            'points_per_question': 1, // quantity of respondents
            'category': '',
            'filter': {
                'required': false,
                'gender': [], // male|female|other
                'relationship': [], // Single|In a relationship|Engaged|Married|In a civil union|In a domestic partnership|In an open relationship|It's complicated|Separated|Divorced|Widowed
                'age_from': null,
                'age_to': null,
                'cities': [],
                'education': [],
                'work': []
            },
            'respondents': 0,
            'date_start': null,
            'date_end': null,
            'questions': []
        };

        if (this.$state.current.name === 'app.survey.edit') {
            if (!this.$state.params.surveyId) this.$state.go('app.survey.manage');

            this.preloader.requestIsSent('main');
            this.API.getSurveyById(parseInt(this.$state.params.surveyId, 10)).then((data) => {
                if (data.status.code !== 'NEW' && data.status.code !== 'APPROVED' && data.status.code !== 'REJECTED') {
                    this.$state.go('app.survey.manage');
                }

                this.isEditMode = true;
                this.model = data;
                this.cities = this.model.filter.cities;
                this.education =  this.model.filter.education;
                this.work =  this.model.filter.work;
                this.model.questions = _.sortBy(this.model.questions, function(item){
                    return Math.max(parseInt(item.order, 10));
                });

                if (this.model.date_start) {
                    let time = moment(this.convertTimeFromUTC(this.model.date_start), 'YYYY-MM-DD HH:mm:ss');

                    this.date_start = {
                        date: time.format(this.getFormatOfDate()),
                        time: time.format('hh : mm : A')
                    };
                    this.isDisplayedLeftTimeList = true;
                    this.isDisplayedTimeline = true;
                }

                if (this.model.date_end) {
                    let time = moment(this.convertTimeFromUTC(this.model.date_end), 'YYYY-MM-DD HH:mm:ss');

                    this.date_end = {
                        date: time.format(this.getFormatOfDate()),
                        time: time.format('hh : mm : A')
                    };
                    this.isDisplayedRightTimeList = true;
                    this.isDisplayedTimeline = true;
                }

                this.initData();

                this.preloader.responseIsReceived('main');
            }, ()=>{
                this.$state.go('app.survey.manage');
            });
        } else {
            this.initData();
        }
    }

    initData(){
        this.allowedQuestions = this.getListOfAllowedQuestions();
        this.question = this.Question.getEmptyQuestion();

        this.initTimepicker();

        this.ratingValue = null;

        this.$scope.$watch('user.model.wallets', (wallets)=>{
            var wallet = _.findWhere(wallets, {type: 'SURVEY'});
            this.credits = angular.isObject(wallet) ? wallet.value : 0;
        });

        this.$scope.$watchGroup(['survey.currentStep', 'survey.model.type'], (newValue)=>{
            this.resetRespondents();

            if (this.currentStep === 3) {
                this.initSlider();
            }
        });

        this.$scope.$watch('survey.model.type', (newValue, oldValue)=>{
            if (newValue === 'free') {
                this.model.filter.required = false;
            }
        });

        this.$scope.$watchCollection('survey.cities', (newValue, oldValue)=>{
            this.model.filter.cities = _.map(newValue, (item)=>{ return item.text });
        });

        this.$scope.$watchCollection('survey.education', (newValue, oldValue)=>{
            this.model.filter.education = _.map(newValue, (item)=>{ return item.text });
        });

        this.$scope.$watchCollection('survey.work', (newValue, oldValue)=>{
            this.model.filter.work = _.map(newValue, (item)=>{ return item.text });
        });

        this.$scope.$watchGroup(['survey.model.type', 'survey.model.respondents'], (newValue, oldValue)=>{
            this.calcCost();
        });

        this.$scope.$watchCollection(()=>{
            return this.date_start;
        }, (newValue, oldValue)=>{
            if (newValue.date && newValue.time){
                this.model.date_start = this.convertTimeToUTC(newValue.date, newValue.time);
            }
        });

        this.$scope.$watchCollection(()=>{
            return this.date_end;
        }, (newValue, oldValue)=>{
            if (newValue.date && newValue.time){
                this.model.date_end = this.convertTimeToUTC(newValue.date, newValue.time);
            }
        });

        this.$scope.$watch('survey.isDisplayedLeftTimeList', (newValue)=>{
            if (!newValue) {
                this.model.date_start = null;
            }
        });

        this.$scope.$watch('survey.isDisplayedRightTimeList', (newValue)=>{
            if (!newValue) {
                this.model.date_end = null;
            }
        });

        this.$scope.$watchCollection('survey.model.questions', (newValue, oldValue)=>{
            if (this.model.questions.length) {
                this.errors.questions = false;
            }

            this.model.max_path = this.model.questions.length;

            this.calcCost();
        });

        this.$scope.$watchGroup(['survey.model.title', 'survey.model.category'], (newValue, oldValue)=>{
            if (this.model.title || this.model.category || _.indexOf(this.CATEGORIES_OF_SURVEYS, this.model.category) !== -1) {
                this.errors.title = false;
                this.errors.category = false;
            }
        });
    }

    calcCost() {
        this.model.cost = this.model.type === 'free' ? 0 : parseInt(this.model.respondents, 10) * parseInt(this.model.max_path, 10);
    }

    getFormatOfDate() {
        return 'DD-MMM-YY';
    }

    getFormattedTime(time) {
        return moment(time).format(`hh:mmA, ${this.getFormatOfDate()}`);
    }

    switchTypeTo(type){
        switch (type) {
            case 'pro':
                this.model.type = 'pro';
                break;
            case 'free':
                if (this.API.includesLogic(this.model)) {
                    this.showModalOfSwitchingToFree().result.then(()=>{
                        this.model = this.API.resetLogic(angular.copy(this.model));
                        this.model.type = 'free';
                    });
                } else {
                    this.model.type = 'free';
                }
                break;
        }
    }

    showModalOfSwitchingToFree(){
        var switchModalCtrl = function($modalInstance){

            this.yes = function(){
                $modalInstance.close('yes');
            };

            this.no = function(){
                $modalInstance.dismiss('cancel');
            };
        }

        return this.$modal.open({
            templateUrl: 'confirm-reset-logic.html',
            windowClass: 'confirm-modal',
            controller: switchModalCtrl,
            controllerAs: 'modal'
        });
    }

    isAdmin(){
        return this.User.isAdmin();
    }

    changeTypeOfQuestion(question){
        // this is will create question instead of updating because of problems with the Doctrine
        delete question.id;
    }

    openEditQuestion($index){
        if (!this.editableQuestion){
            this.isDisplayedAddQuestion = false;
            this.editableQuestion = _.extend(this.Question.getEmptyQuestion(), angular.copy(this.model.questions[$index]));
            this.indexEditableQuestion = $index;
        } else {
            this.closeEditQuestion();
        }
    }

    toggleAddQuestion(){
        this.isDisplayedAddQuestion = !this.isDisplayedAddQuestion;
        if (this.isDisplayedAddQuestion) {
            this.closeEditQuestion();
        }
    }

    closeEditQuestion(){
        this.editableQuestion = null;
        this.indexEditableQuestion = null;
    }

    saveQuestion($event){
        $event.preventDefault();

        var parentContainer = angular.element($event.currentTarget).closest('.add-question-form-container'),
            isEditForm = parentContainer.hasClass('_edit');

        if (isEditForm) {
            this.model.questions[this.indexEditableQuestion] = angular.copy(this.editableQuestion);

            this.closeEditQuestion();
        } else {
            this.model.questions.push(this.question);

            this.question = this.Question.getEmptyQuestion();
            this.isDisplayedAddQuestion = false;
        }
    }

    getListOfAllowedQuestions(index = 0){
        return this.model.questions.slice(index);
    }

    convertDateAndTime(date, time){
        var t = moment(time, 'hh:mm:A').format('HH:mm:ss'),
            d = moment(date, this.getFormatOfDate()).format('YYYY-MM-DD');

        return `${d} ${t}`;
    }

    convertTimeToUTC(date, time){
        var timezone = moment(this.usertime).utcOffset(),
            t = moment(time, 'hh:mm:A').format('HH:mm:ss'),
            d = moment(date, this.getFormatOfDate()).format('YYYY-MM-DD'),
            z = moment().utcOffset(timezone).format('ZZ');

        return  moment.utc(moment(`${d} ${t} ${z}`, 'YYYY-MM-DD HH:mm:ss ZZ').valueOf()).format();
    }

    convertTimeFromUTC(time){
        let utcTime = moment.utc(time).format(),
            timezone = moment(this.usertime).utcOffset();

        return moment(utcTime).utcOffset(timezone).format('YYYY-MM-DD HH:mm:ss');
    }

    removeQuestion(index){
        if (angular.isNumber(index)){
            // clear a logic of removed question
            this.Logic.removeLogicOfQuestionByIndex(this.model.questions, index);

            // clear a logic of previous question
            if ((index - 1) > -1) {
                this.Logic.removeLogicOfQuestionByIndex(this.model.questions, index - 1);
            }

            // remove question
            this.model.questions.splice(index, 1);
        }
    }

    openEditLogic(question){
        $('.logic-popup').addClass('popup-active');
        $('html').addClass('html-no-scroll');

        this.currentQuestion = question;
        var index = this.getIndexOfQuestion(this.currentQuestion);
        this.allowedQuestions = this.getListOfAllowedQuestions(index + 1);

        var logic = this.Logic.getLogicFromQuestion(this.model.questions, this.currentQuestion);

        this.tempLogic = logic.currentLogic;
        this.ratingValue = logic.rating;
    }

    saveLogic(){
        var question = this.model.questions[this.getIndexOfQuestion(this.currentQuestion)],
            rating = question.type === 'rating' ? this.ratingValue : null;

        this.Logic.addLogicToQuestion(question, this.tempLogic, rating);

        this.closePopup();
    }

    getTypeQuestion(question){
        return _.find(this.TYPES_OF_QUESTIONS, (type)=>{
            return type.value === question.type;
        });
    }

    getIndexOfQuestion(question){
        var index = _.indexOf(this.model.questions, question);

        return index;
    }

    nextStep(){
        if (this.API.isValidSurvey(this.model)) {
            this.currentStep++;

            if (this.currentStep === 2 && this.model.type === 'pro') {
                this.isDisplayedFilter = this.isEditMode ? this.model.filter.required : true;
                this.model.filter.required = this.isEditMode ? this.model.filter.required : true;
            }
        } else {
            if (!this.model.title || !this.model.category || _.indexOf(this.CATEGORIES_OF_SURVEYS, this.model.category) === -1) {
                this.logger.error('Title/category is a required field');
                this.errors.title = true;
                this.errors.category = true;
            }

            if (!this.model.questions.length) {
                this.logger.error('Required at least one question.');
                this.errors.questions = true;
            }
        }
    }

    backStep(){
        this.currentStep--;
    }

    showHelpPopup($event){
        angular.element($event.target).next().addClass('show-why-disab');
    }

    hideHelpPopup($event){
        angular.element($event.target).parent().removeClass('show-why-disab');
    }

    openAddLogic(question){
        $('.logic-popup').addClass('popup-active');
        $('html').addClass('html-no-scroll');

        this.currentQuestion = question;
        this.allowedQuestions = this.getListOfAllowedQuestions(this.getIndexOfQuestion(this.currentQuestion) + 1);
        this.tempLogic = [];
        this.ratingValue = null;
    }

    closePopup(){
        $('.popup').removeClass('popup-active');
        $('html').removeClass('html-no-scroll');

        // reset popup variables
        this.currentQuestion = null;
        this.allowedQuestions = this.getListOfAllowedQuestions();
        this.tempLogic = [];
        this.ratingValue = null;
        this.currentPaymentStep = 'coupon';
        this.paymentCouponStatus = 'not verified';
    }

    openConfirmationPopup(){
        $('.popup.confirmation-popup').addClass('popup-active');
        $('html').addClass('html-no-scroll');
    }

    openPaymentPopup(){
        $('.popup').removeClass('popup-active');
        $('.popup.p-payment').addClass('popup-active');
        $('html').addClass('html-no-scroll');
    }

    toggleUploadBlock($event){
        var $currentBlock = angular.element($event.target).closest('.add-upload-video, .add-upload-img'),
            hasBlockClass = $currentBlock.hasClass('show-upload');

        if (this.model.type === 'pro') {
            angular.element('.add-upload-video, .add-upload-img')
                .removeClass('show-upload')
                .next('.add-upload-block')
                    .removeClass('show-upload-block');

            if (!hasBlockClass) {
                $currentBlock
                    .addClass('show-upload')
                    .next('.add-upload-block')
                        .addClass('show-upload-block');
            }
        }
    }

    initTimepicker() {
        var startTime = ["12", "00", "AM"],
            endTime = ["12", "00", "AM"];

        if (this.model.date_start) {
            let time = this.$scope.user.userHasTimezone() ? moment(this.convertTimeFromUTC(this.model.date_start), 'YYYY-MM-DD HH:mm:ss') : moment.utc(this.model.date_start);

            startTime = [
                time.format('hh'),
                time.format('mm'),
                time.format('A')
            ];
        }

        if (this.model.date_end) {
            let time = this.$scope.user.userHasTimezone() ? moment(this.convertTimeFromUTC(this.model.date_end), 'YYYY-MM-DD HH:mm:ss') : moment.utc(this.model.date_end);

            endTime = [
                time.format('hh'),
                time.format('mm'),
                time.format('A')
            ];
        }

        this.$timeout(()=>{
            $('.l-time-list .timepicker').timepicki({start_time: startTime, on_change: (element)=>{
                var timepicker = angular.element(element),
                    time = `${timepicker.attr('data-timepicki-tim')} : ${timepicker.attr('data-timepicki-mini')} : ${timepicker.attr('data-timepicki-meri')}`;

                this.date_start.time = time;
                this.$scope.$digest();
            }});

            $('.r-time-list .timepicker').timepicki({start_time: endTime, on_change: (element)=>{
                var timepicker = angular.element(element),
                    time = `${timepicker.attr('data-timepicki-tim')} : ${timepicker.attr('data-timepicki-mini')} : ${timepicker.attr('data-timepicki-meri')}`;

                this.date_end.time = time;
                this.$scope.$digest();
            }});
        });
    }

    resetRespondents(){
        var maxVal = this.model.type === 'free' ? 100 : 500,
            defaultRespondents = this.model.type === 'free' ? 50 : 250,
            respondents = this.isEditMode ? this.model.respondents : defaultRespondents;

        respondents = Math.max(0, Math.min(respondents, maxVal));

        this.model.respondents = respondents;

        return respondents;
    }

    initSlider(){
        var respondents = this.model.respondents,
            maxVal = this.model.type === 'free' ? 100 : 500,
            handlerSlide,
            handlerSlideLoad;

        handlerSlide = (o)=>{
            $(`#${o.id}_val`).find(".val").val($(o).mbgetVal());
            this.model.respondents = parseInt($(o).mbgetVal(), 10);
            this.$scope.$digest();
        };

        handlerSlideLoad = (o)=>{
            $(`#${o.id}_val`).find(".val").val(respondents);
            this.model.respondents = respondents;
            this.$scope.$digest();
        };

        this.$timeout(()=>{
            let $targetElement = $(this.model.type === 'free' ? "#ex2 .mb_slider" : "#ex1 .mb_slider");

            $targetElement.mbSlider({
                maxVal: maxVal,
                minVal: 0,
                showVal: true,
                onSlide: handlerSlide,
                onSlideLoad: handlerSlideLoad
            }).mbsetVal(respondents);

            $('#sl1_val input').blur(function(){
                var curVal = parseInt($('.val').val(), 10),
                    maxVal = parseInt($('.mb_sliderEnd').text(), 10);

                if (curVal > maxVal) {
                    $(this).val(maxVal);
                };
            });

            $('.mb_sliderValueLabel').css({display:'none'});
        });
    }

    buyResponses(){
        return this.paymentModal.show(this.model);
    }

    saveSurvey(){
        if (this.API.isValidSurvey(this.model)) {
            this.Question.resetDefaultValuesOfQuestions(this.model.questions);

            this.preloader.requestIsSent('main');
            this.API.save(this.model).then((survey)=>{
                this.$state.go('app.survey.manage');
            }, ()=>{
                this.preloader.responseIsReceived('main');
            });
        }
    }

    launchSurvey(){
        if (this.API.isValidSurvey(this.model)) {
            this.Question.resetDefaultValuesOfQuestions(this.model.questions);

            if (this.credits >= this.model.cost || this.User.isAdmin()) {
                angular.bind(this, launch)();
            } else {
                this.buyResponses().then(()=>{
                    angular.bind(this, launch)();
                });
            }

            function launch() {
                this.preloader.requestIsSent('main');
                this.API.launch(this.model).then((survey)=>{
                    this.$state.go('app.survey.manage');
                }, ()=>{
                    this.preloader.responseIsReceived('main');
                });
            }
        }
    }

    hasLimitReacher(){
        if (this.model.type === 'free' && this.model.questions.length >= 3) {
            this.isDisplayedAddQuestion = false;

            return true;
        }

        return false;
    }
}

export default Controller;
