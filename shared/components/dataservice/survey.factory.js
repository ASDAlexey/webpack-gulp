var Survey = function($http, $q, $rootScope, RESOURCE_DOMAIN, CATEGORIES_OF_SURVEYS, Question, LogicOfQuestions, logger, dataTransformer){
    const APPROVE_URL      = `${RESOURCE_DOMAIN}/adm/survey/approve`;
    const REJECT_URL       = `${RESOURCE_DOMAIN}/adm/survey/reject`;
    const LIST_URL         = `${RESOURCE_DOMAIN}/adm/survey/list`;
    const GET_URL          = `${RESOURCE_DOMAIN}/adm/survey/get`;

    const SAVE_URL         = `${RESOURCE_DOMAIN}/private/survey/save`;
    const MY_LIST_URL      = `${RESOURCE_DOMAIN}/private/survey/list`;
    const WITHDRAW_URL     = `${RESOURCE_DOMAIN}/private/survey/activate`;
    const SUSPEND_URL      = `${RESOURCE_DOMAIN}/private/survey/suspend`;
    const DELETE_URL       = `${RESOURCE_DOMAIN}/private/survey/delete`;
    const RESUME_URL       = `${RESOURCE_DOMAIN}/private/survey/resume`;
    const SUBMIT_URL       = `${RESOURCE_DOMAIN}/private/survey/submit`;
    const MY_GET_URL       = `${RESOURCE_DOMAIN}/private/survey/get`;
    const SUBSCRIPTION_URL = `${RESOURCE_DOMAIN}/private/survey/subscription/list`;
    const LAUNCH_URL       = `${RESOURCE_DOMAIN}/private/survey/launch`;
    const EDIT_URL         = `${RESOURCE_DOMAIN}/adm/survey/edit`;

    const ANSWERS_URL      = `${RESOURCE_DOMAIN}/public/survey/list`;
    const RESULT_URL       = `${RESOURCE_DOMAIN}/public/survey/result`;

    var surveys = {};

    var service = {
        getSurveys: getSurveys,
        getSurvey: getSurvey,
        approveSurvey: approveSurvey,
        rejectSurvey: rejectSurvey,
        save: save,
        edit: edit,
        launch: launch,
        isValidSurvey: isValidSurvey,
        getMySurveys: getMySurveys,
        getMySubscription: getMySubscription,
        withdraw: withdraw,
        suspend: suspend,
        delete: deleteSurvey,
        resume: resume,
        submit: submit,
        getSurveyById: getSurveyById,
        getCompletedSurveys: getCompletedSurveys,
        getAnswers: getAnswers,
        downloadResults: downloadResults,
        includesLogic: includesLogic,
        resetLogic: resetLogic
    }

    return service;
    /////////////////////

    function getFilterUri(filter){
        var uri = LIST_URL + '?';
        angular.forEach(filter, (value, key)=> {
            if(value && (!value.from && !value.to) && (key != 'order'))
                uri += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
            if(value.from)
                uri += encodeURIComponent(key) + '[from]=' + encodeURIComponent(value.from) + '&';
            if(value.to)
                uri += encodeURIComponent(key) + '[to]=' + encodeURIComponent(value.to) + '&';
            if(key == 'order'){
                angular.forEach(value, (val, k)=>{
                    if(val)
                        uri += 'order[' + encodeURIComponent(k) + ']=' + encodeURIComponent(val) + '&';
                });
            }
        });

        return uri;
    }

    function getMySurveys() {
        var deferred = $q.defer();

        $http.post(MY_LIST_URL)
            .success(function(data, status, headers, config){
                logger.info(`Surveys were received`);

                deferred.resolve(data.response.items);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getMySubscription(limit) {
        var deferred = $q.defer();

        var URL = limit ? `${SUBSCRIPTION_URL}/${limit}` : SUBSCRIPTION_URL;

        $http.get(URL)
            .success(function(data, status, headers, config){
                // logger.info(`Surveys were received`);

                deferred.resolve(data.response.items);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getSurveys(filter){
        var deferred = $q.defer();

        if (surveys[`${filter.offset}`]){
            deferred.resolve(angular.copy(surveys[`${filter.offset}`]));
        } else {

            var uri = getFilterUri(filter);

            $http.get(uri)
                .success(function(data, status, headers, config){
                    surveys[`${filter.offset}`] = data.response;
                    logger.info('Surveys were received');

                    deferred.resolve(data.response);
                })
                .error(function(data, status, headers, config){
                    deferred.reject();
                });
        }

        return deferred.promise;
    }

    function getSurvey(surveyId){
        var deferred = $q.defer();

        $http.get(`${GET_URL}/${surveyId}`)
            .success(function(data, status, headers, config){

                logger.info(`Survey #${surveyId} was received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function approveSurvey(surveyId){
        var deferred = $q.defer();

        $http.post(`${APPROVE_URL}/${surveyId}`)
            .success(function(data, status, headers, config){
                angular.forEach(surveys, (list, key)=>{
                    angular.forEach(list.items, (value, k)=>{
                        if(value.id == data.response.id){
                            value.status = data.response.status;
                        }
                    })
                });

                logger.success(`The survey ${data.response.title} was approved`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function rejectSurvey(surveyId, data){
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: `${REJECT_URL}/${surveyId}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        })
            .success(function(data, status, headers, config){
                angular.forEach(surveys, (list, key)=>{
                    angular.forEach(list.items, (value, k)=>{
                        if(value.id == data.response.id){
                            value.status = data.response.status;
                        }
                    })
                });

                logger.success(`The survey ${data.response.title} was rejected`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function save(survey) {
        var deferred = $q.defer();

        var url = survey.id ? `${SAVE_URL}/${survey.id}` : SAVE_URL;

        $http({
            method: 'POST',
            url: url,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformSurvey,
            data: survey
        }).success(function(data, status, headers, config){
            logger.success(`The survey ${data.response.title} was saved`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function edit(surveyObj) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: `${EDIT_URL}/${surveyObj.id}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformSurvey,
            data: surveyObj
        }).success(function(data, status, headers, config){
            logger.success(`The survey ${data.response.title} was saved`);

            //update cache
            angular.forEach(surveys, (value, key)=>{
                angular.forEach(value.items, (val, k)=>{
                    if(val.id == surveyObj.id) surveys[key].items[k] = data.response;
                });
            });

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function launch(survey) {
        var deferred = $q.defer();

        var url = survey.id ? `${LAUNCH_URL}/${survey.id}` : LAUNCH_URL;

        $http({
            method: 'POST',
            url: url,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformSurvey,
            data: survey
        }).success(function(data, status, headers, config){
            logger.success(`${data.response.title} successfully submitted for approval`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function isValidSurvey(survey){
        var isValid = true;

        if (!survey.title) isValid = false;
        if (!survey.category || _.indexOf(CATEGORIES_OF_SURVEYS, survey.category) === -1 ) isValid = false;
        if (!survey.questions.length) isValid = false;
        if (survey.type === 'free' && survey.questions.length > 3) isValid = false;
        if (survey.type === 'free' && parseInt(survey.respondents, 10) > 100) isValid = false;

        if (isValid) {
            isValid = survey.questions.every((question)=>{
                return Question.isValidQuestion(question);
            });
        }

        return isValid;
    }

    function withdraw(surveyId, reason = '') {
        var deferred = $q.defer();
        var data = {};

        if (reason) {
            data = {
                reason: reason
            };
        }

        $http({
            method: 'POST',
            url: `${WITHDRAW_URL}/${surveyId}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            logger.success(`The survey ${data.response.title} was activated`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function suspend(surveyId, reason = '') {
        var deferred = $q.defer();
        var data = {};

        if (reason) {
            data = {
                reason: reason
            };
        }

        $http({
            method: 'POST',
            url: `${SUSPEND_URL}/${surveyId}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            logger.success(`The survey ${data.response.title} was suspended`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function deleteSurvey(surveyId, reason = '') {
        var deferred = $q.defer();
        var data = {};

        if (reason) {
            data = {
                reason: reason
            };
        }

        $http({
            method: 'POST',
            url: `${DELETE_URL}/${surveyId}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            logger.success(`The survey ${data.response.title} was deleted`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function resume(surveyId, reason = '') {
        var deferred = $q.defer();
        var data = {};

        if (reason) {
            data = {
                reason: reason
            };
        }

        $http({
            method: 'POST',
            url: `${RESUME_URL}/${surveyId}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            logger.success(`The survey ${data.response.title} was activated`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function submit(surveyId, reason = '') {
        var deferred = $q.defer();
        var data = {};

        if (reason) {
            data = {
                reason: reason
            };
        }

        $http({
            method: 'POST',
            url: `${SUBMIT_URL}/${surveyId}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformData,
            data: data
        }).success(function(data, status, headers, config){
            logger.success(`The survey ${data.response.title} was submitted`);

            deferred.resolve(data.response);
        }).error(function(data, status, headers, config){
            deferred.reject();
        });

        return deferred.promise;
    }

    function getSurveyById(surveyId){
        var deferred = $q.defer();

        $http.get(`${MY_GET_URL}/${surveyId}`)
            .success(function(data, status, headers, config){
                logger.info(`The survey #${data.response.id} was received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getCompletedSurveys(offset, limit) {
        var deferred = $q.defer();

        var data = {
            offset: offset || '',
            limit: limit || ''
        };

        $http({
                method: 'POST',
                url: ANSWERS_URL,
                headers: {'Content-Type': 'multipart/form-data'},
                transformRequest: dataTransformer.transformData,
                data: data
            })
            .success(function(data, status, headers, config){
                logger.info(`List of surveys was received`);

                deferred.resolve(data.response.items);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function getAnswers(surveyId) {
        var deferred = $q.defer();

        $http.get(`${RESULT_URL}/${surveyId}`)
            .success(function(data, status, headers, config){
                logger.info(`Answers for the survey #${surveyId} were received`);

                deferred.resolve(data.response);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function downloadResults(surveyId, format = 'csv') {
        var deferred = $q.defer();

        $http.get(`${RESULT_URL}/${surveyId}/${format}`)
            .success(function(data, status, headers, config){
                logger.info(`Answers for the survey #${surveyId} were received`);

                deferred.resolve(data);
            })
            .error(function(data, status, headers, config){
                deferred.reject();
            });

        return deferred.promise;
    }

    function includesLogic(survey){
        return _.some(survey.questions, (question)=>{ return LogicOfQuestions.haveLogic(question) });
    }

    function resetLogic(survey) {
        _.each(survey.questions, function(question){ question.logic = []; });

        return survey;
    }
}

export default Survey;
