import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export const store = new Vuex.Store({
    state: {
        rooms: [],
        users: [],
        totalUsers: 0,
        user: null,
        chats: [],
        currentRoom: {
            id: '',
            name: "Global Room"
        },
        joinRoom:{},
        passwordModal: false,
        socket: null,
    },
    mutations: {
        setSocket (state,data) {
            state.socket = data;
        },
        setUsers (state, data) {
            state.users = data;
        },
        openPasswordModal (state, data) {
            state.passwordModal = true;
        },
        closePasswordModal (state, data) {
            state.passwordModal = false;
        },
        setRooms (state, data) {
            state.rooms = data;
        },
        appendRooms (state, data) {
            state.rooms.push(data);
        },
        setCurrentRoom (state, data) {
            state.currentRoom = data;
        },
        removeAllChatMessages(state) {
            state.chats = [];
        },
        setChats (state, data) {
            state.chats.push(data);
        },
        setUser (state, data) {
            state.user = data;
        },
        totalUsers (state, total) {
            state.totalUsers = total;
        },
        setJoinRoom(state,data) {
            state.joinRoom = data;
        }
    },
    actions: {
        joinRoomModal({dispatch, commit},data){
            if(data.password){
                data.password = '';
                commit('setJoinRoom',data);
                let passwordModal = M.Modal.init(window.document.querySelector('#get-password'));			
                passwordModal.open();
            }else{
                data.password = '';
                dispatch('joinRoom',data);
            }
        },
        joinRoom({ commit,state,dispatch },data){
            state.socket.emit('joinRoom',data);
        },
        joinedRoom({commit , state},data){
            let passwordModal = M.Modal.init(window.document.querySelector('#get-password'));			
            passwordModal.close();
            commit('removeAllChatMessages')
            commit('setCurrentRoom',data);
        },
        playSound(context,filename){
            var oggSource = '<source src="/public/sounds/'+filename+'.ogg" type="audio/ogg">';
            var embedSource = '<embed hidden="true" autostart="true" loop="false" src="/public/sounds/' + filename +'.mp3">';
            document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + oggSource + embedSource + '</audio>';
        },
        happy: function({ dispatch }){
            dispatch('playSound','aud');
        },
        leaveRoom(context,data){
            context.state.socket.emit('leaveRoom',data);
            let defaultRoom = {
                id: '',
                name: "Global Room"
            };
            context.commit('setCurrentRoom',defaultRoom);
        },
        createRoom({context, state},data){
            state.socket.emit('newRoom',data);
        },
        passwordModal({dispatch, commit},data = true){
            var modal = M.Modal.init(window.document.querySelector('#get-password'));
            if(data){
                modal.open();
                commit('openPasswordModal');
            }else{
                commit('closePasswordModal');
                modal.close();
            }
        },
        openCreateRoomModal({context}) {
            var modal = M.Modal.init(window.document.querySelector('#create-chat'));
            modal.open();
        }
    }
});
