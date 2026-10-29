"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* Glass reveal adapted from the supplied 21st.dev component.
 * Shader optics and spring timeline: zanwei/glass-icon-reveal (MIT).
 * Uses our own mark and the surrounding page's actual background colour.
 */
const TEX = 512;
const BOX = 0.75;
type LogoData = { canvas: HTMLCanvasElement; sdf: Float32Array };
const cache = new Map<string, Promise<LogoData>>();

// TinySDF's separable squared Euclidean distance transform.
function edt(grid: Float64Array) {
  const f = new Float64Array(TEX),
    z = new Float64Array(TEX + 1),
    v = new Uint16Array(TEX);
  const pass = (offset: number, stride: number) => {
    v[0] = 0;
    z[0] = -1e20;
    z[1] = 1e20;
    f[0] = grid[offset];
    for (let q = 1, k = 0, s = 0; q < TEX; q++) {
      f[q] = grid[offset + q * stride];
      do {
        const r = v[k];
        s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2;
      } while (s <= z[k] && --k > -1);
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = 1e20;
    }
    for (let q = 0, k = 0; q < TEX; q++) {
      while (z[k + 1] < q) k++;
      grid[offset + q * stride] = f[v[k]] + (q - v[k]) ** 2;
    }
  };
  for (let x = 0; x < TEX; x++) pass(x, TEX);
  for (let y = 0; y < TEX; y++) pass(y * TEX, 1);
}

function loadLogo(src: string) {
  let job = cache.get(src);
  if (!job) {
    job = new Promise<LogoData>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = TEX;
          const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
          const scale =
            (TEX * BOX) / Math.max(img.naturalWidth, img.naturalHeight);
          const w = img.naturalWidth * scale,
            h = img.naturalHeight * scale;
          ctx.drawImage(img, (TEX - w) / 2, (TEX - h) / 2, w, h);
          const alpha = ctx.getImageData(0, 0, TEX, TEX).data;
          const outer = new Float64Array(TEX * TEX),
            inner = new Float64Array(TEX * TEX);
          for (let i = 0; i < outer.length; i++) {
            const a = alpha[i * 4 + 3] / 255,
              d = 0.5 - a;
            outer[i] = a === 1 ? 0 : a === 0 ? 1e20 : Math.max(0, d) ** 2;
            inner[i] = a === 1 ? 1e20 : a === 0 ? 0 : Math.min(0, d) ** 2;
          }
          edt(outer);
          edt(inner);
          const sdf = new Float32Array(outer.length);
          for (let i = 0; i < sdf.length; i++)
            sdf[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / TEX;
          resolve({ canvas, sdf });
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Logo could not be loaded"));
      img.src = src;
    });
    cache.set(src, job);
    job.catch(() => cache.delete(src));
  }
  return job;
}

const VERT = `#version 300 es
in vec2 aPos;
void main(){gl_Position=vec4(aPos,0.,1.);}`;
const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uCenter;
uniform float uTile,uTexSize,uBoxFrac;
uniform sampler2D uSdf,uCol;
uniform float uPlateScale,uShapeN,uCornerN,uOptics,uPlateAlpha,uLogoHalf;
uniform float uBold,uBlur,uFrost,uDome,uDrop,uTilt,uRim,uHalo,uShadow,uRipR,uRipA,uBare;
uniform float uReach,uCornerPull,uStreak,uWiden,uSlab,uEtaSpread,uFocus,uFocusK,uFocusSplit,uRimLine,uCornerOn;
uniform float uDissolve,uGlow,uFaceDisp,uVivid,uDisp,uDouble,uBevelW,uSpec,uLightScene,uSheen,uSweep,uLightAng;
uniform vec3 uBg;
float px;
vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec4 logoAt(vec2 q,float blur,float aa){
  float k=.5*uBoxFrac/uLogoHalf;
  vec2 uv=vec2(.5+q.x*k,.5-q.y*k);
  float d=texture(uSdf,uv).r/k,w=.75*aa+blur;
  float a=1.-smoothstep(-w,w,d-uBold*uLogoHalf);
  float lod=log2(max(1.,w*k*uTexSize));
  vec4 c0=textureLod(uCol,uv,lod),c1=textureLod(uCol,uv,lod+3.),c2=textureLod(uCol,uv,7.);
  vec3 c=c2.rgb/max(c2.a,1e-4);
  c=mix(c,c1.rgb/max(c1.a,1e-4),smoothstep(0.,.06,c1.a));
  c=mix(c,c0.rgb/max(c0.a,1e-4),smoothstep(.02,.3,c0.a));
  return vec4(c,a);
}
float shape(vec2 p,float scale,float n,out vec2 nOut,out float g,out vec2 dg){
  vec2 pp=p/scale,a=max(abs(pp),vec2(1e-6));
  g=pow(pow(a.x,n)+pow(a.y,n),1./n);
  dg=sign(pp)*pow(a,vec2(n-1.))*pow(max(g,1e-6),1.-n);
  float dgl=max(length(dg),1e-6);nOut=dg/dgl;
  return (g-1.)/dgl*scale;
}
float contourRadius(vec2 p,float scale,float n){
  vec2 a=max(abs(p/scale),vec2(1e-4)),a1=pow(a,vec2(n-1.)),a2=pow(a,vec2(n-2.));
  float k=(n-1.)*(a2.x*a1.y*a1.y+a2.y*a1.x*a1.x)/pow(max(dot(a1,a1),1e-30),1.5);
  return scale/max(k,1e-3);
}
vec2 refractSample(float x,float bwF,float eta,float R,vec2 dirOut,vec2 p,float dome,float offMul){
  float u=clamp(1.-x,0.,.995),th=asin(u),thr=asin(u/eta);
  float z=uSlab+bwF*sqrt(1.-u*u),off=offMul*z*tan(th-thr);
  off=off/(1.+off/(6.*R));return p-(dirOut*off+p*dome)*uOptics;
}
float gauss(float x,float c,float w){float d=(x-c)/w;return exp(-.5*d*d);}
float band(float x,float a,float b,float w){return smoothstep(a-w,a,x)*(1.-smoothstep(b,b+w,x));}
vec3 spectrum(float x){return vec3(gauss(x,.34,.2)+.08*gauss(x,.93,.05),gauss(x,.58,.1),gauss(x,.8,.11));}
void main(){
  px=2./uTile;vec2 p=(gl_FragCoord.xy-uCenter)*px;
  vec4 lg=logoAt(p,uBlur,px);vec3 plain=mix(uBg,lg.rgb,lg.a*uBare);
  vec2 nOut,dg;float g;float sd=shape(p,uPlateScale,uShapeN,nOut,g,dg),s=-sd;
  float bw=max(uBevelW,.004)*uPlateScale,x=clamp(s/bw,0.,1.),R=contourRadius(p,uPlateScale,uShapeN);
  vec2 pq=p*p;float diag=4.*pq.x*pq.y/max((pq.x+pq.y)*(pq.x+pq.y),1e-6);
  float tilt=mix(1.-uTilt,1.,smoothstep(-.02,.02,p.x*p.y));
  float dome=uDome*(1.-min(g*g,1.));
  vec2 dirOut=normalize(mix(nOut,p/max(length(p),1e-4),.2));
  float cornerness=max(smoothstep(.1,.9,4.*nOut.x*nOut.x*nOut.y*nOut.y),smoothstep(.15,.75,diag));
  float offMul=1.+.4*max(uCornerPull-1.,0.)*tilt*cornerness*uCornerOn;
  vec2 focus=sign(p)*(pow(.5,1./uShapeN)-uFocus*.70710678)*uPlateScale;
  float focusW=tilt*cornerness*uOptics*uCornerOn,bwF=max(uReach,.004)*(1.+uWiden*tilt*cornerness*uCornerOn),xf=clamp(s/bwF,0.,1.);
  vec2 qc=refractSample(xf,bwF,1.5,R,dirOut,p,dome,offMul);
  float foot=max(max(length(dFdx(qc)),length(dFdy(qc))),.25*px);
  vec3 bg=uBg;
  if(uRipA>.001){float rx=(sd-(uRipR-1.)*uPlateScale)/.022;bg+=uRipA*exp(-rx*rx)*.04*(.55+.45*dot(nOut,normalize(vec2(-.5,.8))));}
  float outside=max(sd,0.),shadowFall=outside/(.9*uPlateScale);
  bg*=1.-uShadow*.03*exp(-shadowFall*shadowFall)*step(0.,sd);
  bg=mix(bg,mix(vec3(.62,.69,.8),vec3(1.),uLightScene),clamp(uHalo*(.30*exp(-outside/(.025*uPlateScale))+.07*exp(-outside/(.12*uPlateScale))),0.,1.)*step(0.,sd));
  vec3 col=bg;float soft=px+uBlur*.8+.06*uDissolve*uPlateScale;
  if(sd<soft){
    float y1=1.-x,base1=max(1.-pow(y1,2.6),1e-4),db=min(pow(y1,1.6)*pow(base1,1./2.6-1.),25.);
    float s1=bw*.62,w2=bw*.22,t2=clamp((s-s1)/w2,-1.,1.);
    float dd=uDouble*bw*.16*.5*cos(t2*1.5707963)*1.5707963/w2*step(abs(t2),.999);
    vec2 grad=-(db+dd)*nOut-uDome*2.*g*dg*step(g,1.);
    vec3 back=uBg,liftG=mix(back+vec3(.06),mix(back,vec3(1.),.55),uLightScene);
    float rblur=uBlur+.05*length(qc-p)+min(uGlow*uOptics*(1.-xf)*foot/px,.04);
    float cornerW=smoothstep(.1,.9,4.*nOut.x*nOut.x*nOut.y*nOut.y);
    float streak=.35*uStreak*bw*mix(.15,1.,cornerW)*pow(1.-xf,1.5)*uOptics;
    vec2 tangent=vec2(-nOut.y,nOut.x);vec3 acc=vec3(0.),wsum=vec3(0.);
    for(int i=0;i<20;i++){
      float lam=(float(i)+.5)/20.,c=uDisp*(1.-2.*lam),cf=c*(lam>.5?1.:.5);
      vec2 along=tangent*(streak*2.*(fract(float(i)*.618034+.31)-.5));
      vec2 sp=refractSample(xf,bwF,1.5+uEtaSpread*c,R,dirOut,p+along,dome,offMul);
      vec2 focusL=focus-sign(p)*(.70710678*uFocusSplit*c*uPlateScale);
      float wFocus=pow(1.-xf,uFocusK)*smoothstep(0.,uRimLine*(1.+.6*c),xf);
      sp=mix(sp,mix(p+along,focusL,wFocus),focusW);
      float faceOnly=smoothstep(.7,1.,xf)*uOptics;sp*=1.+uFaceDisp*cf*faceOnly;
      vec4 l=logoAt(sp,rblur+.12*streak+uFaceDisp*.5*max(c,0.)*faceOnly,foot);
      vec3 w=spectrum(lam);acc+=mix(back,l.rgb,l.a)*w;wsum+=w;
    }
    vec3 trans=acc/wsum;float tl=dot(trans,vec3(.2126,.7152,.0722));
    trans=clamp(tl+(trans-tl)*(1.+uVivid*uOptics),0.,1.);
    float hazeLum=dot(trans,vec3(.2126,.7152,.0722)),hazeGate=mix(1.-smoothstep(.25,.75,hazeLum),smoothstep(.25,.75,hazeLum),uLightScene);
    trans=mix(trans,liftG,uFrost*.45*hazeGate);
    float glassAmt=pow(1.-uDissolve,1.5),lit=uSpec*glassAmt,sc=uPlateScale;
    vec3 rimCol=mix(vec3(.80,.87,.97),vec3(1.),uLightScene);
    float tLum=dot(trans,vec3(.2126,.7152,.0722)),lightOnly=smoothstep(.35,.85,tLum);
    float hw=smoothstep(-.85,.5,dot(nOut,rot(vec2(.5,.866),uLightAng)));
    float tileBand=band(s,.016*sc,.075*sc,.022*sc),dropBand=(1.-smoothstep(.06*sc,.13*sc,s))*smoothstep(0.,.004*sc,s);
    float glow=mix(.32*tileBand,.75*dropBand,uDrop)*lightOnly;
    float edgeLine=gauss(s,.005*sc,.0045*sc),lip=gauss(s,.15*sc,.007*sc)*uDouble*(1.-uDrop);
    vec3 lightGlass=mix(trans,vec3(1.),glow*glassAmt);
    lightGlass+=(.075*hw*edgeLine+.06*(.4+.6*hw)*lip)*lit;
    lightGlass*=1.-.05*(1.-hw)*edgeLine*glassAmt*(1.-uDrop);
    lightGlass=mix(lightGlass,vec3(1.),.55*uDrop*glassAmt*edgeLine);
    vec3 Nl=normalize(vec3(-grad,1.));float edge=1.-Nl.z;
    vec2 ldir=rot(normalize(vec2(-.62,.78)),uLightAng);float side=dot(nOut,ldir),fres=pow(edge,1.5);
    vec3 rim=rimCol*fres*(.35+.65*max(side,-side*.8))*uRim*.65;
    vec3 Hv=normalize(normalize(vec3(-.45,.6,.66))+vec3(0.,0.,1.));
    float spc=pow(max(dot(Nl,Hv),0.),140.)*.8*smoothstep(0.,.25,y1);
    vec3 darkGlass=trans*(1.-.25*fres)+(rim+vec3(spc))*lit;
    darkGlass=mix(darkGlass,rimCol,uDrop*.4*uSpec*(1.-smoothstep(0.,.1*uPlateScale,s)));
    vec3 glass=mix(darkGlass,lightGlass,uLightScene);
    float sweepD=dot(p/uPlateScale,normalize(vec2(.8,.6)))-uSweep;
    glass=mix(glass,vec3(1.),uSheen*glassAmt*exp(-sweepD*sweepD/.03)*(.55+.45*(1.-x))*mix(.22,.42,uLightScene));
    col=mix(bg,glass,clamp(.5-sd/soft,0.,1.));
  }
  outColor=vec4(mix(plain,col,uPlateAlpha),1.);
}`;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function smoother(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function spring(t: number, response: number) {
  if (t <= 0) return 0;
  const w = (2 * Math.PI) / response;
  return 1 - Math.exp(-w * t) * (1 + w * t);
}

function frameAt(t: number, dark: boolean, outro: number) {
  const grow = spring(t + 0.01, 0.42),
    morph = spring(t - 0.27, 0.4),
    drop = 1 - smooth(0.05, 1, morph);
  const zoom = 0.25 * spring(t, 0.7) + 0.75 * smoother(0, 2.3, t),
    settle = spring(t - 0.5, 2.4);
  const release = spring(t - 2.45, 0.65),
    drift = (dark ? 0.05 : 0.12) * spring(t - 0.3, 2.2);
  const plateScale = mix(0.2, 1, grow) * (1 + drift) * (1 + 0.14 * release);
  const bandW = mix(dark ? 0.22 : 0.14, 0.4, drop);
  const view =
    (1 + (2.3 - 1) * (1 - zoom)) * (1 - 0.045 * settle) * (1 - 0.06 * outro);
  return {
    uPlateScale: plateScale,
    uShapeN: mix(2, 4.8, morph),
    uCornerN: 4.8,
    uOptics: 1 - smooth(0.55, 1, release),
    uPlateAlpha: smooth(0, 0.08, t) * (1 - smooth(0.45, 1, release)),
    uLogoHalf: 0.72 * view,
    uBold: 0.5 * 0.03 * (1 - zoom),
    uBlur: 0.05 * (1 - smooth(0.3, 0.95, grow)) + 0.03 * outro,
    uFrost: 1 - smooth(0.5, 0.95, grow),
    uDome: 0.15 * (1 - smooth(0.4, 0.95, grow)),
    uDrop: drop,
    uTilt: 0.35,
    uRim: 1 + 0.8 * drop,
    uHalo: dark ? 0.5 + 0.5 * drop : 0,
    uShadow: dark ? 0 : smooth(0.45, 0.8, grow) * (1 - smooth(0, 0.6, morph)),
    uRipR: 1 + 0.9 * Math.max(0, t - 0.22),
    uRipA:
      (dark ? 0.5 : 1) *
      smooth(0.22, 0.28, t) *
      Math.exp(-Math.max(0, t - 0.22) / 0.6),
    uBare: smooth(2.15, 2.4, t) * (1 - outro),
    uReach: bandW * plateScale,
    uCornerPull: dark ? 1.4 : 2.1,
    uStreak: dark ? 1.2 : 2.85,
    uWiden: dark ? 1.2 : 2.2,
    uSlab: 0.3 * (dark ? 0.75 : 1.1),
    uEtaSpread: 0.06,
    uFocus: dark ? 0.4 : 0.58,
    uFocusK: 1,
    uFocusSplit: 0.056 * (dark ? 0.45 : 1.25),
    uRimLine: 0.09,
    uCornerOn: smooth(0.35, 1, morph),
    uGlow: 0.012 * (dark ? 0.45 : 1.25),
    uFaceDisp: 0.012 * (dark ? 0.9 : 1.7),
    uVivid: 0.85,
    uDissolve: release,
    uDisp: dark ? 0.9 : 1.7,
    uDouble: 1,
    uBevelW: bandW * (1 - release),
    uSpec: 1,
    uLightScene: dark ? 0 : 1,
    uSheen: 1,
    uSweep: mix(-1.6, 1.6, smoother(0.9, 2.3, t)),
    uLightAng: 0.9 * smoother(0.4, 2.8, t),
  };
}

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    premultipliedAlpha: false,
  });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram()!;
  const buffer = gl.createBuffer()!;
  const sdfTex = gl.createTexture()!,
    colTex = gl.createTexture()!;
  function dispose() {
    gl!.deleteTexture(sdfTex);
    gl!.deleteTexture(colTex);
    gl!.deleteBuffer(buffer);
    shaders.forEach((shader) => gl!.deleteShader(shader));
    gl!.deleteProgram(program);
  }
  try {
    for (const [type, source] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const shader = gl.createShader(type)!;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) || "Shader failed");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error("Glass program failed");
  } catch {
    dispose();
    return null;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (
    let i = 0;
    i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    i++
  ) {
    const info = gl.getActiveUniform(program, i)!;
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  gl.uniform1i(uniforms.uSdf, 0);
  gl.uniform1i(uniforms.uCol, 1);
  function textureParams(min: number) {
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, min);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
  }
  return {
    setLogo(data: LogoData) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sdfTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.R16F,
        TEX,
        TEX,
        0,
        gl.RED,
        gl.FLOAT,
        data.sdf
      );
      textureParams(gl.LINEAR);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, colTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        data.canvas
      );
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      textureParams(gl.LINEAR_MIPMAP_LINEAR);
    },
    render(
      time: number,
      dark: boolean,
      bg: number[],
      tile: number,
      outro: number
    ) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uCenter, canvas.width / 2, canvas.height / 2);
      gl.uniform1f(uniforms.uTile, tile);
      gl.uniform1f(uniforms.uTexSize, TEX);
      gl.uniform1f(uniforms.uBoxFrac, BOX);
      gl.uniform3fv(uniforms.uBg, bg);
      for (const [key, value] of Object.entries(frameAt(time, dark, outro)))
        gl.uniform1f(uniforms[key], value);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose,
  };
}

/** Our mark, revealed through a refracting glass droplet. Offscreen animation pauses. */
export function GlassIconReveal({
  className,
  loop = false,
}: {
  className?: string;
  loop?: boolean;
}) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let disposed = false,
      visible = false,
      raf = 0,
      last = 0,
      time = 0,
      logo: LogoData | null = null,
      lost = false;
    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 block size-full";
    canvas.setAttribute("aria-hidden", "true");
    wrap.appendChild(canvas);
    let renderer = createRenderer(canvas);
    if (!renderer) {
      canvas.remove();
      return;
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sample = document.createElement("canvas");
    sample.width = sample.height = 1;
    const ctx = sample.getContext("2d", { willReadFrequently: true })!;
    let dark = false,
      bg = [1, 1, 1];
    function theme() {
      dark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      bg = Array.from(ctx.getImageData(0, 0, 1, 1).data)
        .slice(0, 3)
        .map((v) => v / 255);
      kick();
    }
    function tick(now: number) {
      raf = 0;
      if (!logo || !renderer || lost || disposed) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      time = motion.matches ? 3.5 : time + dt;
      if (loop && time > 8) time = 0;
      const dpr = Math.min(devicePixelRatio || 1, 2),
        w = Math.max(1, Math.round(wrap!.clientWidth * dpr)),
        h = Math.max(1, Math.round(wrap!.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      renderer.render(
        Math.min(time, 3.5),
        dark,
        bg,
        Math.min(w, h) / 1.5,
        loop ? clamp01((time - 7.5) / 0.5) : 0
      );
      setReady(true);
      if (visible && !motion.matches && (loop || time < 3.5))
        raf = requestAnimationFrame(tick);
    }
    function kick() {
      if (!raf && visible && !lost && !disposed) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }
    theme();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(wrap);
    const ro = new ResizeObserver(kick);
    ro.observe(wrap);
    const observer = new MutationObserver(theme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      raf = 0;
      setReady(false);
    };
    const onRestored = () => {
      renderer = createRenderer(canvas);
      lost = false;
      if (renderer && logo) {
        renderer.setLogo(logo);
        kick();
      }
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    motion.addEventListener("change", kick);
    loadLogo("/logo.svg")
      .then((data) => {
        if (disposed) return;
        logo = data;
        renderer?.setLogo(data);
        kick();
      })
      .catch(() => {
        if (!disposed) setReady(false);
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      observer.disconnect();
      motion.removeEventListener("change", kick);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      renderer?.dispose();
      canvas.remove();
    };
  }, [loop]);
  return (
    <span
      ref={wrapRef}
      aria-hidden="true"
      className={cn(
        "relative isolate inline-block shrink-0 overflow-hidden",
        className
      )}
    >
      <img
        src="/logo.svg"
        alt=""
        className={cn(
          "absolute left-1/2 top-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2",
          ready && "invisible"
        )}
      />
    </span>
  );
}
