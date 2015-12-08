var factory = function(){

    var service = {
        getEmptyLogic: getEmptyLogic,
        isValidLogic: isValidLogic,
        addLogicToQuestion: addLogicToQuestion,
        getEmptyRating: getEmptyRating,
        haveLogic: haveLogic,
        getLogicFromQuestion: getLogicFromQuestion,
        removeLogicOfQuestionByIndex: removeLogicOfQuestionByIndex
    };

    return service;
    /////////////////////

    function getEmptyLogic(){
        return {
            'rule': '', // json string like as {redirect:5,skip:[3,4],end:1}
            'collation': '', // EQ|NE|GT|GTE|LT|LTE|CN|NCN
            'value': '' // value for witch the rule will be applied
        };
    }

    function getEmptyRating(){
        return {
            'GT': null,
            'LT': null,
            'EQ': null
        };
    }

    function isValidLogic(logic){
        var isValid = true;

        if (angular.isString(logic)) {
            if (logic !== 'go to next question' && logic !== 'end survey') {
                isValid = false;
            }
        } else if (angular.isObject(logic)) {
            if (! logic.hasOwnProperty('index')) {
                isValid = false;
            }
        } else {
            isValid = false;
        }

        return isValid;
    }

    function addLogicToQuestion(question, data, rating) {
        angular.forEach(data, (value, key)=>{
            if (! isValidLogic(value)) return;
        });

        for (let key in data){
            var existingRule = null,
                indexOfLogic = -1;

            if (question.type === 'rating'){
                existingRule = _.find(question.logic, (item)=>{ return item.value === rating && item.collation === key });
            } else {
                existingRule = _.find(question.logic, (item)=>{ return item.value === key });
            }

            if (existingRule){
                indexOfLogic = _.indexOf(question.logic, existingRule);
            };

            if (angular.isObject(data[key])){
                var currentRule = {
                    rule: `{ "redirect": "${data[key].index}" }`,
                    value: question.type === 'rating' ? rating : key,
                    event: key === 'SKIP' ? 'SKIP' : 'SUBMIT'
                };

                if ( question.type === 'rating' ) {
                    currentRule.collation = key;
                }

                // SKIP rule may have value & collation, assume it is 'SKIP' & 'NE'
                if (key === 'SKIP') {
                    if (currentRule.value) currentRule.value = key;
                    if (currentRule.collation) currentRule.collation = 'NE';
                }

                if (indexOfLogic !== -1){
                    question.logic[indexOfLogic] = currentRule;
                } else {
                    question.logic.push(currentRule);
                }
            } else {
                switch (data[key]) {
                case 'go to next question':
                    if (indexOfLogic !== -1){
                        question.logic.splice(indexOfLogic, 1);
                    };
                    break;
                case 'end survey':
                    var currentRule = {
                        rule: '{ "end": 1 }',
                        value: question.type === 'rating' ? rating : key,
                        event: key === 'SKIP' ? 'SKIP' : 'SUBMIT'
                    };

                    if ( question.type === 'rating' ) {
                        currentRule.collation = key;
                    }

                    // SKIP rule may have value & collation, assume it is 'SKIP' & 'NE'
                    if (key === 'SKIP') {
                        if (currentRule.value) currentRule.value = key;
                        if (currentRule.collation) currentRule.collation = 'NE';
                    }

                    if (indexOfLogic !== -1){
                        question.logic[indexOfLogic] = currentRule;
                    } else {
                        question.logic.push(currentRule);
                    };
                    break;
                }
            }
        }
    }

    function haveLogic(question) {
        return question.logic && question.logic.length;
    }

    function getLogicFromQuestion(questions, question) {
        var logicResult = {
            currentLogic: [],
            rating: null
        }

        /* repeatable code was moved to this function */
        function setLogicResult(data, questions, key, logicResult, setRating) {
            var placeholder = null,
                rule = angular.fromJson(data.rule);

            if (rule.hasOwnProperty('end') && rule.end) {
                placeholder = 'end survey';
            } else if (rule.hasOwnProperty('redirect')){
                placeholder = _.find(questions, (question)=>{ return question.index === rule.redirect });
            }
            if (setRating)
                logicResult.rating = data.value;
            logicResult.currentLogic[key] = placeholder;
        }

        switch (question.type){
        case 'rating':
            // set SKIP rile
            var data_0 = _.find(question.logic, (logicValue, logicKey)=>{
                return logicValue.value === 'SKIP';
            });
            if (angular.isObject(data_0)){
                setLogicResult(data_0, questions, 'SKIP', logicResult)
            }

            // set rule for EQ|GT|LT collations
            _.each(getEmptyRating(), (value, key)=>{
                var data_1 = _.find(question.logic, (logicValue, logicKey)=>{
                    return logicValue.collation === key;
                });
                if (angular.isObject(data_1)){
                    setLogicResult(data_1, questions, key, logicResult, true)
                }
            });
            break;
        case 'choice':
            // set SKIP rile
            var data_0 = _.find(question.logic, (logicValue, logicKey)=>{
                return logicValue.value === 'SKIP';
            });
            if (angular.isObject(data_0)){
                setLogicResult(data_0, questions, 'SKIP', logicResult)
            }

            // set rule for choice
            _.each(question.items, (value, key)=>{
                var data_1 = _.find(question.logic, (logicValue, logicKey)=>{
                    return parseInt(key, 10) === parseInt(logicValue.value, 10);
                });
                if (angular.isObject(data_1)){
                    setLogicResult(data_1, questions, key, logicResult)
                }
            });
            break;
        default:
            _.each(question.logic, (logicValue, logicKey)=>{
                setLogicResult(logicValue, questions, logicValue.value, logicResult)
            });
            break;
        }
        return logicResult;
    }

    function removeLogicOfQuestionByIndex(questions, index) {
        var pathsToLogic = getKeysToQuestionsWithLogic(questions),
            keysToFindedPaths = [];

        // clear a logic of questions which contain references to question
        if (pathsToLogic.length) {
            // find all paths
            _.each(pathsToLogic, (path, key)=>{
                var logic = questions[path.question].logic[path.logic],
                    rule = angular.fromJson(logic.rule);

                if (rule.redirect && rule.redirect === questions[index].index){
                    keysToFindedPaths.push(key);
                }
            });

            // clear finded logic
            if (keysToFindedPaths.length) {
                _.each(keysToFindedPaths, (key)=>{
                    var path = pathsToLogic[key];

                    questions[path.question].logic.splice(path.logic, 1);
                });
            }

            // empty logic of question
            questions[index].logic = [];
        }
    }

    function getKeysToQuestionsWithLogic(questions) {
        var pathsToLogic = [];

        _.each(questions, (question, indexQuestion)=>{
            if (haveLogic(question)) {
                _.each(question.logic, (logic, indexLogic)=>{
                    pathsToLogic.push({
                        question: indexQuestion,
                        logic: indexLogic
                    });
                });
            }
        });

        return pathsToLogic;
    }
}

export default factory;
