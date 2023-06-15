import { initBuffers } from "./init-buffers.js"
import { drawScene } from "./draw-scene.js"

function main(){
  console.log("mainhjuu")
  const canvas = document.getElementById("canvas")
  // 初始化webgl上下文
  const gl = canvas.getContext("webgl")
  if(!gl){
    alert("无法初始化webgl")
    return
  }
  // 使用完全不透明的黑色清除所有图像
  gl.clearColor(0.0,0.0,0.0,1.0)
  // 商用上面的颜色清除缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT)

  // 顶点着色器
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  // 片段着色器
  const fsSource = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `;
  //  初始化着色器程序，让 WebGL 知道如何绘制我们的数据
  function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // 创建着色器程序
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // 如果创建失败，alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
    return shaderProgram;
  }

  // 创建指定类型的着色器，上传 source 源码并编译
  function loadShader(gl, type, source) {
    // 根据类型创建一个新的着色器
    const shader = gl.createShader(type);
    // 将源码发送到着色器对象
    gl.shaderSource(shader, source);
    // 编译着色器程序
    gl.compileShader(shader);
    // 检查是否编译成功
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // 初始化着色器程序
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    // 存储着色器程序的引用
    program: shaderProgram,
    // 存储顶点属性位置的对象
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
    },
    // 存储uniform变量，这里包含了投影矩阵和模型视图矩阵
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // 初始化缓冲区
  const buffers = initBuffers(gl)
  // 绘制场景
  drawScene(gl,programInfo,buffers)
}
main()
