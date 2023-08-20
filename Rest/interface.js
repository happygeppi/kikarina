let _ObjekteUl = document.querySelector(".kls");
let _ObjekteLi = document.querySelectorAll(".kl");
let _ObjekteInp = document.querySelectorAll(".kli");
let _ObjekteEntf = document.querySelectorAll(".klEntf");

let _WaehlenUl = document.querySelector(".waehlen");
let _WaehlenLi = document.querySelectorAll(".waehlen li");

let Klassen = [];

let timer = true;

let Gestartet = false;
let Lernend = false;

EventList();

// Neue Klasse hinzuf
function NeueKl() {
  if (!Gestartet) {
    let _neu = document.createElement("li");
    let _neuInp = document.createElement("input");
    let _neuEntf = document.createElement("span");

    _neu.classList.add("kl");
    _neuInp.classList.add("kli");
    _neuEntf.classList.add("klEntf");

    _ObjekteLi = document.querySelectorAll(".kl");
    let n = _ObjekteLi.length;

    _ObjekteUl.appendChild(_neu);
    _neu.appendChild(_neuInp);
    _neu.appendChild(_neuEntf);

    _neuInp.type = "text";
    _neuInp.value = `Objekt${n}`;
    _neuEntf.innerHTML = `Klasse entfernen`;

    _ObjekteUl.appendChild(_ObjekteLi[n - 1]);

    if (!eigeneTr) TR.push([]);

    if (n == 9) _ObjekteUl.removeChild(_ObjekteLi[n - 1]);
    KlassenAktualisieren();
  }
}

// Nachdem Elemente hinzugef oder entf wurden
function KlassenAktualisieren() {
  _ObjekteLi = document.querySelectorAll(".kl");
  _ObjekteInp = document.querySelectorAll(".kli");
  _ObjekteEntf = document.querySelectorAll(".klEntf");
  _WaehlenLi = document.querySelectorAll(".waehlen li");

  EventList();
  UlGridAnpassen();
}

// richtige Anzahl an Columns
function UlGridAnpassen() {
  let n = _ObjekteLi.length;

  if (n <= 3) _ObjekteUl.style.gridTemplateColumns = "1fr";
  if (n >= 4 && n <= 6) _ObjekteUl.style.gridTemplateColumns = "1fr 1fr";
  if (n >= 7 && n <= 9) _ObjekteUl.style.gridTemplateColumns = "1fr 1fr 1fr";
}

// Button "neue Klasse" hinzuf.
function NeuBtnHinzu() {
  let _neu = document.createElement("li");
  let _neuP = document.createElement("p");

  _neu.classList.add("kl", "neuekl");
  _neuP.classList.add("klp");

  _ObjekteLi = document.querySelectorAll(".kl");

  _ObjekteUl.appendChild(_neu);
  _neu.appendChild(_neuP);
  _neu.setAttribute("onclick", "NeueKl()");

  _neuP.innerHTML = `Neue Klasse`;

  KlassenAktualisieren();
}

// Klasse Entfernen
function KlEntfernen(i) {
  let Kl = _ObjekteLi[i];
  if (Kl !== undefined && (i != _ObjekteLi.length - 1 || i == 8)) {
    _ObjekteUl.removeChild(Kl);

    if (_ObjekteInp.length == 9) {
      NeuBtnHinzu();
    }

    _ObjekteEntf.forEach((entf) => {
      entf.remove();
    });
    _ObjekteLi.forEach((li, l) => {
      if (l != _ObjekteLi.length - 1) {
        let _entf = document.createElement("span");
        _entf.classList.add("klEntf");
        _entf.innerHTML = "Klasse entfernen";
        li.appendChild(_entf);
      }
    });
  }

  if (!eigeneTr) TR.splice(0, 1);

  KlassenAktualisieren();
  UlGridAnpassen();
}

// zum naechsten Teil scrollen
function Weiter(n) {
  let Y = document.querySelectorAll(".teil")[n].getClientRects()[0].y;
  Y += window.scrollY - 5;
  window.scrollTo({ top: Y, left: 0, behavior: "smooth" });

  if (n == 3 && !Gestartet) {
    TrErstellen();
  }
}

// Liste mit Klassen erstellen
function TrErstellen() {
  if (_ObjekteEntf.length != 9) {
    let nkl = document.querySelector(".neuekl");
    nkl.style.opacity = 0;
    nkl.remove();
  }

  _ObjekteInp.forEach((kl) => Klassen.push(kl.value));
  WLiAnpassen();
  KlassenAktualisieren();
  Start();
  Gestartet = true;
}

// Waehlen-Liste erstellen
function WLiAnpassen() {
  document.getElementById("waehlenHinweis").id = "";
  Klassen.forEach((kl) => {
    let li = document.createElement("li");
    _WaehlenUl.appendChild(li);
    li.innerHTML = kl;
  });
}

// auswaehlen, was zu sehen ist
function ObjektWaehlen(li) {
  if (!li.classList.contains("gewaehlt")) {
    _WaehlenLi.forEach((_li) => _li.classList.remove("gewaehlt"));
    li.classList.add("gewaehlt");
  } else li.classList.remove("gewaehlt");
}

// Trainingsbeispiel hinzuf
function TrHinzu(auto, outp) {
  let input = karina.pooling(CanvasImg(0));
  let output;
  let klasse;
  
  if (!auto) {
    output = [];
  
    _WaehlenLi.forEach((li, i) => {
      if (li.classList.contains("gewaehlt")) {
        output.push(1);
        klasse = i;
      }
      else output.push(0);
      NeuZeichnen(0);
    });
  } else output = outp;

  let tr = {
    input: input,
    output: output
  };

  TR[klasse].push(tr);
  // TR.push(tr);
}

function OutputAnzeigen(outp) {
  let AntCon = document.querySelector(".karinaantcon");
  let Ant = document.querySelector(".karinaant");

  if (AntCon.classList.contains("invis")) AntCon.classList.remove("invis");
  Ant.innerHTML = `${outp[0]} (${Math.floor(outp[1] * 100)}% sicher)`;
}

// Damit die EL wieder stimmen, nachdem was hinzugef wurde
function EventList() {
  _ObjekteEntf.forEach((kle, i) => {
    kle.addEventListener("mouseup", () => {
      if (!Gestartet && timer && _ObjekteLi.length != 2) {
        timer = false;
        setTimeout(() => (timer = true), 500);
        KlEntfernen(i);
      }
    });
  });
  _ObjekteLi[_ObjekteLi.length - 1].addEventListener("mousedown", () => {
    timer = false;
    setTimeout(() => (timer = true), 500);
  });
  _WaehlenLi.forEach((li) => {
    li.addEventListener("mouseup", () => {
      ObjektWaehlen(li);
    });
  });
}
