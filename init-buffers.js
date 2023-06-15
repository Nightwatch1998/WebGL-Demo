// 初始化缓冲区
function initBuffers(gl) {
  const positionBuffer = initPositionBuffer(gl);
  const colorBuffer = initColorBuffer(gl)
  return {
    position: positionBuffer,
    color: colorBuffer
  };
}

function initPositionBuffer(gl) {
  // 创建位置缓冲区对象
  const positionBuffer = gl.createBuffer();
  // 绑定缓冲区上下文
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // 创建正方形位置数组
  const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
  // 建立对象的顶点，将位置数组转为浮点型数组
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  return positionBuffer;
}

function initColorBuffer(gl) {
  const colors = [
    1.0,
    1.0,
    1.0,
    1.0, // 白
    1.0,
    0.0,
    0.0,
    1.0, // 红
    0.0,
    1.0,
    0.0,
    1.0, // 绿
    0.0,
    0.0,
    1.0,
    1.0, // 蓝
  ];

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return colorBuffer;
}

export { initBuffers }; 
