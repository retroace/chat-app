<template>
    <div id="get-password" class="modal">
        <div class="modal-content">
            <h4>Join Room {{ join.name }}</h4>
            <div class="input-field">
                <label for="passsword">Password</label>
                <input type="password" v-model="join.password">
            </div>
        </div>
        <div class="modal-footer">
            <a href="#!" @click="closeModel()" class="modal-close waves-effect waves-green btn-flat">Close</a>
            <button class="btn" @click="joinRoom(join)">Join Room</button>
        </div>
    </div>
</template>
<script>
export default {
    props: ['room'],
    data(){
        return {
            modal: null,
            join: {
                name: '',
                password: ''
            }
        };
    },
    methods: {
        joinRoom(data){
            this.join.data = room;
            if (room.password) {
                this.join.id = room.id
                this.join.name = room.name

                if (this.join.password == null) {
                    this.passwordModal.open();
                }else{
                    room.password = this.join.password;
                    $store.dispatch('joinRoom',room);
                }
            }else{
                $store.dispatch('joinRoom',room);
            }
        }
    }
}
</script>
