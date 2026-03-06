"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;

const FRAG = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_fluid;
uniform float u_turb;
uniform float u_glass;
uniform int u_scene;
uniform float u_seed;
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec2 warp(vec2 p,float t,float turb,float fluid){
  vec2 q=p;float str=fluid;
  vec2 d1=vec2(snoise(vec3(q*0.6,t*0.15)),snoise(vec3(q*0.6,t*0.15+50.0)));
  q+=d1*str*0.45;
  float tw2=smoothstep(0.0,0.4,turb);
  vec2 d2=vec2(snoise(vec3(q*1.3+d1*0.7,t*0.12+10.0)),snoise(vec3(q*1.3+d1*0.7,t*0.12+60.0)));
  q+=d2*str*0.5*tw2;
  float tw3=smoothstep(0.3,0.85,turb);
  vec2 d3=vec2(snoise(vec3(q*2.5,t*0.09+20.0)),snoise(vec3(q*2.5,t*0.09+70.0)));
  q+=d3*str*0.4*tw3;
  return q;
}
float blob(vec2 p,vec2 center,float radius){
  float d=length(p-center)/radius;
  return exp(-d*d*2.5);
}
vec3 meshGrad(int sc,vec2 p,float t,float sd){
  vec3 base,c1,c2,c3,c4,c5;
  if(sc==0){base=vec3(0.01,0.02,0.06);c1=vec3(0.05,0.35,0.85);c2=vec3(0.1,0.6,0.95);c3=vec3(0.3,0.8,1.0);c4=vec3(0.7,0.92,1.0);c5=vec3(0.02,0.15,0.5);}
  else if(sc==1){base=vec3(0.04,0.01,0.03);c1=vec3(0.85,0.25,0.08);c2=vec3(0.95,0.55,0.12);c3=vec3(0.4,0.1,0.55);c4=vec3(1.0,0.78,0.3);c5=vec3(0.6,0.08,0.2);}
  else if(sc==2){base=vec3(0.02,0.01,0.05);c1=vec3(0.7,0.1,0.6);c2=vec3(0.15,0.7,0.85);c3=vec3(0.4,0.05,0.8);c4=vec3(0.2,0.9,0.7);c5=vec3(0.9,0.3,0.5);}
  else{base=vec3(0.01,0.03,0.02);c1=vec3(0.08,0.5,0.2);c2=vec3(0.5,0.75,0.15);c3=vec3(0.02,0.3,0.15);c4=vec3(0.7,0.82,0.3);c5=vec3(0.15,0.6,0.4);}
  float s=sd*0.37;
  vec2 p1=vec2(sin(t*0.11+s)*0.7,cos(t*0.13+s+1.0)*0.5);
  vec2 p2=vec2(cos(t*0.09+s+2.0)*0.8,sin(t*0.12+s+3.0)*0.6);
  vec2 p3=vec2(sin(t*0.14+s+4.0)*0.5,cos(t*0.08+s+5.0)*0.7);
  vec2 p4=vec2(cos(t*0.07+s+6.0)*0.6,sin(t*0.1+s+7.0)*0.4);
  vec2 p5=vec2(sin(t*0.12+s+8.0)*0.4,cos(t*0.11+s+9.0)*0.8);
  float r1=0.8+sin(t*0.05+s)*0.15;
  float r2=0.9+cos(t*0.06+s+1.0)*0.15;
  float r3=0.7+sin(t*0.07+s+2.0)*0.1;
  float r4=0.85+cos(t*0.04+s+3.0)*0.15;
  float r5=0.65+sin(t*0.08+s+4.0)*0.1;
  vec3 col=base;
  col+=c1*blob(p,p1,r1)*0.9;
  col+=c2*blob(p,p2,r2)*0.85;
  col+=c3*blob(p,p3,r3)*0.7;
  col+=c4*blob(p,p4,r4)*0.6;
  col+=c5*blob(p,p5,r5)*0.5;
  return col;
}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float aspect=u_resolution.x/u_resolution.y;
  vec2 p=(uv-0.5)*vec2(aspect,1.0)*2.0;
  float fl=u_fluid;float tb=u_turb;float gs=u_glass;
  float t=u_time*0.3+u_seed;
  float numSlats=mix(22.0,75.0,gs);
  float slatW=u_resolution.x/numSlats;
  float px=gl_FragCoord.x;
  float si=floor(px/slatW);
  float lx=(px-si*slatW)/slatW;
  float gapW=mix(0.02,0.055,gs);
  float isGap=1.0-smoothstep(0.0,gapW,lx)*smoothstep(1.0,1.0-gapW,lx);
  float body=smoothstep(0.0,gapW+0.04,lx)*smoothstep(1.0,1.0-gapW-0.04,lx);
  float sc=(lx-0.5)*2.0;
  float slatPh=si*1.17+sin(si*0.31)*4.0;
  float barOX=sin(slatPh+t*0.35)*mix(0.06,0.22,gs);
  float barOY=cos(slatPh*0.7+t*0.25)*mix(0.03,0.14,gs);
  float lensStr=mix(0.02,0.12,gs);
  float lensBend=sc*sc*sign(sc)*lensStr;
  vec2 rp=p+vec2(barOX+lensBend,barOY+sc*lensStr*0.3);
  vec2 wC=warp(rp,t,tb,fl);
  vec3 col=meshGrad(u_scene,wC,t,u_seed);
  float chroma=mix(0.005,0.04,gs)*sc;
  float shift=chroma*3.0;
  col.r=col.r+shift*col.g*0.5;
  col.b=col.b-shift*col.g*0.5;
  col*=1.25;
  float edgeDist=min(lx,1.0-lx);
  float sp=pow(max(0.0,1.0-edgeDist*8.0),3.0)*mix(0.1,0.45,gs);
  sp+=pow(max(0.0,1.0-abs(lx-0.5)*3.0),10.0)*0.06*gs;
  float fres=1.0-pow(abs(sc),mix(1.8,3.0,gs))*mix(0.12,0.5,gs);
  col*=body*fres;
  col+=sp*vec3(0.55,0.65,0.9)*(0.3+0.7*gs);
  col*=(1.0-isGap*mix(0.75,1.0,gs));
  float ish=smoothstep(0.0,0.12,lx)*smoothstep(1.0,0.88,lx);
  col*=mix(1.0,ish,gs*0.25);
  col*=0.9+0.1*sin(si*0.47+t*0.15);
  col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)*0.018;
  vec2 vp=uv-0.5;col*=1.0-dot(vp,vp)*0.8;
  col=clamp(col,0.0,1.0);
  col=pow(col,vec3(0.95));
  gl_FragColor=vec4(col,1.0);
}`;

export function FractalBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    function mkShader(tp: number, src: string) {
      const s = gl!.createShader(tp)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = mkShader(gl.VERTEX_SHADER, VERT);
    const fs = mkShader(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    [
      "u_resolution",
      "u_time",
      "u_fluid",
      "u_turb",
      "u_glass",
      "u_scene",
      "u_seed",
    ].forEach((n) => {
      uniforms[n] = gl.getUniformLocation(prog, n);
    });

    const t0 = Date.now();
    const P = { scene: 0, fluid: 0.55, turb: 0.75, glass: 0.7, seed: 0 };

    function resize() {
      const d = Math.min(devicePixelRatio, 2);
      canvas!.width = Math.round(canvas!.clientWidth * d);
      canvas!.height = Math.round(canvas!.clientHeight * d);
    }

    window.addEventListener("resize", resize);
    resize();

    let raf: number;

    function draw() {
      if (!document.hidden && gl) {
        gl.viewport(0, 0, canvas!.width, canvas!.height);
        const t = (Date.now() - t0) / 1000;
        gl.uniform2f(uniforms.u_resolution!, canvas!.width, canvas!.height);
        gl.uniform1f(uniforms.u_time!, t);
        gl.uniform1f(uniforms.u_fluid!, P.fluid);
        gl.uniform1f(uniforms.u_turb!, P.turb);
        gl.uniform1f(uniforms.u_glass!, P.glass);
        gl.uniform1i(uniforms.u_scene!, P.scene);
        gl.uniform1f(uniforms.u_seed!, P.seed);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.4 }}
    />
  );
}
