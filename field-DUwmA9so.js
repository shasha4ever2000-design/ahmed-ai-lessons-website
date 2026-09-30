import{a as e,i as t,n,r}from"./shapes-DTd7TruQ.js";import{t as i}from"./boot-CPuI4Pmg.js";import{S as a,g as o,i as s,o as c,r as l,t as u,x as d,y as f}from"./three.module-DJc3Ov2s.js";var p={wave:0,globe:1,helix:2,grid:3},m=1.4,h={dark:[`#8b93ff`,`#3cc6b4`,`#f5b971`],light:[`#4f46e5`,`#0b7a6e`,`#b45309`]},g=`
  attribute vec2 aBase;
  attribute vec3 aGlobe;
  attribute vec3 aHelix;
  attribute vec3 aGrid;
  attribute float aU;
  attribute float aRand;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerOn;
  uniform vec3 uRipple;
  uniform float uFrom;
  uniform float uTo;
  uniform float uMix;
  uniform float uOffset;
  uniform float uSize;
  uniform float uPR;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  varying vec3 vColor;
  varying float vFade;

  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c); }
  vec3 rotX(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c); }

  vec3 shapePos(float index) {
    float a = uTime * 0.12;
    if (index < 0.5) {
      float x = aBase.x, z = aBase.y;
      float y = -3.0 + 0.55 * sin(x * 0.32 + uTime * 0.7) + 0.45 * cos(z * 0.38 + uTime * 0.55);
      vec2 d = vec2(x, z) - uPointer;
      y += uPointerOn * 1.1 * exp(-dot(d, d) * 0.06);
      float age = uTime - uRipple.z;
      if (age > 0.0 && age < 3.0) {
        float rd = length(vec2(x, z) - uRipple.xy);
        y += sin(rd * 1.3 - age * 7.0) * exp(-rd * 0.25) * (1.0 - age / 3.0) * 0.9;
      }
      return vec3(x, y, z);
    }
    if (index < 1.5) return rotY(aGlobe, a) + vec3(6.5 * uOffset, 1.2, -3.0);
    if (index < 2.5) return rotX(aHelix, a * 3.0) + vec3(0.0, 0.6, -2.0);
    vec3 g = aGrid;
    return vec3(g.x + 5.0 * uOffset, g.z * -0.55 - 0.4 + sin(uTime + g.x * 0.4) * 0.08, g.z * 0.8 - 1.0);
  }

  void main() {
    float k = smoothstep(aRand * 0.35, aRand * 0.35 + 0.65, uMix);
    vec3 pos = mix(shapePos(uFrom), shapePos(uTo), k);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPR * (14.0 / -mv.z);
    vColor = aU < 0.6 ? mix(uC1, uC2, aU / 0.6) : mix(uC2, uC3, (aU - 0.6) / 0.4);
    vFade = clamp(1.0 - (-mv.z - 6.0) / 22.0, 0.12, 1.0);
  }
`,_=`
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vFade * uOpacity);
  }
`;function v(v,y){let b=new u({canvas:v,antialias:!1,alpha:!0,powerPreference:`high-performance`});b.debug.onShaderError=()=>y.onFail?.();let x=Math.min(window.devicePixelRatio||1,y.tier===`phone`?1.5:1.75);b.setPixelRatio(x);let S=new d,C=new o(50,1,.1,100);C.position.set(0,3.2,15);let{cols:w,rows:T}=i(y.tier),E=w*T,D=r(w,T),O=new Float32Array(E),k=new Float32Array(E);for(let e=0,t=0;e<T;e++)for(let e=0;e<w;e++,t++)O[t]=w>1?e/(w-1):0,k[t]=Math.sin(t*12.9898)*43758.5453%1,k[t]<0&&(k[t]+=1);let A=new s;A.setAttribute(`position`,new l(new Float32Array(E*3),3)),A.setAttribute(`aBase`,new l(D,2)),A.setAttribute(`aGlobe`,new l(n(E),3)),A.setAttribute(`aHelix`,new l(t(E),3)),A.setAttribute(`aGrid`,new l(e(E),3)),A.setAttribute(`aU`,new l(O,1)),A.setAttribute(`aRand`,new l(k,1));let j={uTime:{value:0},uPointer:{value:[0,0]},uPointerOn:{value:0},uRipple:{value:[0,0,-10]},uFrom:{value:0},uTo:{value:0},uMix:{value:1},uOffset:{value:y.tier===`phone`?.25:1},uSize:{value:y.tier===`phone`?2.8:3.3},uPR:{value:x},uOpacity:{value:.85},uC1:{value:new c},uC2:{value:new c},uC3:{value:new c}},M=new a({uniforms:j,vertexShader:g,fragmentShader:_,transparent:!0,depthWrite:!1}),N=new f(A,M);N.frustumCulled=!1,S.add(N);let P=e=>{let[t,n,r]=h[e];j.uC1.value.set(t),j.uC2.value.set(n),j.uC3.value.set(r),M.blending=e===`dark`?2:1,j.uOpacity.value=(e===`dark`?.85:.5)*y.intensity,M.needsUpdate=!0};P(y.theme);let F=-1,I=null,L=0,R=e=>{let t=p[e];t!==j.uTo.value&&(j.uFrom.value=j.uTo.value,j.uTo.value=t,j.uMix.value=0,F=L)},z=()=>{let e=window.innerWidth,t=window.innerHeight;b.setSize(e,t,!1),C.aspect=e/t,C.updateProjectionMatrix()};z();let B=0;return{render(e,t){if(L=e,j.uTime.value=e,F>=0&&(j.uMix.value=Math.min(1,(e-F)/m),j.uMix.value>=1&&(F=-1,I))){let e=I;I=null,R(e)}j.uPointer.value=[t.x*13,-t.y*5],j.uPointerOn.value=t.on,B+=(t.x*.8-B)*.04,C.position.x=B,C.lookAt(0,-.5,0),b.render(S,C)},setShape(e){F>=0?I=e:R(e)},setTheme:P,ripple(e,t,n){j.uRipple.value=[e*13,-t*5,n]},resize:z,warm:()=>b.compileAsync(S,C).then(()=>{},()=>{}),dispose(){A.dispose(),M.dispose(),b.dispose()}}}export{v as createField};