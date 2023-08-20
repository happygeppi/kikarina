let karina;
let TR = [[], []]; // []; // JSON.parse(jsonTR);
let absN = 5000;
let N = Math.floor(absN / Math.log10(TR.length));
let I = 0;
let eigeneTr = false;

function Start() {
  if (eigeneTr) TR = JSON.parse(jsonTR);
  let lr = 0.01;
  karina = new Karina(w, lr);
  console.log(karina);
}

function Probieren(img) {
  let outp = karina.erkennen(img, false);
  OutputAnzeigen(outp);
}

function Trainieren() {
  TR.forEach((TRkl) => {
    let tr = TRkl[Math.floor(Math.random() * TRkl.length)];
    karina.trainieren(tr, I, N);
  });

  I++;

  if (karina.fortschritt < 1) requestAnimationFrame(Trainieren);
  else {
    karina.fortschritt = -1;
    Lernend = false;
  }
}

function Abbruch() {
  I = N;
}

function TrainingStarten() {
  if (!Lernend) {
    console.log("Training startet");
    I = 0;
    N = Math.floor(absN / TR.length);
    Lernend = true;
    Trainieren();
  }
}

function Speichern(content, name) {
  let data = JSON.stringify(content);
  let a = document.createElement("a");
  let file = new Blob([data]);
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}
