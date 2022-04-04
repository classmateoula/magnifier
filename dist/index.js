var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var magnifier = document.getElementById("magnifier");
var magCtx = magnifier.getContext("2d");
var magnifier2 = document.getElementById("magnifier2");
var mag2Ctx = magnifier2.getContext("2d");
// 开启平滑算法会导致图像模糊
mag2Ctx.imageSmoothingEnabled = false;
var app = document.getElementById("app");
var canvasImg;
var showMagnifier = false;
var state = {
    showMagnifier: false
};
Object.defineProperties(state, {
    showMagnifier: {
        configurable: true,
        get: function () {
            return showMagnifier;
        },
        set: function (v) {
            if (v) {
                app.style.display = "none";
                magnifier.style.display = "block";
                magnifier2.style.display = "block";
            }
            else {
                app.style.display = "block";
                magnifier.style.display = "none";
                magnifier2.style.display = "none";
            }
            showMagnifier = v;
        }
    }
});
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("load", handleLoad);
function handleLoad() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawImageByUrl("/bg.jpeg");
}
function handleChangeFile(e) {
    var file = e.files[0];
    var b = new Blob([file]);
    var url = URL.createObjectURL(b);
    drawImageByUrl(url);
}
function handleMouseDown() {
    state.showMagnifier = false;
}
function handleStart() {
    state.showMagnifier = true;
}
function handleMouseMove(e) {
    if (!state.showMagnifier) {
        return;
    }
    var pageX = e.pageX, pageY = e.pageY;
    var left = pageX - 9;
    var top = pageY - 9;
    var size = 19;
    window.requestAnimationFrame(function () {
        var imgData = ctx.getImageData(left, top, size, size);
        var newImageData = spreadImageData(imgData, 10);
        // 新版扩散
        magCtx.putImageData(newImageData, 0, 0);
        var scale = getScale(canvas, canvasImg);
        // 系统缩放
        mag2Ctx.drawImage(canvasImg, left / scale, top / scale, size / scale, size / scale, 0, 0, size * 10, size * 10);
    });
}
function getScale(prevSize, currSize) {
    if (prevSize.width > prevSize.height) {
        return prevSize.width / currSize.width;
    }
    else {
        return prevSize.height / currSize.height;
    }
}
function drawImageByUrl(url) {
    var img = new Image();
    img.src = url;
    img.onload = function () {
        var scale = getScale(canvas, img);
        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
        handleStart();
        canvasImg = img;
    };
}
function spreadImageData(imgData, ratio) {
    var width = imgData.width, height = imgData.height, data = imgData.data;
    var result = new ImageData(width * ratio, height * ratio);
    var rw = result.width, rData = result.data;
    // 把源数据一个像素点填充到目标的10个像素点上，达到把图像放大10倍的目的
    for (var sourceRowIndex = 0; sourceRowIndex < height; sourceRowIndex++) {
        for (var sourceColumnIndex = 0; sourceColumnIndex < width; sourceColumnIndex++) {
            var sourcePixelIndex = (sourceRowIndex * width + sourceColumnIndex) * 4;
            var _a = [
                data[sourcePixelIndex],
                data[sourcePixelIndex + 1],
                data[sourcePixelIndex + 2],
                data[sourcePixelIndex + 3],
            ], r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            for (var resultRowIndex = 0; resultRowIndex < ratio; resultRowIndex++) {
                var resultPixelIndex = sourceRowIndex * ratio + resultRowIndex;
                for (var resultColumnIndex = 0; resultColumnIndex < ratio; resultColumnIndex++) {
                    var resultDataIndex = (resultPixelIndex * rw +
                        sourceColumnIndex * ratio +
                        resultColumnIndex) *
                        4;
                    rData[resultDataIndex] = r;
                    rData[resultDataIndex + 1] = g;
                    rData[resultDataIndex + 2] = b;
                    rData[resultDataIndex + 3] = a;
                }
            }
        }
    }
    return result;
}
