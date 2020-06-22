function rad2deg(radians) {
    return radians * (180 / Math.PI);
}

window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementsByClassName('orientation__canvas')[0];

    const engine = new BABYLON.Engine(canvas, true);
    const createScene = function () {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.FromHexString("#2b3e50");

        // Add HDRI environment for lighting
        const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("../images/test.env", scene);
        hdrTexture.name = "envTex";
        hdrTexture.gammaSpace = false;
        scene.environmentTexture = hdrTexture;

        // Add skybox
        const hdrSkybox = scene.createDefaultSkybox(hdrTexture, true, 10000);
        hdrSkybox.isVisible = true;
        hdrSkybox.material.microSurface = 0.92;

        // Add an Arc Rotate Camera
        const camera = new BABYLON.ArcRotateCamera("Camera", 0.75 * 2 * Math.PI, 0.25 * 2 * Math.PI, 50, BABYLON.Vector3.Zero(), scene);
        scene.imageProcessingConfiguration.exposure = 0.3;
        scene.imageProcessingConfiguration.contrast = 1;
        scene.imageProcessingConfiguration.toneMappingEnabled = true;

        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
        scene.activeCamera.panningSensibility = 0;

        // Prepare for loading meshes
        const assetsManager = new BABYLON.AssetsManager(scene);
        assetsManager.useDefaultLoadingScreen = true;
        engine.loadingUIBackgroundColor = "#2b3e50";


        const headTask = assetsManager.addMeshTask("head", "", "../models/", "head.obj");

        let yaw = 0 * 2 * Math.PI;
        let pitch = 0 * 2 * Math.PI;
        let roll = 0 * 2 * Math.PI;

        headTask.onSuccess = function (task) {
            task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
            task.loadedMeshes[0].rotation = new BABYLON.Vector3(pitch, yaw, roll);

            // Create materials
            const glass = new BABYLON.PBRMaterial("glass", scene);
            glass.reflectionTexture = hdrTexture;
            glass.linkRefractionWithTransparency = true;
            glass.indexOfRefraction = 0.52;
            glass.alpha = 0;
            glass.microSurface = 1;
            glass.reflectivityColor = new BABYLON.Color3(0.2, 0.2, 0.2);
            glass.albedoColor = new BABYLON.Color3(0.85, 0.85, 0.85);
            task.loadedMeshes[0].material = glass;

            // const chrome = new BABYLON.PBRMaterial("chrome", scene);
            // chrome.albedoColor = new BABYLON.Color3(1, 1, 1);
            // chrome.roughness = 0.1;
            // task.loadedMeshes[0].material = chrome;

            scene.registerAfterRender(function () {
                // Simple rotation demo
                yaw -= 0.001;

                // Rotate head
                task.loadedMeshes[0].rotation = new BABYLON.Vector3(pitch, yaw, roll);

                // Display head rotation in submenu
                // Yaw
                document.getElementsByClassName("tracking-data__yaw-value")[0].innerHTML = ((rad2deg(task.loadedMeshes[0].rotation.y) % 360) * -1).toFixed(1) + "°";
                document.getElementsByClassName("tracking-data__yaw-head")[0].style.setProperty('transform', 'rotate(' + rad2deg(yaw) + 'deg)');

                // Pitch
                document.getElementsByClassName("tracking-data__pitch-value")[0].innerHTML = ((((rad2deg(task.loadedMeshes[0].rotation.x) + 180) % 360) - 180).toFixed(1) * -1) + "°";
                +"°";
                document.getElementsByClassName("tracking-data__pitch-head")[0].style.setProperty('transform', 'rotate(' + rad2deg(pitch) + 'deg)');

                // Roll
                document.getElementsByClassName("tracking-data__roll-value")[0].innerHTML = ((((rad2deg(task.loadedMeshes[0].rotation.z) + 180) % 360) - 180).toFixed(1) * -1) + "°";
                +"°";
                document.getElementsByClassName("tracking-data__roll-head")[0].style.setProperty('transform', 'rotate(' + rad2deg(roll) * -1 + 'deg)');
            });
        }

        assetsManager.onFinish = function (tasks) {
            engine.runRenderLoop(function () {
                scene.render();
            });
        };

        assetsManager.load();

        return scene;
    }

    const scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });

    window.addEventListener("resize", function () {
        engine.resize();
    });
});
