<template>
	<div>
		<video autoplay="true" id="videoElement">
	    </video>
	</div>
     
</template>

<script>
	export default({
		data(){
			return {

			};
		},
		mounted(){
			var video = document.querySelector("#videoElement");
			faceapi = window.faceapi;
			if (navigator.mediaDevices.getUserMedia) {       
			    navigator.mediaDevices.getUserMedia({video: true})
			  .then(function(stream) {
			    video.srcObject = stream;
			  })
			  .catch(function(err0r) {
			    console.log("Something went wrong!");
			  });
			}
			
			const MODEL_URL = '/weights/';
			faceapi.loadSsdMobilenetv1Model(MODEL_URL);
			let fullFaceDescriptions = faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

			fullFaceDescriptions = fullFaceDescriptions.map(fd => fd.forSize(width, height))
			const detectionsArray = fullFaceDescriptions.map(fd => fd.detection)
			faceapi.drawDetection(canvas, detectionsArray, { withScore: true })

		},

	});
</script>