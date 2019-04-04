import Vue from 'vue';
import socket from 'socket.io-client';
var fs = require('fs');

window.socket = socket('localhost:3000');

Vue.component('Dashboard',require('./component/page/Dashboard.vue').default);
Vue.component('NavBar',require('./component/navbar/Nav.vue').default);

const app = new Vue({
	el: '#app',
})
