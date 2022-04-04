var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var magnifier = document.getElementById("magnifier");
var magCtx = magnifier.getContext("2d");
var magnifier2 = document.getElementById("magnifier2");
var mag2Ctx = magnifier2.getContext("2d");
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
    drawImageByUrl(ctx, canvas, "/bg.jpeg", function (img) {
        handleStart();
        canvasImg = img;
    });
}
function handleChangeFile(e) {
    var file = e.files[0];
    var b = new Blob([file]);
    var url = URL.createObjectURL(b);
    drawImageByUrl(ctx, canvas, url, function (img) {
        handleStart();
        canvasImg = img;
    });
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
    window.requestAnimationFrame(function () {
        var bounds = {
            x: pageX - 9,
            y: pageY - 9,
            width: 19,
            height: 19
        };
        // 新版扩散
        drawMagnifier(magCtx, ctx, bounds);
        // 系统缩放
        drawSystemMagnifier(mag2Ctx, canvas, canvasImg, bounds);
    });
}
