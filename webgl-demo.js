import { initBuffers } from "./init-buffers.js"
import { drawScene } from "./draw-scene.js"

// 创建变量用于跟踪旋转
let cubeRotation = 0.0;
let deltaTime = 0;

// 当视频可以复制到纹理中时将被设置为 true
let copyVideo = false;

// 调用主函数
main()

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
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3); //环境光颜色
      highp vec3 directionalLightColor = vec3(1, 1, 1); //定向光源颜色
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75)); //定向光源的方向向量

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0); //计算视图坐标系法线向量

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0); //计算与环境光方向向量的内积
      vLighting = ambientLight + (directionalLightColor * directional); // 光照强度=环境光+定向光源强度*点积结果
    }
  `;
  // 片段着色器
  const fsSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a); //根据纹理颜色和光照强度计算颜色
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
      vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    },
    // 存储uniform变量，这里包含了投影矩阵和模型视图矩阵
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
      uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
    },
  };

  // 初始化缓冲区
  const buffers = initBuffers(gl)

  // 加载纹理
  // const texture = loadTexture(gl, "juren.jpg"); //使用图片
  const texture = initTexture(gl);
  const video = setupVideo("Firefox.mp4");  //使用视频

  // 调整像素顺序
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  let then = 0;

  // Draw the scene repeatedly
  function render(now) {
    // now为默认参数，系统加载以来的时间
    now *= 0.001;  // convert to seconds
    deltaTime = now - then; // 计算时间差
    then = now; // 更新时间

    // 如果视频准备好了,更新纹理
    if (copyVideo) {
      updateTexture(gl, texture, video);
    }

    // 重新绘制场景
    drawScene(gl, programInfo, buffers, texture, cubeRotation);
    // 更新旋转状态
    cubeRotation += deltaTime
    // 浏览器在每一帧调用render函数
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}


//
// 加载图片纹理
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be downloaded over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  // 将像素数据加载到二维纹理对象中
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );

    // WebGL1 has different requirements for power of 2 images
    // vs. non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // 图像宽高不是2的幂，需要进行处理
      // 水平方向纹理超出范围，使用边缘像素的颜色
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      // 垂直方向纹理超出范围，使用边缘像素的颜色
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      // 缩小过滤方式为线性过滤
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

// 判断元素是否为2的幂次方
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

// 使用视频帧作为纹理
function initTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 因为视频必须通过互联网下载
  // 可能需要一些时间才能准备好
  // 因此在纹理中放置一个像素，以便我们
  // 可以立即使用它。
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // 不透明的蓝色
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );

  // 关闭 mips 并将包裹（wrapping）设置为边缘分割（clamp to edge）
  // 这样无论视频的尺寸如何，都可以正常工作。
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  return texture;
}

// 用视频元素更新纹理
function updateTexture(gl, texture, video) {
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    srcFormat,
    srcType,
    video
  );
}


// 设置视频元素
function setupVideo(url) {
  const video = document.createElement("video");

  let playing = false;
  let timeupdate = false;

  video.playsInline = true;
  video.muted = true;
  video.loop = true;

  // 等待以下两个事件
  // 确保 video 中已有数据

  video.addEventListener(
    "playing",
    () => {
      playing = true;
      checkReady();
    },
    true
  );

  video.addEventListener(
    "timeupdate",
    () => {
      timeupdate = true;
      checkReady();
    },
    true
  );

  video.src = url;
  video.play();

  function checkReady() {
    if (playing && timeupdate) {
      copyVideo = true;
    }
  }

  return video;
}
