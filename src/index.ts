interface IState {
  showMagnifier: boolean;
}

interface ISize {
  width: number;
  height: number;
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const magnifier = document.getElementById("magnifier") as HTMLCanvasElement;
const magCtx = magnifier.getContext("2d")!;

const magnifier2 = document.getElementById("magnifier2") as HTMLCanvasElement;
const mag2Ctx = magnifier2.getContext("2d")!;
// 开启平滑算法会导致图像模糊
mag2Ctx.imageSmoothingEnabled = false;

const app = document.getElementById("app")!;

let canvasImg: HTMLImageElement;

let showMagnifier = false;

const state: IState = {
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
      } else {
        app.style.display = "block";
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

function handleLoad(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  drawImageByUrl("/bg.jpeg");
}


function handleChangeFile(e: any): void {
  const file = e.files[0];
  const b = new Blob([file]);
  const url = URL.createObjectURL(b);
  drawImageByUrl(url);
}

function handleMouseDown(): void {
  state.showMagnifier = false;
}

function handleStart() {
  state.showMagnifier = true;
}

function handleMouseMove(e: MouseEvent): void {
  if (!state.showMagnifier) {
    return;
  }
  const { pageX, pageY } = e;
  const left = pageX - 9;
  const top = pageY - 9;
  const size = 19;
  window.requestAnimationFrame(() => {
    const imgData = ctx.getImageData(left, top, size, size);
    const newImageData = spreadImageData(imgData, 10);
    // 新版扩散
    magCtx.putImageData(newImageData, 0, 0);
    const scale = getScale(canvas, canvasImg);
    // 系统缩放
    mag2Ctx.drawImage(
      canvasImg,
      left / scale,
      top / scale,
      size / scale,
      size / scale,
      0,
      0,
      size * 10,
      size * 10
    );
  });
}

function getScale(prevSize: ISize, currSize: ISize): number {
  if (prevSize.width > prevSize.height) {
    return prevSize.width / currSize.width;
  } else {
    return prevSize.height / currSize.height;
  }
}

function drawImageByUrl(url: string): void {
  const img = new Image();
  img.src = url;
  img.onload = () => {
    const scale = getScale(canvas, img);
    ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
    handleStart();
    canvasImg = img;
  };
}

function spreadImageData(imgData: ImageData, ratio: number): ImageData {
  const { width, height, data } = imgData;
  const result = new ImageData(width * ratio, height * ratio);
  const { width: rw, data: rData } = result;
  // 把源数据一个像素点填充到目标的10个像素点上，达到把图像放大10倍的目的
  for (let sourceRowIndex = 0; sourceRowIndex < height; sourceRowIndex++) {
    for (
      let sourceColumnIndex = 0;
      sourceColumnIndex < width;
      sourceColumnIndex++
    ) {
      const sourcePixelIndex = (sourceRowIndex * width + sourceColumnIndex) * 4;
      const [r, g, b, a] = [
        data[sourcePixelIndex],
        data[sourcePixelIndex + 1],
        data[sourcePixelIndex + 2],
        data[sourcePixelIndex + 3],
      ];
      for (let resultRowIndex = 0; resultRowIndex < ratio; resultRowIndex++) {
        const resultPixelIndex = sourceRowIndex * ratio + resultRowIndex;
        for (
          let resultColumnIndex = 0;
          resultColumnIndex < ratio;
          resultColumnIndex++
        ) {
          const resultDataIndex =
            (resultPixelIndex * rw +
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
