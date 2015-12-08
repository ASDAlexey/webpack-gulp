var factory = function($http, $q, RESOURCE_DOMAIN, logger, dataTransformer){
    const ASK_URL       = `${RESOURCE_DOMAIN}/private/survey/question/ask`;
    const ANSWER_URL    = `${RESOURCE_DOMAIN}/private/survey/question/answer`;
    const SKIP_URL      = `${RESOURCE_DOMAIN}/private/survey/question/skip`;

    var service = {
        getEmptyQuestion: getEmptyQuestion,
        addItemToChoice: addItemToChoice,
        removeItemFromChoice: removeItemFromChoice,
        getItemOfChoice: getItemOfChoice,
        fixSizeOfRating: fixSizeOfRating,
        resetDefaultValuesOfQuestions: resetDefaultValuesOfQuestions,
        canAddLogic: canAddLogic,
        getQuestion: getQuestion,
        answer: answer,
        skip: skip,
        isValidQuestion: isValidQuestion
    };

    return service;
    /////////////////////

    function getEmptyQuestion() {
        return {
            'index': Math.floor((1 + Math.random()) * 0x10000).toString(16),
            'type': 'choice', // text_short|text_long|url|email|image|boolean|rating|choice
            'required': true,
            'title': '',  // title of question
            'content': '', // question content
            'value': '', // question value
            'size': 10, // rating max value
            'resource': null, // question resource
            'randomize': false, // for CHOICE questions only
            'multiple': false, // for CHOICE questions only
            'accept_own': false, // for CHOICE questions only
            'items': [getItemOfChoice(), getItemOfChoice()],
            'logic': []
        };
    }

    function getItemOfChoice(type = 'text', title = ''){
        return {
            'type': type, // text|integer|float|numeric|resource|url|email|mask|regexp
            'resource': null,
            'title': title
        };
    }

    function addItemToChoice(question){
        question.items.push(this.getItemOfChoice());
    }

    function removeItemFromChoice(question, index){
        question.items.splice(index, 1);
    }

    function fixSizeOfRating(question, min = 2, max = 10){
        question.size = Math.max(Math.min(question.size, max), min);
    }

    function resetDefaultValuesOfQuestions(questions){
        angular.forEach(questions, (question)=>{
            var q = angular.copy(question);

            question.size = null;
            question.value = null;
            question.content = null;
            question.items = [];

            switch (question.type) {
                case 'choice':
                    question.items = q.items;
                    break;
                case 'rating':
                    question.size = q.size;
                    break;
                case 'boolean':
                    question.value = q.value;
                    break;
                default:
                    question.content = q.content;
            }
        });
    }

    function canAddLogic(question){
        return question.type === 'choice' || question.type === 'rating' || question.type === 'boolean';
    }

    function getQuestion(surveyId) {
        var deferred = $q.defer();

        $http.get(`${ASK_URL}/${surveyId}`)
            .success(function(data, status, headers, config){
                if (data.meta.errors.length){
                    var message = "";
                    angular.forEach(data.meta.errors, function(value, key){
                        message += `Message: ${value.message}\n`;
                        if(value.property_path){
                            message += `Property path: ${value.property_path}\n`;
                        }
                    });
                    logger.error(`Request failed\n${message}`);

                    deferred.reject(message);
                } else {
                    var response = {
                        subscription: data.meta.subscription,
                        question: (angular.isObject(data.response) && data.response.question) ? data.response.question : null
                    };

                    logger.info(`The question was received`);

                    deferred.resolve(response);
                }
            })
            .error(function(data, status, headers, config){
                var message = `Request failed\nStatus: ${status}\nData: ${data}`;
                logger.error(message);

                deferred.reject(message);
            });

        return deferred.promise;
    }

    function answer(questionId, answer) {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: `${ANSWER_URL}/${questionId}`,
            headers: {'Content-Type': 'multipart/form-data'},
            transformRequest: dataTransformer.transformAnswer,
            data: answer
        }).success(function(data, status, headers, config){
            if (data.meta.errors.length){
                var message = "";
                angular.forEach(data.meta.errors, function(value, key){
                    message += `Message: ${value.message}\n`;
                    if(value.property_path){
                        message += `Property path: ${value.property_path}\n`;
                    }
                });
                logger.error(`Request failed\n${message}`);

                deferred.reject(message);
            } else {
                logger.info(`The answer was saved`);

                deferred.resolve(data.response);
            }
        }).error(function(data, status, headers, config){
            var message = `Request failed\nStatus: ${status}\nData: ${data}`;
            logger.error(message);

            deferred.reject(message);
        });

        return deferred.promise;
    }

    function skip(questionId) {
        var deferred = $q.defer();

        $http.get(`${SKIP_URL}/${questionId}`)
            .success(function(data, status, headers, config){
                if (data.meta.errors.length){
                    var message = "";
                    angular.forEach(data.meta.errors, function(value, key){
                        message += `Message: ${value.message}\n`;
                        if(value.property_path){
                            message += `Property path: ${value.property_path}\n`;
                        }
                    });
                    logger.error(`Request failed\n${message}`);

                    deferred.reject(message);
                } else {
                    logger.info(`The question #${questionId} was skipped`);

                    deferred.resolve(data.response);
                }
            })
            .error(function(data, status, headers, config){
                var message = `Request failed\nStatus: ${status}\nData: ${data}`;
                logger.error(message);

                deferred.reject(message);
            });

        return deferred.promise;
    }

    function isValidQuestion(question) {
        var isValid = true;

        if (question.type === 'rating' && (question.size > 10 || question.size < 2)) isValid = false;

        return isValid;
    }
}

export default factory;
