(() => {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const bgUrl = "https://magnifier.oulaoula.cn/bg.jpeg";

  const magnifier = document.createElement("canvas");
  magnifier.style.position = "fixed";
  magnifier.style.right = "0";
  magnifier.style.bottom = "0";
  magnifier.width = 190;
  magnifier.height = 190;
  const magCtx = magnifier.getContext("2d");

  document.body.appendChild(magnifier);

  let img;

  drawImageByUrl(ctx, canvas, bgUrl, (res) => {
    img = res;
  });

  canvas.onmousemove = function (e) {
    const { offsetX, offsetY } = e;
    window.requestAnimationFrame(function () {
      const bounds: IBounds = {
        x: offsetX - 9,
        y: offsetY - 9,
        width: 19,
        height: 19,
      };
      // 新版扩散
      drawSystemMagnifier(magCtx, canvas, img, bounds);
    });
  };
})();
