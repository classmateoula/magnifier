export interface IBounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

const DEFAULE_MAGNIFIER_SCALE = 10;

/**
 * 使用canvas自带api实现放大镜效果
 * @param ctx 放大镜所在画布
 * @param size 背景尺寸
 * @param image 背景图
 * @param bounds 放大区域
 * @param scale 缩放倍数
 */
export function drawSystemMagnifier(
  ctx: CanvasRenderingContext2D,
  size: ISize,
  image: HTMLImageElement,
  bounds: IBounds,
  scale = DEFAULE_MAGNIFIER_SCALE
): void {
  const { x, y, width, height } = bounds;
  const bgScale = getScale(size, image);
  // 开启平滑算法会导致图像模糊
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    image,
    x / bgScale,
    y / bgScale,
    width / bgScale,
    height / bgScale,
    0,
    0,
    width * scale,
    height * scale
  );
}

/**
 * 绘制放大镜
 * @param ctx 放大镜所在画布
 * @param bgCtx 背景所在画布
 * @param bounds 放大位置和尺寸
 * @param scale 缩放倍数
 */
export function drawMagnifier(
  ctx: CanvasRenderingContext2D,
  bgCtx: CanvasRenderingContext2D,
  bounds: IBounds,
  scale = DEFAULE_MAGNIFIER_SCALE
): void {
  const { x, y, width, height } = bounds;
  const imgData = bgCtx.getImageData(x, y, width, height);
  const newImageData = spreadImageData(imgData, scale);
  ctx.putImageData(newImageData, 0, 0);
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

/**
 * 获取缩放倍数 - 自适应 cover
 * @param prevSize 适应尺寸
 * @param currSize 被适应尺寸
 * @returns 缩放值
 */
function getScale(prevSize: ISize, currSize: ISize): number {
  if (prevSize.width > prevSize.height) {
    return prevSize.width / currSize.width;
  } else {
    return prevSize.height / currSize.height;
  }
}
