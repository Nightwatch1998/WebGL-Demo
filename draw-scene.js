function drawScene(gl, programInfo, buffers) {
  // 用背景色擦除画布
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  // 同时清除颜色缓冲区和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 创建透视矩阵

  // 设置视场角
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  // 设置宽高比
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  // 距离摄像机0.1-100单位的物体可见
  const zNear = 0.1;
  const zFar = 100.0;
  
  // 创建一个4*4的透视矩阵
  const projectionMatrix = mat4.create();

  // 根据参数计算透视矩阵，并保存在第一个参数中
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();
  // 将平移变换应用于给定的矩阵
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate

  // 设置位置属性
  setPositionAttribute(gl, buffers, programInfo);
  // 设置颜色属性
  setColorAttribute(gl, buffers, programInfo);

  // 绘制的时候使用自定义程序
  gl.useProgram(programInfo.program);

  // 将投影矩阵和模型视图矩阵传递给着色器程序
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

// 告诉webgl如何将位置数组转换为顶点位置属性
function setPositionAttribute(gl, buffers, programInfo) {
  const numComponents = 2;  // 每次迭代取两个值
  const type = gl.FLOAT;    // 缓冲区数据为浮点型
  const normalize = false;  // 不进行标准化
  const stride = 0;         // 相邻顶点的字节偏移量
  const offset = 0;         // 相对于顶点数据起始位置的字节偏移量
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  // 指定顶点属性数据如何与顶点缓冲区关联
  gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset);
  // 启用指定顶点属性数组
  gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);
}

// 告诉webgl如何使用顶点颜色属性
function setColorAttribute(gl, buffers, programInfo) {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

export { drawScene };
