const API = {
    get: 'https://sy1x5211s6.execute-api.eu-west-2.amazonaws.com/default/GetImage',
    put: 'https://87j6oylht9.execute-api.eu-west-2.amazonaws.com/default/GeneratePresignedURL',
    s3: 'https://image-analysis-london-belal-2004.s3.eu-west-2.amazonaws.com'
};

let store = [];
let selectedFile = null;

const init = async () => {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const heights = [220, 320, 260, 340, 240, 300];
    for(let i=0; i<6; i++) {
        grid.innerHTML += `<div class="skeleton" style="height: ${heights[i]}px"></div>`;
    }

    try {
        const req = await fetch(API.get);
        const data = await req.json();
        store = data.reverse();
        render(store);
        if(!store.length) grid.innerHTML = `<div style="text-align:center;color:var(--text-light);padding:4rem;column-span:all;">No images found.</div>`;
    } catch(e) { console.error(e); notify('Error loading images'); }
};

const render = (items) => {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    items.forEach(item => {
        const url = `${API.s3}/${encodeURIComponent(item.image_name)}`;
        const tags = item.labels ? item.labels.slice(0,3).map(l => `<span class="tag">${l}</span>`).join('') : '';
        
        const el = document.createElement('div');
        el.className = 'card';
        el.onclick = () => { document.getElementById('modal-img').src = url; document.getElementById('modal').classList.add('open'); };
        
        el.innerHTML = `
            <img src="${url}" loading="lazy" onerror="this.closest('.card').remove()">
            <div class="card-details">
                <div class="card-title">${item.image_name}</div>
                <div class="card-tags">${tags}</div>
            </div>
        `;
        grid.appendChild(el);
    });
};

const filter = () => {
    const val = document.getElementById('search').value.toLowerCase();
    render(store.filter(i => i.image_name.toLowerCase().includes(val) || (i.labels && i.labels.some(l => l.toLowerCase().includes(val)))));
};

const handleFileSelect = (el) => {
    const file = el.files[0];
    if(file) {
        selectedFile = file;
        notify(`Selected: ${file.name}`);
        const btn = document.getElementById('upload-btn');
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.innerText = `Upload ${file.name.substring(0, 10)}...`;
    }
};

const triggerUpload = async () => {
    if(!selectedFile) return notify('Please pick a file first');
    
    const file = selectedFile;
    notify('Preparing upload...');
    
    try {
        const r1 = await fetch(`${API.put}?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}`);
        if(!r1.ok) throw new Error();
        const { uploadURL } = await r1.json();
        
        notify('Uploading to cloud...');
        const r2 = await fetch(uploadURL, { method: 'PUT', headers: {'Content-Type': file.type}, body: file });
        
        if(r2.ok) {
            notify('Success! Analyzing...');
            selectedFile = null;
            document.getElementById('upload').value = '';
            const btn = document.getElementById('upload-btn');
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.innerText = 'Upload';
            setTimeout(init, 3500);
        } else throw new Error();
    } catch(e) { notify('Upload failed'); }
};

const tab = (v) => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${v}"]`).classList.add('active');
    document.getElementById('view-gallery').style.display = v === 'gallery' ? 'block' : 'none';
    document.getElementById('view-about').style.display = v === 'about' ? 'block' : 'none';
};

const toggleTheme = () => {
    document.body.hasAttribute('data-theme') ? document.body.removeAttribute('data-theme') : document.body.setAttribute('data-theme', 'dark');
};

const notify = (msg) => {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
};

const closeModal = (e) => {
    if(!e || e.target === document.getElementById('modal') || e.target.classList.contains('close-btn')) {
        document.getElementById('modal').classList.remove('open');
    }
};

init();