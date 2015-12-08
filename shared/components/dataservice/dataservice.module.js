import user from './user.factory.js';
import category from './catagory.factory.js';
import product from './product.factory.js';
import gift from './gift.factory.js';
import geo from './geo.factory.js';
import coupon from './coupon.factory.js';
import achievement from './achievement.factory.js';
import welcome from './welcome.factory.js';
import survey from './survey.factory.js';
import transformer from './transformer.service.js';
import question from './question.factory.js';
import logic from './logic.factory.js';
import friend from './friend.factory.js';
import search from './search.factory.js';
import notification from './notification.factory.js';
import invoice from './invoice.factory.js';
import resource from './resource.factory.js';
import order from './order.factory.js';

import errorInterceptor from './error-interceptor.factory.js';

var dataservice = angular
    .module('dataservice', [])

    .constant('RESOURCE_DOMAIN', function(){
        return window.location.hostname === 'localhost.jellychip.com' ?  window.location.protocol + '//api.test.jellychip.com' + ':' + window.location.port : window.location.protocol + '//api.' + window.location.hostname + ':' + window.location.port;
    }())
    .constant('TYPES_OF_QUESTIONS', getAllowedTypesOfQuestions())
    .constant('CATEGORIES_OF_SURVEYS', getCategoriesOfSurveys())
    .constant('STATUSES_OF_SURVEYS', getStatusesOfSurveys())
    .constant('TYPES_OF_RELATIONSHIP', getTypesOfRelationship())
    .constant('ROLES', getRolesOfUsers())

    .service('dataTransformer', transformer)

    .factory('User', user)
    .factory('Category', category)
    .factory('Product', product)
    .factory('Gift', gift)
    .factory('Geo', geo)
    .factory('Coupon', coupon)
    .factory('Achievement', achievement)
    .factory('Welcome', welcome)
    .factory('Survey', survey)
    .factory('Question', question)
    .factory('LogicOfQuestions', logic)
    .factory('Friend', friend)
    .factory('Search', search)
    .factory('Notification', notification)
    .factory('Invoice', invoice)
    .factory('Resource', resource)
    .factory('Order', order)

    .factory('errorInterceptor', errorInterceptor)

    .config(configure)
;

function configure($httpProvider) {
    $httpProvider.interceptors.push('errorInterceptor');
}

function getAllowedTypesOfQuestions(){
    return [
        {
            title: 'Yes/No',
            value: 'boolean',
            access: 'free'
        }, {
            title: 'Multiple choice',
            value: 'choice',
            access: 'free'
        }, {
            title: 'Short text',
            value: 'text_short',
            access: 'free'
        }, {
            title: 'Long text',
            value: 'text_long',
            access: 'free'
        }, {
            title: 'Rating',
            value: 'rating',
            access: 'free'
        }, {
            title: 'Email input',
            value: 'email',
            access: 'pro'
        }, {
            title: 'Website input',
            value: 'url',
            access: 'pro'
        }
    ];
}

function getCategoriesOfSurveys(){
    return [
        "Business",
        "Entertainment",
        "Lifestyle"
    ];
}

function getStatusesOfSurveys() {
    return [
        {
            title: 'Draft',
            code: 'NEW',
            color: 'grey'
        }, {
            title: 'Approved, awaiting start',
            code: 'APPROVED',
            color: 'yellow'
        }, {
            title: 'Submitted',
            code: 'WAITING_FOR_MODERATION',
            color: 'yellow'
        }, {
            title: 'Rejected see notes',
            code: 'REJECTED',
            color: 'red'
        }, {
            title: 'Live',
            code: 'ACTIVE',
            color: 'blue'
        }, {
            title: 'Suspended',
            code: 'SUSPENDED',
            color: 'grey'
        }, {
            title: 'Completed',
            code: 'COMPLETED',
            color: 'green'
        }, {
            title: 'Stopped',
            code: 'STOPPED',
            color: 'grey'
        }
    ];
}

function getTypesOfRelationship() {
    return [
        "Single",
        "In a relationship",
        "Engaged",
        "Married",
        "In a civil union",
        "In a domestic partnership",
        "In an open relationship",
        "It's complicated",
        "Separated",
        "Divorced",
        "Widowed"
    ];
}

function getRolesOfUsers() {
    return {
        'ANONYM': 'IS_AUTHENTICATED_ANONYMOUSLY',
        'USER': 'ROLE_USER',
        'ADMIN': 'ROLE_ADMIN'
    };
}

export default dataservice;
