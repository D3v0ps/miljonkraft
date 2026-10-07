/**
 * Himlen bakom affischen. En ljus dagshimmel i profilens blå toner med mjuka moln,
 * ett varmt sken och solstrålar runt MB-punkten. Ritas bara när något ändras
 * (inledningen, skroll, muspekare eller ny storlek), aldrig i en evig loop.
 * Saknas WebGL syns CSS-gradienten under, som har samma färger.
 */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uT;
uniform float uP;
uniform vec2 uPtr;
uniform vec3 uSun;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float asp=uRes.x/uRes.y;
  float y=uv.y;
  vec3 top=vec3(.682,.796,.843);
  vec3 mid=vec3(.843,.898,.922);
  vec3 low=vec3(.933,.957,.965);
  vec3 col=mix(low,mid,smoothstep(.0,.62,y));
  col=mix(col,top,smoothstep(.55,1.,y));
  col=mix(vec3(1.),col,smoothstep(.0,.42,y));
  vec2 s=uSun.xy/uRes;
  vec2 d=vec2((uv.x-s.x)*asp,uv.y-s.y);
  float r=length(d);
  float sr=uSun.z/uRes.y;
  float glow=exp(-r/(sr*2.2+.0001));
  float halo=exp(-r*r/(sr*sr*9.+.0001));
  float ang=atan(d.y,d.x);
  float rot=uT*.35+uP*.9+uPtr.x*.05;
  float rays=pow(.5+.5*sin(ang*12.+rot+n(vec2(ang*3.,uT))*2.2),5.)*.7+pow(.5+.5*sin(ang*5.-rot*.7),9.)*.6;
  rays*=smoothstep(sr*.95,sr*1.5,r)*exp(-r*1.15)*smoothstep(s.y-.02,s.y+.12,uv.y);
  vec2 cp=vec2(uv.x*asp*1.3+uT*.12+uP*.55+uPtr.x*.04,uv.y*3.4-uP*.4+uPtr.y*.02);
  float c=fbm(cp);
  float c2=fbm(cp*1.9+vec2(4.,1.));
  float cloud=smoothstep(.52,.8,c)*smoothstep(.28,.62,y)*(.55+.45*smoothstep(.4,1.,c2));
  vec3 cloudCol=mix(vec3(1.),mid,smoothstep(.62,.85,c)*.35);
  float k=.35+.65*uT;
  col=mix(col,vec3(1.,.8,.776),glow*.66*k);
  col=mix(col,vec3(1.,.6,.557),halo*.34*k);
  col=mix(col,vec3(1.),rays*.62*uT);
  col=mix(col,cloudCol,cloud*.6*(.4+.6*uT));
  col=mix(col,vec3(1.),smoothstep(.22,.0,y)*.6);
  col+=(h(gl_FragCoord.xy+uT)-.5)/255.;
  gl_FragColor=vec4(col,1.);
}`;

export function startSky(canvas: HTMLCanvasElement, still: boolean) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true });
  if (!gl) return;
  // Mjukvarurendering (utan grafikkort) gör himlen tung för processorn. Då räcker CSS-himlen under.
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader');
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(prog, name);
  const uRes = u('uRes'), uT = u('uT'), uP = u('uP'), uPtr = u('uPtr'), uSun = u('uSun');

  const hero = canvas.closest<HTMLElement>('[data-hero]');
  const sun = document.querySelector<HTMLElement>('[data-sun]');
  const small = window.matchMedia('(max-width: 899.98px)').matches;
  const scale = Math.min(window.devicePixelRatio || 1, 1.5) * (small ? 0.4 : 0.55);
  let t = still ? 1 : 0;
  let p = 0;
  const ptr = { x: 0, y: 0 };
  let w = 0, hgt = 0;
  let visible = true;

  const resize = () => {
    w = Math.max(1, Math.round(canvas.clientWidth * scale));
    hgt = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== hgt) {
      canvas.width = w;
      canvas.height = hgt;
    }
    gl.viewport(0, 0, w, hgt);
  };

  const draw = () => {
    if (!visible) return;
    const cr = canvas.getBoundingClientRect();
    let sx = cr.width * 0.78, sy = cr.height * 0.4, sr = cr.height * 0.12;
    if (sun) {
      const r = sun.getBoundingClientRect();
      sx = r.left + r.width / 2 - cr.left;
      sy = r.top + r.height / 2 - cr.top;
      sr = r.width / 2;
    }
    if (hero) p = Number(getComputedStyle(hero).getPropertyValue('--p')) || 0;
    gl.uniform2f(uRes, w, hgt);
    gl.uniform1f(uT, t);
    gl.uniform1f(uP, p);
    gl.uniform2f(uPtr, ptr.x, ptr.y);
    gl.uniform3f(uSun, sx * scale, (cr.height - sy) * scale, sr * scale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let queued = false;
  const request = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      draw();
    });
  };

  resize();
  const t0 = performance.now();
  draw();
  gl.finish();
  // Är en bild långsam att rita hoppar vi över inledningen och visar bara slutläget.
  const slow = performance.now() - t0 > 24;
  if (slow) {
    t = 1;
    draw();
  }
  canvas.classList.add('is-ready');

  if (!still && !slow) {
    // Inledningen: himlen klarnar under knappt tre sekunder och stannar sedan.
    const start = performance.now();
    const dur = 2800;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      t = 1 - Math.pow(1 - k, 3);
      draw();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    window.addEventListener('mk:scroll', request);
    if (window.matchMedia('(pointer: fine)').matches && hero) {
      hero.addEventListener('pointermove', (e) => {
        ptr.x = e.clientX / window.innerWidth - 0.5;
        ptr.y = e.clientY / window.innerHeight - 0.5;
        request();
      }, { passive: true });
    }
  }

  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) request();
    }).observe(hero);
  }
  new ResizeObserver(() => {
    resize();
    request();
  }).observe(canvas);
  canvas.addEventListener('webglcontextlost', () => canvas.classList.remove('is-ready'));
}
