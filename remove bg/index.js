const canvas = new fabric.Canvas('canvas', { isDrawingMode: false });
let resultImage = null;

// Load the background image
fabric.Image.fromURL("abcd.avif", function(img) {
  canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
    scaleX: canvas.width / img.width,
    scaleY: canvas.height / img.height
  });
});

canvas.freeDrawingBrush.color = 'white';
canvas.freeDrawingBrush.width = 50;

$('#draw').on('click', function () {
  canvas.isDrawingMode = !canvas.isDrawingMode;
});

$('#remove').on('click', function () {
  canvas.isDrawingMode = false;
  canvas.remove(canvas.getActiveObject());
});

canvas.on('selection:created', function () {
  $('#remove').prop('disabled', false);
});
canvas.on('selection:cleared', function () {
  $('#remove').prop('disabled', true);
});

$('#api').on('click', function () {
  const imageData = canvas.toDataURL({
    format: 'png',
    quality: 1
  });
  removeBgFromImage(imageData);
});

$('#file-input').on('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (f) {
    const data = f.target.result;
    fabric.Image.fromURL(data, function (img) {
      canvas.setWidth(img.width);
      canvas.setHeight(img.height);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height
      });
    });
  };

  reader.readAsDataURL(file);
});

function removeBgFromImage(imageData) {
  const apiKey = 'gS8Rf57nozwmMLFZoJ1W1QYg';
  const base64Data = imageData.split(',')[1];

  fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey
    },
    body: JSON.stringify({
      image_file_b64: base64Data
    })
  })
  .then(response => response.blob())
  .then(blob => {
    resultImage = blob;
    const imageUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = function() {
      URL.revokeObjectURL(imageUrl);
      document.getElementById('result-image').innerHTML = '';
      document.getElementById('result-image').appendChild(img);
      $('#edit').prop('disabled', false);
    };
    img.src = imageUrl;
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

$('#download').on('click', function () {
  if (resultImage) {
    const downloadableBlob = new Blob([resultImage], { type: 'image/png' });
    const downloadableUrl = URL.createObjectURL(downloadableBlob);

    var downloadLink = document.createElement("a");
    downloadLink.href = downloadableUrl;
    downloadLink.download = 'result-image.png';
    downloadLink.click();
    URL.revokeObjectURL(downloadableUrl);
  } else {
    alert('No result image to download. Please process an image first.');
  }
});

$('#edit').on('click', function () {
  if (resultImage) {
    canvas.clear();
    fabric.Image.fromURL(URL.createObjectURL(resultImage), function(img) {
      canvas.add(img);
      canvas.setWidth(img.width);
      canvas.setHeight(img.height);
      resultImage = null;
      $('#download').prop('enabled', true);
      document.getElementById('result-image').innerHTML = '';
      $('#edit').prop('disabled', true);
    });
  }
});
