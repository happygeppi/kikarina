class Karina {
  constructor(bildgroesse, lr) {
    this.bildgroesse = bildgroesse;
    this.poolgroesse = 32;
    this.lr = lr;
    this.fortschritt = -1; // noch nicht lernend

    this.initialisieren();
  }

  initialisieren() {
    let size = (this.bildgroesse / this.poolgroesse); // size vom fertigen bild
    let inp = size * size; // aus 16x16 wird 256
    let out = Klassen.length; // Anzahl Output Neuronen
    
    // let layers = [
    //   inp,
    //   10 * out,
    //   8 * out,
    //   6 * out,
    //   4 * out,
    //   2 * out,
    //   out
    // ];

    let layers = [
      inp,
      10 * out,
      8 * out,
      out
    ];

    this.ffn = new FeedforwardN(layers, this.lr);
  }

  trainieren(tr, i, t) {
    this.erkennen(tr.input, true);
    this.ffn.trainieren(tr.output, i, t);

    if (this.fortschritt == -1) {
      KoordinatenSys();
      this.fortschritt = 0;
    }
    // wenn neuer Prozent erreicht
    if (i % (t / 100) < 1 && this.fortschritt < Math.floor(100 * i / t) / 100) {
      console.log(Math.floor(100 * i / t) + "% fertig!");
      this.fortschritt = Math.floor(100 * i / t) / 100;
      let fertig = this.fortschritt >= 1 ? true : false;
      PunktHinzu(this.fortschritt, this.fehlerwert(), fertig);
    }
  }

  erkennen(img, isTr) {
    this.img = img;

    if (isTr == false) { // wenn probiert wird
      this.pooling(this.img);
    }

    let output = this.ffn.feedforward(this.flach(), isTr);
    this.output = this.outputFinden(output);
    this.antw = output[0]; // "ObjektName"
    this.sicher = output[1]; // xx% sicher

    return this.output;
  }

  bearbeiten(img) {
    let w = img[0].length;
    let h = img.length;

    // von oben & unten gleichzeitig gucken
    for (let j = 0; j < h / 2; j++) {
      let maxO = 0;
      let maxU = 0;

      for (let i = 0; i < w; i++) {
        if (img[j][i] > maxO) maxO = img[j][i];
        if (img[h-1-j][i] > maxU) maxU = img[h-1-j][i];
      }

      if (maxO > maxU) img = Verschoben(img, 0,  1);
      if (maxO < maxU) img = Verschoben(img, 0, -1);
    }

    // von links & rechts gleichzeitig gucken
    for (let i = 0; i < w / 2; i++) {
      let maxR = 0;
      let maxL = 0;

      for (let j = 0; j < h; j++) {
        if (img[j][i] > maxR) maxR = img[j][i];
        if (img[j][w-1-i] > maxL) maxL = img[j][w-1-i];
      }

      if (maxR > maxL) img = Verschoben(img,  1, 0);
      if (maxR < maxL) img = Verschoben(img, -1, 0);
    }

    this.img = img;

    return this.img;
  }

  pooling(img) {
    let neuesImg = [];

    for (let j = 0; j <= this.bildgroesse - this.poolgroesse; j += this.poolgroesse) {
      neuesImg.push([]);

      for (let i = 0; i <= this.bildgroesse - this.poolgroesse; i += this.poolgroesse) {
        let max = img[j][i];

        for (let pj = 0; pj < this.poolgroesse; pj++) {
          for (let pi = 0; pi < this.poolgroesse; pi++) {
            // wenn pixel maxer als max dann ist pixel neues max
            if (img[j + pj][i + pi] > max) max = img[j + pj][i + pi];
          }
        }

        neuesImg[j / this.poolgroesse].push(max);
      }
    }

    // zentrieren
    neuesImg = this.bearbeiten(neuesImg);
    this.img = neuesImg;
    
    return neuesImg;
  }

  outputFinden(output) {
    let max = 0;
    let index = null;

    output.forEach((n, i) => {
      if (n > max) {
        max = n;
        index = i;
      }
    });

    // return ["ObjektName", xx% sicher]
    return [Klassen[index], max];
  }

  flach() {
    let flach = [];

    this.img.forEach((reihe) => {
      reihe.forEach((px) => {
        flach.push(px);
      });
    });

    return flach;
  }

  fehlerwert() {
    let fw = 0;
    
    // fuer jedes tr wird C berechnet
    TR.forEach((TRkl) => {

      TRkl.forEach((trb) => {
        let fwtr = 0;
        this.erkennen(trb.input);
  
        // fuer jedes Output Neuron die Abweichung berechnen
        trb.output.forEach((outp, i) => {
          fwtr += Math.abs(outp - this.ffn.output[i]) / trb.output.length;
        });
        
        fw += fwtr;
      });

      fw /= TRkl.length;
    });

    // fw = durchschn. Fehlerwert jedes tr
    this.fw = fw / TR.length;

    return this.fw;
  }
}

class FeedforwardN {
  constructor(l, lr) {
    this.layersn = l; // Anzahl Neuronen pro Layer
    this.L = this.layersn.length - 1; // index letzter Layer

    this.w = [[]]; // alle Gewichte
    this.b = [[]]; // alle Schwellenwerte
    this.a = []; // alle Aktivierungen der Neuronen
    this.output = []; // Aktivierung der letzten Ebene

    this.lr = lr; // Lernrate
    this.dor = 0.1; // Dropout-Rate
    this.dCda = []; // nach hinten durchgereicht

    this.initialisieren();
  }

  initialisieren() {
    for (let l = 1; l <= this.L; l++) {
      // l: Ebenen
      let wl = [];
      let bl = [];
      this.dCda.push([]);

      for (let j = 0; j < this.layersn[l - 1]; j++) {
        this.dCda[l - 1].push(0);
      }

      for (let j = 0; j < this.layersn[l]; j++) {
        // j: w zu j hin bzw. bj
        let wlj = [];

        for (let k = 0; k < this.layersn[l - 1]; k++) {
          // k: w von k zu j

          let maxw = 1;
          let minw = -maxw;
          // zuf w zwischen max und min
          let wljk = Math.random() * (maxw - minw) + minw;

          wlj.push(wljk);
        }

        let maxb = 1;
        let minb = -maxb;
        // zuf b zwischen max und min
        let blj = Math.random() * (maxb - minb) + minb;

        wl.push(wlj);
        bl.push(blj);
      }

      this.w.push(wl);
      this.b.push(bl);
    }
  }

  feedforward(inp, tr) {
    this.output = []; // output geleert
    this.a = [inp]; // alle Neuronen aktualisiert

    for (let l = 1; l < this.layersn.length; l++) {
      // l: Ebenen (nur hidden & output)

      let as = [];
      for (let j = 0; j < this.layersn[l]; j++) {
        // j: Neuronen in l Ebene

        let w = this.w[l][j];
        let x = this.a[l - 1];
        let b = this.b[l][j];

        let z = b; // z = ... + b

        for (let n = 0; n < w.length; n++) {
          if (
            tr && // nicht bei probieren
            n > 10 && // nicht am anfang und
            n < w.length - 10 && // am ende
            l == 1 && // nur im ersten layer
            Math.random() < this.dor // mit wahrsch = this.dor
          )
            n += Math.floor(Math.random() * 20 - 10); // Dropout
          z += w[n] * x[n]; // z = wn*xn + ...
        }

        let a = 1 / (1 + Math.exp(-z)); // a = sigmoid(z)
        as.push(a);
      }

      this.a.push(as);
    }

    this.output = this.a[this.L];

    return this.output;
  }

  trainieren(y, i, t) {
    let mult = 10; // lr auf dauer vergroessern

    for (let l = this.L; l >= 1; l--) {
      // l: Ebenen von hinten nach vorne

      for (let j = 0; j < this.layersn[l - 1]; j++) {
        this.dCda[l - 1][j] = 0; // dCda leeren
      }

      for (let j = 0; j < this.layersn[l]; j++) {
        // j: Gewichte zu Neuron j(l)

        for (let k = 0; k < this.layersn[l - 1]; k++) {
          // k: Gewichte von Neuron k(l-1) zu Neuron j(l)

          if (l == this.L) {
            // Anpassen im Output layer

            let aLj = this.a[l][j];

            let dCdz = (aLj - y[j]) * aLj * (1 - aLj); // Ableitung C(z)
            let dCdw = dCdz * this.a[l - 1][k]; // Ableitung C(z(w))
            let dCdb = dCdz; // Ableitung C(z(b))

            this.dCda[l - 1][k] += dCdz * this.w[l][j][k]; // dCda weitergeben

            let delta = this.lr * (1 + (mult * i) / t); // mit Lernrate multipl.

            this.w[l][j][k] -= dCdw * delta; // Gewichte angepasst
            this.b[l][j] -= dCdb * delta; // Schwellenwerte angepasst
          }
          else {
            // Anpassen in hidden

            let alj = this.a[l][j];

            let dCdz = this.dCda[l][j] * (alj * (1 - alj)); // Ableitung C(z)
            let dCdw = dCdz * this.a[l - 1][k]; // Ableitung C(z(w))
            let dCdb = dCdz; // Ableitung C(z(b))

            // wenn nicht erster layer dann dCda weitergeben
            if (l > 1) this.dCda[l - 1][k] += dCdz * this.w[l][j][k];

            let delta = this.lr * (1 + (mult * i) / t); // mit Lernrate multipl.

            this.w[l][j][k] -= dCdw * delta; // Gewichte angepasst
            this.b[l][j] -= dCdb * delta; // Schwellenwerte angepasst
          }
        }
      }
    }
  }
}

function Verschoben(img, x, y) {
  let neuesImg = [];
  let w = img[0].length;
  let h = img.length;

  for (let j = 0; j < h; j++) {
    neuesImg.push([]);

    for (let i = 0; i < w; i++) {
      if (img[j-y] !== undefined && img[j-y][i-x] !== undefined) {
        neuesImg[j][i] = img[j-y][i-x]; // Pixel (j,i) um (x,y) verschieben
      } else neuesImg[j][i] = 0; // wenn undefined dann schwarz
    }
  }

  return neuesImg;
}