import Vue from 'vue';
import socket from 'socket.io-client';
import { store } from './store';
var fs = require('fs');

window.socket = socket('localhost:3000',{transports: ['websocket']});

Vue.component('Dashboard',require('./component/page/Dashboard.vue').default);
Vue.component('NavBar',require('./component/navbar/Nav.vue').default);

const app = new Vue({
	el: '#app',
	store
})
