<template>
    <div class="card horizontal pb-0 justify absolute top w-100">
        <div class="card-content pb-0 teal lighten-1">
            <span id="card-title" v-if="!status" class="white-text">Confused about how to start? Say Hi</span> 
            <span id="card-title" v-else class="white-text">Awesome</span> 
        </div>
        <div class="card-action w-100 pb-0">
            <div class="row">
                <div class="col m6 flex">
                    <div v-if="status" class="teal-text">{{ status }}</div>
                    <p :class="serverErrorClass">{{serverMessages.content}}</p>
                </div>
                <div class="col m6 flex">
                    <div class="p-10 flex hover-yellow" @click="$emit('nav-actions','action-beer')">
                        <i id="beer" class="fa fa-beer action-beer fa-2x icon-padding clickable"></i>
                    </div>
                    <div class="p-10 flex hover-blue" v-show="!sidebar">
                        <i class="fa fa-arrow-right fa-2x icon-padding" @click="$emit('nav-actions','showSidebar')"></i>
                    </div>
                    <div class="p-10 flex hover-yellow">
                        <i id="happy" class="fa fa-smile-o fa-2x icon-padding clickable" @click="happy()"></i>
                    </div>
                    <div class="p-10 flex hover-red">
                        <i id="deleteTrash" class="fa fa-trash-o icon-padding clickable fa-2x" @click="$emit('nav-actions','clear-chat-message')"></i> 
                    </div>
                </div>
            </div>
        </div>
    </div>    
</template>

<script>
export default {
    props: ['sidebar'],
    data(){
        return {
            status: null,
            serverMessages: {
                content: ''
            }
        }
    },
    methods: {
        playSound: function (filename){
            // var mp3Source = '<source src="' + filename + '.mp3" type="audio/mpeg">';
            var oggSource = '<source src="/public/sounds/'+filename+'.ogg" type="audio/ogg">';
            var embedSource = '<embed hidden="true" autostart="true" loop="false" src="/public/sounds/' + filename +'.mp3">';
            document.getElementById("sound").innerHTML='<audio autoplay="autoplay">' + oggSource + embedSource + '</audio>';
        },
        happy: function(){
            this.playSound('aud');
        },
    },
    computed: {
        serverErrorClass(){
            switch (this.serverMessages.type) {
                case 'error':
                    return 'red darken-4 white-text d-inline-block'
                    break;
                case 'success':
                    return 'teal darken-4 white-text d-inline-block'
                    break;
                case 'info':
                    return 'blue darken-4 white-text d-inline-block'
                    break;
                case 'warning':
                    return 'deep-orange darken-4 white-text d-inline-block'
                    break;
            
                default:
                    return 'cyan-orange darken-4 white-text d-inline-block'
                    break;
            }
        }
    }
}
</script>
<style>
    .p-10{
        padding: 10px;
    }
    .hover-blue:hover{
        background: #3456e211;
    }
    .hover-yellow:hover{
        background: #fbe1004a;
    }
    .hover-red:hover{
        background: #ff00004d;
    }
    .pb-0{
        padding-bottom: 0 !important;
    }
</style>