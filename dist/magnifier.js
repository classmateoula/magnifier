function spreadImageData(imgData, ratio) {
    const { width, height, data } = imgData;
    const result = new ImageData(width * ratio, height * ratio);
    const { width: rw, data: rData } = result;
    // 把源数据一个像素点填充到目标的10个像素点上，达到把图像放大10倍的目的
    for (let sourceRowIndex = 0; sourceRowIndex < height; sourceRowIndex++) {
        for (let sourceColumnIndex = 0; sourceColumnIndex < width; sourceColumnIndex++) {
            const sourcePixelIndex = (sourceRowIndex * width + sourceColumnIndex) * 4;
            const [r, g, b, a] = [
                data[sourcePixelIndex],
                data[sourcePixelIndex + 1],
                data[sourcePixelIndex + 2],
                data[sourcePixelIndex + 3],
            ];
            for (let resultRowIndex = 0; resultRowIndex < ratio; resultRowIndex++) {
                const resultPixelIndex = sourceRowIndex * ratio + resultRowIndex;
                for (let resultColumnIndex = 0; resultColumnIndex < ratio; resultColumnIndex++) {
                    const resultDataIndex = (resultPixelIndex * rw +
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
function getScale(prevSize, currSize) {
    if (prevSize.width > prevSize.height) {
        return prevSize.width / currSize.width;
    }
    else {
        return prevSize.height / currSize.height;
    }
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
function drawSystemMagnifier(ctx, size, image, bounds, scale = DEFAULE_MAGNIFIER_SCALE) {
    const { x, y, width, height } = bounds;
    const bgScale = getScale(size, image);
    // 开启平滑算法会导致图像模糊
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, x / bgScale, y / bgScale, width / bgScale, height / bgScale, 0, 0, width * scale, height * scale);
}
/**
 * 绘制放大镜
 * @param ctx 放大镜所在画布
 * @param bgCtx 背景所在画布
 * @param bounds 放大位置和尺寸
 * @param scale 缩放倍数
 */
function drawMagnifier(ctx, bgCtx, bounds, scale = DEFAULE_MAGNIFIER_SCALE) {
    const { x, y, width, height } = bounds;
    const imgData = bgCtx.getImageData(x, y, width, height);
    const newImageData = spreadImageData(imgData, scale);
    ctx.putImageData(newImageData, 0, 0);
}
/**
 * 使用图片路径绘制背景
 * @param ctx 背景所在画布
 * @param size 背景尺寸
 * @param url 背景地址
 * @param onSuccess 加载并绘制成功后的回调函数
 * @param onError 加载失败后的回调函数
 */
function drawImageByUrl(ctx, size, url, onSuccess, onError) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
        const scale = getScale(size, img);
        ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
        onSuccess?.(img);
    };
    img.onerror = () => {
        onError?.();
    };
}
