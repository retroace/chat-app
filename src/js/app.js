import Vue from 'vue';
import socket from 'socket.io-client'
const faceapi = require('face-api.js');
var fs = require('fs');
window.faceapi = faceapi;
window.socket = socket('localhost:3000');

Vue.component('Dashboard',require('./component/page/Dashboard.vue').default);
Vue.component('FaceDetect',require('./component/FaceDetect.vue').default);

const app = new Vue({
	el: '#app',
})
