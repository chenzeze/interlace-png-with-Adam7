let width; // 完整图像宽度，解析IHDR数据块可得
let height; // 完整图像高度，解析IHDR数据块可得
let colors; // 通道数，解析IHDR数据块可得
let bitDepth; // 图像深度，解析IHDR数据块可得
let data; // 完整图像数据
 
let bytesPerPixel = Math.max(1, colors * bitDepth / 8); // 每像素字节数
let pixelsBuffer = Buffer.alloc(bytesPerPixel * width * height, 0xFF); // 用来存放最后解析出来的图像数据
 
// 7次扫描的规则
let startX = [0, 0, 4, 0, 2, 0, 1];
let incX = [8, 8, 8, 4, 4, 2, 2];
let startY = [0, 4, 0, 2, 0, 1, 0];
let incY = [8, 8, 4, 4, 2, 2, 1];
 
let offset = 0; // 记录小图开始位置
 
// 7次扫描
for(let i=0; i<7; i++) {
    // 子图像信息
    let subWidth = Math.ceil((width - startY[i]) / incY[i], 10); // 小图宽度
    let subHeight = Math.ceil((height - startX[i]) / incX[i], 10); // 小图高度
    let subBytesPerRow = bytesPerPixel * subWidth; // 小图每行字节数
    let offsetEnd = offset + (subBytesPerRow + 1) * subHeight; // 小图结束位置
    let subData = data.slice(offset, offsetEnd); // 小图像素数据
 
    // 对小图进行普通的逐行扫描
    let subPixelsBuffer = this.interlaceNone(subData, subWidth, subHeight, bytesPerPixel, subBytesPerRow);
    let subOffset = 0;
 
    // 像素归位
    for(let x=startX[i]; x<height; x+=incX[i]) {
        for(let y=startY[i]; y<width; y+=incY[i]) {
            // 逐个像素拷贝回原本所在的位置
            for(let z=0; z<bytesPerPixel; z++) {
                pixelsBuffer[(x * width + y) * bytesPerPixel + z] = subPixelsBuffer[subOffset++] & 0xFF;
            }
        }
    }
 
    offset = offsetEnd; // 置为下一张小图的开始位置
}
 
return pixelsBuffer;
