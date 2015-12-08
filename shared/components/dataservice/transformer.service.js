class Transformer{
    constructor(){

    }

    getUserFromLinkedIn(response, currentUser){
        var user = {
            information: {}
        };

        var data = response.values[0];

        if (data.id) user.lnkd_id = data.id;
        // if (data.emailAddress) user.email = data.emailAddress;
        if (data.firstName) user.information.firstname = data.firstName;
        if (data.lastName) user.information.lastname = data.lastName;
        if (data.location){
            if (data.location.country){

                if(!currentUser.information.country){
                    user.information.country = data.location.country.code;
                    user.information.state = null;
                    user.information.city = null;
                } else {
                    user.information.country = data.location.country.code;

                    if(currentUser.information.country.id.toLowerCase() == data.location.country.code.toLowerCase()){
                        user.information.state = currentUser.information.state ? currentUser.information.state.id : null;
                        user.information.city = currentUser.information.city ? currentUser.information.city.id : null;
                    } else {
                        user.information.state = null;
                        user.information.city = null;
                    }
                }

            }
        }
        if (data.positions && data.positions.values && data.positions.values[0]){
            user.information.employed = true;
            if (data.positions.values[0].company) user.information.company = data.positions.values[0].company.name;
            if (data.positions.values[0].title) user.information.position = data.positions.values[0].title;
        } else {
            user.information.employed = false;
            user.information.company = null;
            user.information.position = null;
        }

        return user;
    }

    getUserFromFacebook(data, location){
        var user = {
            information: {}
        };

        if (data.id) user.fb_id = data.id;
        // if (data.email) user.email = data.email;
        if (data.first_name) user.information.firstname = data.first_name;
        if (data.last_name) user.information.lastname = data.last_name;
        if (data.gender) user.information.gender = data.gender;
        if (data.birthday) user.information.birthday = moment(data.birthday, 'MM/DD/YYYY').format('YYYY-MM-DD');
        if (data.relationship_status) user.information.relationships = data.relationship_status;
        if (location && location.id && location.country.id && location.district.id){
            user.information.city = location.id;
            user.information.country = location.country.id;
            user.information.state = location.district.id;
        }
        if (data.work){

            user.information.employed = ((data.work[0].employer || data.work[0].position) && angular.isUndefined(data.work[0].end_date)) ? true : false;
            if (data.work[0].employer) user.information.company = data.work[0].employer.name;
            if (data.work[0].position) user.information.position = data.work[0].position.name;
        }
        if (data.education){
            // var colleges = _.filter(data.education, function(item){
            //     return item.type === "College";
            // });
            //
            // var schools = _.filter(data.education, function(item){
            //     return item.type === "High School";
            // });

            // var currentEducation = colleges.length ? colleges[0] : schools[0];
            var currentEducation = data.education[0];

            if (currentEducation.school) user.information.education = currentEducation.school.name;
            if (currentEducation.concentration){
                var degree = '';
                _.each(currentEducation.concentration, function(item){
                    degree += degree === '' ? item.name : `, ${item.name}`;
                });
                user.information.degree = degree;
            }
        }

        return user;
    }

    transformGift(data, headersGetter){
        var formData = new FormData();

        angular.forEach(data, function (value, key) {
            if(key == 'share_icon'){
                key = 'shareIcon';
            }
            if(key !== 'id'){
                var formValue = value === null ? '' : value;
                formData.append(`gift[${key}]`, formValue);
            }
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }

    transformCategory(data, headersGetter){
        var formData = new FormData();

        angular.forEach(data, function (value, key) {
            if(key !== 'id' && key !== 'products') formData.append(`category[${key}]`, value);
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }

    updateUser(data, headersGetter){
        var formData = new FormData();

        angular.forEach(data, function (value, key) {
            if (angular.isObject(value)){
                angular.forEach(value, function(valueOfFirstObject, keyOfFirstObject){
                    if (angular.isObject(valueOfFirstObject)){
                        angular.forEach(valueOfFirstObject, function(valueOfSecondObject, keyOfSecondObject){
                            if (valueOfSecondObject === null){
                                formData.append(`user[${key}][${keyOfFirstObject}][${keyOfSecondObject}]`, '');
                            } else {
                                formData.append(`user[${key}][${keyOfFirstObject}][${keyOfSecondObject}]`, valueOfSecondObject);
                            }
                        });
                    } else {
                        if (valueOfFirstObject === null){
                            formData.append(`user[${key}][${keyOfFirstObject}]`, '');
                        } else {
                            formData.append(`user[${key}][${keyOfFirstObject}]`, valueOfFirstObject);
                        }
                    }
                });
            } else {
                if (value === null){
                    formData.append(`user[${key}]`, '');
                } else {
                    formData.append(`user[${key}]`, value);
                }
            }
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }

    transformUser(data, headersGetter){
        var formData = new FormData();

        angular.forEach(data, function (value, key) {
            if (angular.isObject(value)){
                angular.forEach(value, function(valueOfFirstObject, keyOfFirstObject){
                    if (angular.isObject(valueOfFirstObject)){
                        angular.forEach(valueOfFirstObject, function(valueOfSecondObject, keyOfSecondObject){
                            if (valueOfSecondObject === null){
                                formData.append(`${key}[${keyOfFirstObject}][${keyOfSecondObject}]`, '');
                            } else {
                                formData.append(`${key}[${keyOfFirstObject}][${keyOfSecondObject}]`, valueOfSecondObject);
                            }
                        });
                    } else {
                        if (valueOfFirstObject === null){
                            formData.append(`${key}[${keyOfFirstObject}]`, '');
                        } else {
                            formData.append(`${key}[${keyOfFirstObject}]`, valueOfFirstObject);
                        }
                    }
                });
            } else {
                if (value === null){
                    formData.append(`${key}`, '');
                } else {
                    formData.append(`${key}`, value);
                }
            }
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }

    transformProduct(data, headersGetter){
        var formData = new FormData();

        angular.forEach(data, function (value, key) {
            if(key == 'mobile_image'){
                key = 'mobileImage';
            }

            if(key !== 'id'){
                if ((key === 'category' || key === 'gift') && angular.isObject(value)){
                    formData.append(`product[${key}]`, value.id);
                } else {
                    formData.append(`product[${key}]`, value);
                }
            }
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }

    transformSurvey(data, headersGetter){
        var formData = new FormData();

        function addDataToForm(value, key, path = ''){
            var newPath = path + `[${key}]`;

            if (angular.isObject(value)){
                angular.forEach(value, function(valueOfObject, keyOfObject){
                    addDataToForm(valueOfObject, keyOfObject, newPath);
                });
            } else {
                if (value === null){
                    formData.append(`survey${newPath}`, '');
                } else {
                    formData.append(`survey${newPath}`, value);
                }
            }
        }

        angular.forEach(data, function (value, key) {
            if(key !== 'id'){
                addDataToForm(value, key);
            }
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }

    transformAnswer(data, headersGetter){
        var formData = new FormData();

        function addDataToForm(value, key, path = ''){
            var newPath = path + `[${key}]`;

            if (angular.isObject(value)){
                angular.forEach(value, function(valueOfObject, keyOfObject){
                    addDataToForm(valueOfObject, keyOfObject, newPath);
                });
            } else {
                if (value !== null){
                    formData.append(`answer${newPath}`, value);
                }
            }
        }

        angular.forEach(data, function (value, key) {
            addDataToForm(value, key);
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }

    transformData(data, headersGetter){
        var formData = new FormData();

        angular.forEach(data, function (value, key) {
            // check properties 'lastModified' and 'type' to verify that it is not a file
            if (value.lastModified && value.type) {
                formData.append(key, value);
            } else if (angular.isArray(value) || angular.isObject(value)) {
                angular.forEach(value, function (subValue, subKey) {
                    formData.append(`${key}[${subKey}]`, subValue);
                });
            } else {
                formData.append(key, value);
            }
        });

        var headers = headersGetter();
        delete headers['Content-Type'];

        return formData;
    }
}

export default Transformer;
