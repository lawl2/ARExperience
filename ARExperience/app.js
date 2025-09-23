async function activateXR() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const gl = canvas.getContext("webgl", { xrCompatible: true });

  const scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // luce bianca, intensità 0.6
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 2, 3); // direzione della luce
  scene.add(directionalLight);

  const camera = new THREE.PerspectiveCamera();
  camera.matrixAutoUpdate = false;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: true,
    canvas,
    context: gl
  });
  renderer.autoClear = false;

  const session = await navigator.xr.requestSession("immersive-ar", {
    requiredFeatures: ["hit-test"]
  });
  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

  const referenceSpace = await session.requestReferenceSpace("local");
  const viewerSpace = await session.requestReferenceSpace("viewer");
  const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  // Caricamento del modello GLB
  const loader = new THREE.GLTFLoader();
  let model;
  let modelReady = false;
  //./models/10400971_asm.glb
  //./models/Duck.glb
  loader.load("./models/Duck.glb", gltf => {
    model = gltf.scene;
    model.visible = false;
    model.scale.set(0.2, 0.2, 0.2); // Adatta la scala se necessario
    modelReady = true;
    scene.add(model);
  });

  // Caricamento del reticle
  const reticleLoader = new THREE.GLTFLoader();
  let reticle;
  reticleLoader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", gltf => {
    reticle = gltf.scene;
    reticle.visible = false;
    scene.add(reticle);
  });

  // Posizionamento al tocco
  session.addEventListener("select", () => {
    if (modelReady && reticle.visible) {
      const clone = model.clone();
      clone.position.copy(reticle.position);
      clone.visible = true;
      scene.add(clone);
    }
  });

  const onXRFrame = (time, frame) => {
    session.requestAnimationFrame(onXRFrame);
    gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer);

    const pose = frame.getViewerPose(referenceSpace);
    if (pose) {
      const view = pose.views[0];
      const viewport = session.renderState.baseLayer.getViewport(view);
      renderer.setSize(viewport.width, viewport.height);

      camera.matrix.fromArray(view.transform.matrix);
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);

      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0 && reticle) {
        const hitPose = hitTestResults[0].getPose(referenceSpace);
        reticle.visible = true;
        reticle.position.set(
          hitPose.transform.position.x,
          hitPose.transform.position.y,
          hitPose.transform.position.z
        );
        reticle.updateMatrixWorld(true);
      }

      renderer.render(scene, camera);
    }
  };

  session.requestAnimationFrame(onXRFrame);
}