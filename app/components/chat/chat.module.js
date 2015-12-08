import styles from './assets/styles/chat.scss';
import Controller from './chat.controller.js';
import ModalCtrl from './chat-modal.controller.js';
import factory from './chat.factory.js';

var module = angular
    .module('app.chat', [])
    .controller('Chat', Controller)
    .controller('ChatModal', ModalCtrl)
    .factory('Chat', factory)
;

export default module;