const w = 512;
const h = 512;

let Cvs = document.querySelectorAll(".cv");
let sliders = document.querySelectorAll(".strokeSlider");
let cs = [];
let rects = [];
let Strokes = [];

setTimeout(() => {
  Cvs.forEach((Cv, i) => {
    Cv.width = w;
    Cv.height = h;
    cs.push(Cv.getContext("2d"));
    let rect = Cvs[i].getBoundingClientRect();
    rects.push(rect);
    Strokes[i] = sliders[i].value;
  });

  cs.forEach((c) => {
    c.fillStyle = "black";
    c.fillRect(0, 0, w, h);
  });

  sliders.forEach((s, i) => {
    s.addEventListener("change", () => {
      Strokes[i] = s.value;
    });
  });
}, 100);

const AntInp = document.getElementById("korrekteAnt");

let mouseDown = false;
let mx, my, pmx, pmy;

function Zeichnen(i, New) {
  if (mouseDown) {
    cs[i].beginPath();
    cs[i].arc(mx, my, Strokes[i] / 2, 0, 2 * Math.PI);
    cs[i].fillStyle = "white";
    cs[i].fill();

    if (!New) {
      cs[i].beginPath();
      cs[i].moveTo(pmx, pmy);
      cs[i].lineTo(mx, my);
      cs[i].lineWidth = Strokes[i];
      cs[i].strokeStyle = "white";
      cs[i].stroke();
    }
  }
}

function CanvasImg(cv) {
  let img = [];

  for (let j = 0; j < h; j++) {
    img.push([]);
    for (let i = 0; i < w; i++) {
      img[j].push(0);
    }
  }

  cs[cv].getImageData(0, 0, w, h).data.forEach((hell, index) => {
    if (index % 4 === 0) {
      let j = Math.floor(index / 4 / h);
      let i = (index / 4) % w;
      img[j][i] = hell / 255; // zwischen 1 und 0
    }
  });

  return img;
}

function NeuZeichnen(i) {
  cs[i].fillStyle = "black";
  cs[i].fillRect(0, 0, w, h);
}

Cvs.forEach((Cv, i) => {
  Cv.addEventListener("mousedown", () => {
    mouseDown = true;
    Zeichnen(i, true);

    if (!Gestartet) {
      TrErstellen();
    }
  });
  Cv.addEventListener("mousemove", (e) => {
    pmx = mx;
    pmy = my;
    mx = e.clientX - rects[i].left;
    my = e.clientY - rects[i].top;
    Zeichnen(i, false);
  });
});
document.addEventListener("mouseup", (e) => {
  mouseDown = false;
});

document.addEventListener("scroll", () => {
  Cvs.forEach((Cv, i) => {
    let rect = Cv.getBoundingClientRect();
    rects[i] = rect;
  });
});

// ---
// Canvas zum Training:

const trc = document.querySelector(".trc");
const trcRect = trc.getBoundingClientRect();
const wt = trcRect.width;
const ht = trcRect.height;
trc.width = wt;
trc.height = ht;
const ct = trc.getContext("2d");

let startakk = document.querySelector(".startacc");
let endakk = document.querySelector(".endacc");

let x, y, px, py;

function KoordinatenSys() {
  let fw = karina.fehlerwert();
  let akk = Math.floor(100 - fw * 100);
  startakk.innerHTML = `Start: ${akk}%`;

  x = 0;
  y = fw * ht;

  ct.beginPath();
  ct.arc(x, y, 1, 0, Math.PI * 2);
  ct.fillStyle = "#000";
  ct.fill();

  px = x;
  py = y;
}

function PunktHinzu(t, fw, fertig) {
  let x = t * wt;
  let y = fw * ht;
  let akk = 100 - Math.floor(fw * 1000) / 10;
  if (!fertig) endakk.innerHTML = `aktuell: ${akk}%`;
  else endakk.innerHTML = `Ende: ${akk}%`;

  ct.beginPath();
  ct.moveTo(px, py);
  ct.lineTo(x, y);
  ct.lineWidth = 2;
  ct.strokeStyle = "#000";
  ct.stroke();

  px = x;
  py = y;
}


let _N = 0;
let generierenReq;
function TrGenerieren(n) {
  let s = _N % 3;
  FormZeichnen(s);
  let outp = [0, 0, 0];
  outp[s] = 1;
  TrHinzu(true, outp);
  
  _N++;

  if (_N < n) generierenReq = requestAnimationFrame(TrGenerieren)
  else return TR;
}

function FormZeichnen(s) {
  let C = cs[0];
  C.clearRect(0, 0, w, h);
  C.fillStyle = "black";
  C.fillRect(0, 0, w, h);

  if (s == 0) {
    // Dreieck

    let x1 = Math.floor(Math.random() * w);
    let y1 = Math.floor(Math.random() * h / 2); // oben  zentral
    let x2 = Math.floor(Math.random() * w / 2);
    let y2 = Math.floor(Math.random() * h / 2 + h / 2) // links unten
    let x3 = Math.floor(Math.random() * w / 2 + w / 2);
    let y3 = Math.floor(Math.random() * h / 2 + h / 2); // rechts unten
    let st = Math.floor(Math.random() * 20 + 5);

    C.beginPath();
    C.moveTo(x1, y1);
    C.lineTo(x2, y2);
    C.lineTo(x3, y3);
    C.lineTo(x1, y1);
    C.lineWidth = st;
    C.strokeStyle = "white";
    C.stroke();

  } else if (s == 1) {
    // Viereck

    let x = Math.floor(Math.random() * w / 2);
    let y = Math.floor(Math.random() * h / 2);
    let wd = Math.floor(Math.random() * w / 3 + w / 3);
    let ht = Math.floor(Math.random() * h / 3 + h / 3);
    let st = Math.floor(Math.random() * 20 + 5);

    C.lineWidth = st;
    C.strokeStyle = "white";
    C.strokeRect(x, y, wd, ht);

  } else if (s == 2) {
    // Kreis

    let x = Math.floor(Math.random() * w / 3 + w / 3);
    let y = Math.floor(Math.random() * h / 3 + h / 3);
    let r = Math.floor(Math.random() * w / 3 + w / 6);
    let st = Math.floor(Math.random() * 20 + 5);

    C.beginPath();
    C.lineWidth = st;
    C.strokeStyle = "white";
    C.arc(x, y, r, 0, Math.PI * 2);
    C.stroke();
  }
}