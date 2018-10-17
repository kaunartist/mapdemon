class PNGExport {
  function setToolParameters() {
    $('#export-tool-filetype').on('change', function(e) {
      updateToolParameter({'name': 'filetype', 'value': $(this).val()});
    });
    $('#export-tool-filetype').val(tools['export-tool']['params']['filetype']);
  }

  function exportPNG(canvas) {

    var width = tools['export-tool']['params']['width'];
    var height = tools['export-tool']['params']['height'];

    var size = new Size(width, height);
    var raster = terrain.rasterize(300, false);

    var now = new Date();
    var filename = now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + "-dev.png";

    var data = raster.toDataURL();
    var element = document.createElement('a');
    element.setAttribute('href', data);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
  function useExportTool(e) {

    if (e.type == "mousedown") {
      var export_type = tools['export-tool']['params']['filetype'];
      if (export_type == "png") {
        exportPNG(terrain);
      } else if (export_type = "svg") {
        if (lasercanvas == null) {
          exportLaserableSVG(terrain);
        } else {
          clearLaser();
        }
      } else {
        console.log("Incorrect file type");
      }
    }

  }

}
