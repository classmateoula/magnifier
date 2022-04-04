const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.onmousemove = function (e) {
    console.log(e.pageX, e.offsetX);
};
const magnifier = document.getElementById("magnifier");
const magCtx = magnifier.getContext("2d");
const magnifier2 = document.getElementById("magnifier2");
const mag2Ctx = magnifier2.getContext("2d");
const app = document.getElementById("app");
let canvasImg;
let showMagnifier = false;
const state = {
    showMagnifier: false,
};
Object.defineProperties(state, {
    showMagnifier: {
        configurable: true,
        get() {
            return showMagnifier;
        },
        set(v) {
            if (v) {
                app.style.display = "none";
                magnifier.style.display = "block";
                magnifier2.style.display = "block";
            }
            else {
                app.style.display = "flex";
                magnifier.style.display = "none";
                magnifier2.style.display = "none";
            }
            showMagnifier = v;
        },
    },
});
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("load", handleLoad);
function handleLoad() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawImageByUrl(ctx, canvas, "/bg.jpeg", (img) => {
        handleStart();
        canvasImg = img;
    });
}
function handleChangeFile(e) {
    const file = e.files[0];
    const b = new Blob([file]);
    const url = URL.createObjectURL(b);
    drawImageByUrl(ctx, canvas, url, (img) => {
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
    const { pageX, pageY } = e;
    window.requestAnimationFrame(() => {
        const bounds = {
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
