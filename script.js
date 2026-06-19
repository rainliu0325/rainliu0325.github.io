const products = [
        { id: 'p1', name: 'Vintage Denim Jacket', category: 'clothing', price: 59, original: 189, icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z', desc: 'Classic 90s wash, light wear', size: 'L', condition: 'good' },
        { id: 'p2', name: 'Leather Lace Boots', category: 'shoes', price: 89, original: 320, icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z', desc: 'Genuine leather, vibram sole', size: 'EU 42 / UK 8', condition: 'very good' },
        { id: 'p3', name: 'Organic Cotton Sweater', category: 'clothing', price: 34, original: 120, icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z', desc: 'Cream wool blend, soft', size: 'M', condition: 'like new' },
        { id: 'p4', name: 'Vintage Film Camera', category: 'electronics', price: 145, original: 450, icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z', desc: 'Canon AE-1, tested working', size: null, condition: 'excellent' },
        { id: 'p5', name: 'Ceramic Planters Set', category: 'home', price: 28, original: 79, icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z', desc: 'Set of 3 handmade pots', size: null, condition: 'new' },
        { id: 'p6', name: 'Cashmere Blend Scarf', category: 'clothing', price: 24, original: 110, icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z', desc: 'Soft grey, unisex', size: 'One size', condition: 'gently used' }
    ];
    
    let groceryList = JSON.parse(localStorage.getItem('groceryList') || '{}');
    let checklistState = JSON.parse(localStorage.getItem('checklistState') || '{}');
    let currentCategory = 'all', currentSearch = '', currentSort = 'default';
    let currentDetail = null;

    function saveGrocery() { 
        localStorage.setItem('groceryList', JSON.stringify(groceryList)); 
        localStorage.setItem('checklistState', JSON.stringify(checklistState));
        updateGroceryUI(); 
    }
    
    function updateGroceryUI() { 
        let total = 0, count = 0;
        const container = document.getElementById('cartItems'); 
        if(Object.keys(groceryList).length === 0) { 
            if(container) container.innerHTML = '<p style="text-align:center; opacity:0.7;">your checklist is empty</p>'; 
        } else { 
            container.innerHTML = Object.entries(groceryList).map(([id, item]) => {
                count += item.qty; 
                total += item.price * item.qty;
                const isChecked = checklistState[id] || false;
                return `<div class="checklist-item ${isChecked ? 'checked-item' : ''}" data-id="${id}">
                            <input type="checkbox" class="item-checkbox" data-id="${id}" ${isChecked ? 'checked' : ''} onchange="toggleChecklistItem('${id}', this.checked)">
                            <div class="item-details">
                                <span class="item-name">${escapeHtml(item.name)}</span>
                                <span class="item-price">¥${item.price}</span>
                                <div class="item-actions">
                                    <button onclick="updateQty('${id}', -1)">-</button>
                                    <span style="min-width: 28px; text-align: center;">${item.qty}</span>
                                    <button onclick="updateQty('${id}', 1)">+</button>
                                    <button onclick="removeItem('${id}')" style="background: none; color: #d9534f;">×</button>
                                </div>
                            </div>
                        </div>`;
            }).join(''); 
        } 
        document.getElementById('cartTotal').innerText = `¥${total.toFixed(2)}`; 
        document.getElementById('cartBadge').innerText = count;
        if(document.getElementById('totalOrders')) {
            document.getElementById('totalOrders').innerText = Object.keys(groceryList).length;
            document.getElementById('totalSpent').innerText = `¥${total.toFixed(2)}`;
            let recentDiv = document.getElementById('recentOrders');
            if(recentDiv) {
                recentDiv.innerHTML = Object.entries(groceryList).slice(0,5).map(([id,it]) => `<div style="padding:8px 0; border-bottom:1px solid var(--light); display:flex; align-items:center; gap:12px;"><input type="checkbox" ${checklistState[id]?'checked':''} onchange="toggleChecklistItem('${id}', this.checked)" style="accent-color:var(--primary);"> <span style="${checklistState[id]?'text-decoration:line-through; opacity:0.6;':''}">${it.name} ×${it.qty}</span></div>`).join('') || 'no items';
            }
        }
    }
    
    function toggleChecklistItem(id, checked) {
        checklistState[id] = checked;
        localStorage.setItem('checklistState', JSON.stringify(checklistState));
        updateGroceryUI();
    }
    
    function removeItem(id) {
        delete groceryList[id];
        delete checklistState[id];
        saveGrocery();
        toast('item removed from list');
    }
    
    function updateQty(id, delta) { 
        if(groceryList[id]) { 
            groceryList[id].qty += delta; 
            if(groceryList[id].qty <= 0) {
                delete groceryList[id];
                delete checklistState[id];
            }
            saveGrocery(); 
        } 
    }
    
    function addToList(id, name, price) { 
        if(groceryList[id]) {
            groceryList[id].qty++; 
        } else { 
            groceryList[id] = {name, price, qty: 1};
            checklistState[id] = false;
        }
        saveGrocery(); 
        toast(`added ${name} to checklist`); 
    }
    
    function escapeHtml(str) { return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }
    function toast(m) { let t=document.createElement('div'); t.className='toast'; t.innerText=m; document.body.appendChild(t); setTimeout(()=>t.remove(),2100); }

    function renderProducts(filtered) { 
        const grid=document.getElementById('productGrid'); 
        const no=document.getElementById('noResults'); 
        if(!grid) return; 
        if(filtered.length===0){ grid.style.display='none'; no.style.display='block'; return; } 
        grid.style.display='grid'; no.style.display='none'; 
        grid.innerHTML=filtered.map(p=>`<div class="product-card scroll-element up" onclick="openDetail('${p.id}')"><div class="product-badge">pre-loved</div><div class="product-icon"><svg viewBox="0 0 24 24" width="52" height="52" fill="var(--primary)"><path d="${p.icon}"/></svg></div><div class="product-title">${escapeHtml(p.name)}</div>${p.size ? `<div class="product-size-tag">size: ${escapeHtml(p.size)}</div>` : ''}<div class="product-price">¥${p.price}</div><div style="text-decoration:line-through; font-size:0.75rem; opacity:0.6;">¥${p.original}</div><button class="add-btn" onclick="event.stopPropagation(); addToList('${p.id}','${escapeHtml(p.name)}',${p.price})">add to checklist</button></div>`).join(''); 
        setTimeout(checkScroll,50); 
    }
    
    function filterProducts(){ 
        let f=products.slice(); 
        if(currentCategory!=='all') f=f.filter(p=>p.category===currentCategory); 
        if(currentSearch) f=f.filter(p=>p.name.toLowerCase().includes(currentSearch.toLowerCase())); 
        if(currentSort==='price-low') f.sort((a,b)=>a.price-b.price); 
        else if(currentSort==='price-high') f.sort((a,b)=>b.price-a.price); 
        else if(currentSort==='name') f.sort((a,b)=>a.name.localeCompare(b.name)); 
        renderProducts(f); 
    }
    
    function setCategory(cat){ currentCategory=cat; document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active')); document.querySelector(`.filter-chip[data-cat="${cat}"]`)?.classList.add('active'); filterProducts(); }
    
    function openDetail(id){ currentDetail=products.find(p=>p.id===id); if(!currentDetail) return; document.getElementById('detailIcon').innerHTML=`<svg viewBox="0 0 24 24" width="140" height="140" fill="var(--primary)"><path d="${currentDetail.icon}"/></svg>`; document.getElementById('detailName').innerText=currentDetail.name; document.getElementById('detailPrice').innerHTML=`¥${currentDetail.price}`; document.getElementById('detailOriginal').innerHTML=`¥${currentDetail.original}`; let sizeHtml=currentDetail.size?`<div class="product-size-tag" style="margin:10px 0;">size: ${currentDetail.size}</div>`:''; document.getElementById('detailMeta').innerHTML=sizeHtml; document.getElementById('detailDesc').innerText=currentDetail.desc; document.getElementById('productDetail').classList.add('active'); document.body.style.overflow='hidden'; }
    function closeDetail(){ document.getElementById('productDetail').classList.remove('active'); document.body.style.overflow=''; }

    let users=JSON.parse(localStorage.getItem('users')||'{}');
    function saveUsers(u){ localStorage.setItem('users',JSON.stringify(u)); }
    function showDashboard(phone){ let u=users[phone]; if(u){ document.getElementById('welcomeName').innerText=u.name; document.getElementById('welcomePhone').innerText=u.phone; updateGroceryUI(); if(u.avatarData) document.getElementById('avatarPreview').innerHTML=`<img src="${u.avatarData}" style="width:100%;height:100%;object-fit:cover;">`; else document.getElementById('avatarPreview').innerHTML='<span class="material-symbols-rounded" style="font-size:38px;">person</span>'; } document.getElementById('loginBox').style.display='none'; document.getElementById('signupBox').style.display='none'; document.getElementById('dashboard').style.display='block'; }
    
    document.getElementById('loginBtn')?.addEventListener('click',()=>{ let ph=document.getElementById('loginPhone').value, pwd=document.getElementById('loginPassword').value; if(users[ph] && users[ph].password===pwd){ localStorage.setItem('currentUser',ph); showDashboard(ph); toast('welcome back'); } else toast('invalid credentials'); });
    document.getElementById('signupBtn')?.addEventListener('click',()=>{ let name=document.getElementById('signupName').value, ph=document.getElementById('signupPhone').value, pwd=document.getElementById('signupPassword').value; if(!name||!ph||!pwd){toast('fill all fields'); return;} if(users[ph]){toast('user exists'); return;} users[ph]={name,phone:ph,password:pwd,avatarData:null,memberSince:new Date().toLocaleDateString()}; saveUsers(users); localStorage.setItem('currentUser',ph); showDashboard(ph); toast(`welcome ${name}`); });
    document.getElementById('showSignup')?.addEventListener('click',(e)=>{e.preventDefault(); document.getElementById('loginBox').style.display='none'; document.getElementById('signupBox').style.display='block';});
    document.getElementById('showLogin')?.addEventListener('click',(e)=>{e.preventDefault(); document.getElementById('loginBox').style.display='block'; document.getElementById('signupBox').style.display='none';});
    document.getElementById('logoutBtn')?.addEventListener('click',()=>{localStorage.removeItem('currentUser'); document.getElementById('dashboard').style.display='none'; document.getElementById('loginBox').style.display='block'; toast('logged out');});
    document.getElementById('avatarFile')?.addEventListener('change',(e)=>{ let f=e.target.files[0]; if(f){ let rd=new FileReader(); rd.onload=ev=>{ let cur=localStorage.getItem('currentUser'); if(cur && users[cur]){ users[cur].avatarData=ev.target.result; saveUsers(users); document.getElementById('avatarPreview').innerHTML=`<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`; toast('avatar updated'); } }; rd.readAsDataURL(f); } });
    let saved=localStorage.getItem('currentUser'); if(saved && users[saved]) showDashboard(saved); else { document.getElementById('loginBox').style.display='block'; document.getElementById('dashboard').style.display='none'; }

    (function(){let c=document.getElementById('particleCanvas'),ctx=c.getContext('2d'),p=[],mx=0,my=0; function resize(){c.width=window.innerWidth;c.height=window.innerHeight;} class P{constructor(){this.x=Math.random()*c.width;this.y=Math.random()*c.height;this.s=Math.random()*2+1;this.vx=(Math.random()-0.5)*0.2;this.vy=(Math.random()-0.5)*0.2;this.c=`rgba(45,106,79,${Math.random()*0.3+0.1})`;} update(){this.x+=this.vx;this.y+=this.vy;let dx=mx-this.x,dy=my-this.y,d=Math.hypot(dx,dy);if(d<100){let f=(100-d)/100;this.x-=Math.cos(Math.atan2(dy,dx))*f*1.2;this.y-=Math.sin(Math.atan2(dy,dx))*f*1.2;}if(this.x<0)this.x=c.width;if(this.x>c.width)this.x=0;if(this.y<0)this.y=c.height;if(this.y>c.height)this.y=0;} draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.s,0,Math.PI*2);ctx.fillStyle=this.c;ctx.fill();}}function init(){p=[];for(let i=0;i<100;i++)p.push(new P());}function anim(){ctx.clearRect(0,0,c.width,c.height);p.forEach(pp=>{pp.update();pp.draw();});requestAnimationFrame(anim);}window.addEventListener('resize',()=>{resize();init();});window.addEventListener('mousemove',(e)=>{mx=e.clientX;my=e.clientY;});resize();init();anim();})();
    
    function toggleTheme(){ document.documentElement.classList.toggle('dark'); setTimeout(checkScroll,50); }
    function checkScroll(){ document.querySelectorAll('.scroll-element').forEach(el=>{ let r=el.getBoundingClientRect(); if(r.top<window.innerHeight-80) el.classList.add('scrolled'); else el.classList.remove('scrolled'); }); }
    window.addEventListener('scroll',checkScroll); window.addEventListener('resize',checkScroll);
    let slideIndex=0, holder=document.querySelector('.home-slider-holder'); function showSlide(i){ if(holder) holder.style.transform=`translateX(-${i*100}%)`; } function slideLeft(){ slideIndex=(slideIndex-1+3)%3; showSlide(slideIndex); } function slideRight(){ slideIndex=(slideIndex+1)%3; showSlide(slideIndex); } let autoSlide=setInterval(slideRight,5500); document.querySelector('.home-slider')?.addEventListener('mouseenter',()=>clearInterval(autoSlide)); document.querySelector('.home-slider')?.addEventListener('mouseleave',()=>autoSlide=setInterval(slideRight,5500));
    function changePage(p){ document.querySelectorAll('.page').forEach(page=>page.classList.remove('active-page')); document.getElementById(`page${p}`).classList.add('active-page'); document.querySelectorAll('.sidenav div a').forEach(l=>l.classList.remove('active')); document.querySelector(`.sidenav div a[data-page="${p}"]`)?.classList.add('active'); window.scrollTo(0,0); setTimeout(checkScroll,80); }
    function changePageWithNav(p){ changePage(p); toggleNav(); }
    function toggleNav(){ let sn=document.querySelector('.sidenav'),ov=document.getElementById('overlay'); if(sn.style.left==='0px'){ sn.style.left='-300px'; ov.style.opacity=0; ov.style.pointerEvents='none'; }else{ sn.style.left='0px'; ov.style.opacity=1; ov.style.pointerEvents='all'; } }
    document.getElementById('cartBtn').onclick=()=>document.getElementById('cartSidebar').classList.add('open'); document.getElementById('closeCart').onclick=()=>document.getElementById('cartSidebar').classList.remove('open'); 
    document.getElementById('checkoutBtn').onclick=()=>{ 
        let toDelete = Object.keys(groceryList).filter(id => checklistState[id] === true);
        toDelete.forEach(id => { delete groceryList[id]; delete checklistState[id]; });
        saveGrocery(); 
        toast('checked items removed'); 
    };
    
    const detailDiv=document.createElement('div'); detailDiv.className='product-detail'; detailDiv.id='productDetail'; detailDiv.innerHTML=`<div class="close-detail" onclick="closeDetail()"><span class="material-symbols-rounded">close</span></div><div class="detail-container"><div class="detail-grid"><div class="detail-icon" id="detailIcon"></div><div><div style="background:var(--primary-dark); display:inline-block; padding:4px 14px; border-radius:40px; font-size:0.75rem;">secondhand</div><h2 id="detailName" style="margin-top:12px;"></h2><div id="detailPrice" style="font-size:1.8rem; color:var(--primary); margin:10px 0;"></div><div id="detailOriginal" style="text-decoration:line-through;"></div><div id="detailMeta"></div><p id="detailDesc" style="margin:18px 0;"></p><button class="btn-primary" id="detailAddBtn" style="width:100%;">add to checklist</button></div></div></div>`; document.body.appendChild(detailDiv); document.getElementById('detailAddBtn').onclick=()=>{ if(currentDetail) addToList(currentDetail.id,currentDetail.name,currentDetail.price); closeDetail(); };
    const cats=[{id:'all',label:'all'},{id:'clothing',label:'clothing'},{id:'shoes',label:'shoes'},{id:'electronics',label:'electronics'},{id:'home',label:'home'}]; document.getElementById('filterGroup').innerHTML=cats.map(c=>`<div class="filter-chip ${c.id==='all'?'active':''}" data-cat="${c.id}" onclick="setCategory('${c.id}')">${c.label}</div>`).join(''); document.getElementById('searchInput').addEventListener('keyup',(e)=>{currentSearch=e.target.value;filterProducts();}); document.getElementById('sortSelect').addEventListener('change',(e)=>{currentSort=e.target.value;filterProducts();}); filterProducts(); updateGroceryUI(); checkScroll(); changePage(0);
    
    window.changePage=changePage; window.changePageWithNav=changePageWithNav; window.toggleTheme=toggleTheme; window.toggleNav=toggleNav; window.slideLeft=slideLeft; window.slideRight=slideRight; window.setCategory=setCategory; window.filterProducts=filterProducts; window.openDetail=openDetail; window.closeDetail=closeDetail; window.addToList=addToList; window.updateQty=updateQty; window.toggleChecklistItem=toggleChecklistItem; window.removeItem=removeItem;
