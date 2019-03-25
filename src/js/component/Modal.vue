<template>
	<div class="modal">
		<div id="modal1" class="modal">
			<div class="modal-content">
				<slot></slot>	
				<p>A bunch of text</p>
			</div>
			
			<div class="modal-footer">
				<a href="#!" class="modal-close waves-effect waves-green btn-flat">Agree</a>
			</div>
		</div>

	</div>
</template>

<script>
export default({
	props: ['open'],
	data(){
		return {
			modalOpen: false,
		};
	},
	method:{

	},
	watch:{

	}
});


</script>