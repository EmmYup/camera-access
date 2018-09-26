$(function() {
  var App = {
    init: function() {
      var self = this;
      var cam = null;
      Quagga.CameraAccess.enumerateVideoDevices().then(function(devices) {
        cam = devices.reduce(function(camera, device) {
          console.log('CAMERA: ', camera);
          console.log('DEVICE: ', device);
          return device.label.indexOf('back') < 0
            ? camera.deviceId
            : device.deviceId;
        }, devices[0]);
        console.log('CAM: ', cam);
        Quagga.init(App.state(cam), function(err) {
          if (err) {
            return self.handleError(err);
          }
          //Quagga.registerResultCollector(resultCollector);
          App.initCameraSelection();

          Quagga.start();
        });
      });
    },
    handleError: function(err) {
      console.log(err);
    },

    initCameraSelection: function() {
      var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();
      return Quagga.CameraAccess.enumerateVideoDevices().then(function(
        devices
      ) {
        devices.forEach(function(device) {
          var $option = document.createElement('option');
          $option.value = device.deviceId || device.id;
          $option.selected = streamLabel === device.label;
        });
      });
    },
    state: function(camera) {
      var state = {
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: 'environment',
            aspectRatio: { min: 1, max: 2 },
            deviceId: camera,
          },
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
            {
              format: 'upc_reader',
              config: {},
            },
          ],
        },
        locate: true,
      };
      return state;
    },
    lastResult: null,
  };

  App.init();

  Quagga.onDetected(function(result) {
    var code = result.codeResult.code;
    console.log('CODE RESULT: ', code);
  });
});
