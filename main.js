class CsvRowCounter extends HTMLElement {
  constructor(){
    super();
    const s=this.attachShadow({mode:'open'});
    s.innerHTML=`
      <style>
        :host{display:block;font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
        .card{border:1px solid #ddd;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
        .row{display:flex;gap:8px;align-items:center}
        .drop{border:2px dashed #bbb;border-radius:12px;padding:18px;margin-top:10px;text-align:center}
        .drop.drag{border-color:#666;background:#fafafa}
        .muted{color:#666;font-size:12px}.big{font-size:22px;font-weight:700;margin:8px 0 0}
      </style>
      <div class="card">
        <div class="row">
          <input id="file" type="file" accept=".csv,.txt" />
          <span id="fname" class="muted"></span>
        </div>
        <div id="drop" class="drop">CSV hierher ziehen</div>
        <div><div class="muted">Zeilen im File (ohne Header):</div><div id="count" class="big">0</div></div>
      </div>`;
    this._els={file:s.getElementById('file'),drop:s.getElementById('drop'),count:s.getElementById('count'),fname:s.getElementById('fname')};
  }
  connectedCallback(){
    const f=this._els.file,d=this._els.drop;
    f.addEventListener('change',()=>this._read(f.files&&f.files[0]));
    d.addEventListener('dragover',e=>{e.preventDefault();d.classList.add('drag')});
    d.addEventListener('dragleave',()=>d.classList.remove('drag'));
    d.addEventListener('drop',e=>{e.preventDefault();d.classList.remove('drag');this._read(e.dataTransfer.files&&e.dataTransfer.files[0])});
  }
  _emitProps(changes){ this.dispatchEvent(new CustomEvent('propertiesChanged',{detail:{properties:changes}})); }
  _read(file){
    if(!file) return;
    this._els.fname.textContent=file.name;
    const r=new FileReader();
    r.onload=e=>{
      const text=e.target.result;
      const n=this._count(text);
      this._els.count.textContent=String(n);
      this._emitProps({ rowCount: n, fileName: file.name });
      this.dispatchEvent(new CustomEvent('fileLoaded', { detail: { rowCount: n, fileName: file.name } }));
    };
    r.readAsText(file);
  }
  _count(text){
    const lines=text.split(/\r\n|\n|\r/);
    let i=0; while(i<lines.length && lines[i].trim()==="") i++;
    if(i>=lines.length) return 0;
    let c=0; for(let j=i+1;j<lines.length;j++){ if(lines[j].trim()!=="") c++; }
    return c;
  }
  getRowCount(){
    return this._els.count.textContent ? parseInt(this._els.count.textContent, 10) : 0;
  }

  getFileName(){
    return this._els.fname.textContent || "";
  }
}
customElements.define('csv-row-counter', CsvRowCounter);
