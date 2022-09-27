# online-wgsl-editor

`online-wgsl-editor` is a tiny online [WGSL (WebGPU Shading language)](https://www.w3.org/TR/WGSL/) editor.

You can test WGSL on your web browser. It is good especially for people who want to learn WGSL.

## Demo

[Online demo](https://takahirox.github.io/online-wgsl-editor/index.html)

Use Chrome for the Demo. It doesn't run on FireFox and other browsers yet.

## Presentation

[WebGL + WebGPU Meetup - January 2022](https://www.khronos.org/events/webgl-webgpu-meetup-january-2022) / [Slides](https://docs.google.com/presentation/d/1WP5YGAoYvFnj2JYinV7r7SNA8sKngfW2ZNaeyIDiIy8)

## Screenshots

<img src="./screenshots/screenshot.png" width="640">

## How to run locally

```sh
$ git clone https://github.com/takahirox/online-wgsl-editor.git
$ cd online-wgsl-editor
$ npm install
$ npm run start
# Access http://localhost:8080 on your web browser
```

Note: To run the demo locally, download [Google Chrome Canary](https://www.google.com/chrome/canary/) and enable `#enable-unsafe-webgpu` flag via `chrome://flags`.

## Thanks to

I referred to [Three.js](https://threejs.org/) and [glMatrix](https://glmatrix.net/) for WebGPU and Math.
