function drawScene(gl, programInfo, buffers, texture, cubeRotation) {
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

  // 模型视图矩阵
  const modelViewMatrix = mat4.create();
  // 将平移变换应用于给定的矩阵
  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate

  // 将旋转应用于模型视图矩阵  
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation, // amount to rotate in radians
    [0, 0, 1]
  ); // axis to rotate around (Z)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.7, // amount to rotate in radians
    [0, 1, 0]
  ); // axis to rotate around (Y)
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    cubeRotation * 0.3, // amount to rotate in radians
    [1, 0, 0]
  ); // axis to rotate around (X)
  
  // 定义顶点法线矩阵，用于处理当前立方体相对于光源位置法线向量的转换
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix); // 模型视图矩阵求逆
  mat4.transpose(normalMatrix, normalMatrix); // 再转置
  


  // 设置位置属性
  setPositionAttribute(gl, buffers, programInfo);
  // 设置颜色属性
  // setColorAttribute(gl, buffers, programInfo);
  // 设置纹理
  setTextureAttribute(gl, buffers, programInfo);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // 设置法线属性
  setNormalAttribute(gl, buffers, programInfo);

  // 绘制的时候使用自定义程序
  gl.useProgram(programInfo.program);


  // 将投影矩阵和模型视图矩阵传递给着色器程序
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.normalMatrix,
    false,
    normalMatrix
  );


  // 当前活动的纹理单元为纹理单元0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 采样器从0开始采样
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    // 从缓冲区的起始位置开始绘制
    const offset = 0;
    // 图元类型是三角形，
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
  
}

// 告诉webgl如何将位置数组转换为顶点位置属性
function setPositionAttribute(gl, buffers, programInfo) {
  const numComponents = 3;  // 每次迭代取3个值
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

// 告诉 WebGL 如何从缓冲区中提取纹理坐标
function setTextureAttribute(gl, buffers, programInfo) {
  const num = 2; // 每个坐标由 2 个值组成
  const type = gl.FLOAT; // 缓冲区中的数据为 32 位浮点数
  const normalize = false; // 不做标准化处理
  const stride = 0; // 从一个坐标到下一个坐标要获取多少字节
  const offset = 0; // 从缓冲区内的第几个字节开始获取数据
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    num,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

// 告诉webgl如何从缓冲区提取顶点法线属性
function setNormalAttribute(gl, buffers, programInfo) {
  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexNormal,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}
export { drawScene };
